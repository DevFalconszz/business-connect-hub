#!/usr/bin/env python3
"""
Busca de leads via SerpApi (Google Maps) + enriquecimento por HTTP + Supabase.
Sem IA, dados reais extraídos. Executado no GitHub Actions (free tier).
"""

import os
import re
import sys
import json
import requests
from typing import Optional, List, Dict, Any
from supabase import create_client, Client

# ─── Config ──────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, SERPAPI_KEY]):
    print("FALTANDO_ENV SUPABASE_URL, SUPABASE_SERVICE_KEY, SERPAPI_KEY")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ─── Helpers ─────────────────────────────────────────────────────────────
PHONE_RE = re.compile(r"(?:(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4})")
INSTA_RE = re.compile(r'instagram\.com/([^/"\'\s?#]+)', re.I)
FACE_RE = re.compile(r'facebook\.com/([^/"\'\s?#]+)', re.I)


def is_valid_br_phone(phone: str) -> bool:
    d = re.sub(r"\D", "", phone)
    if (len(d) == 12 or len(d) == 13) and d.startswith("55"):
        d = d[2:]
    return (len(d) == 10 or len(d) == 11) and not re.match(r"^(\d)\1+$", d)


def normalize_phone(phone: str) -> str:
    d = re.sub(r"\D", "", phone)
    if (len(d) == 12 or len(d) == 13) and d.startswith("55"):
        d = d[2:]
    if len(d) == 11:
        return f"({d[:2]}) {d[2:7]}-{d[7:]}"
    if len(d) == 10:
        return f"({d[:2]}) {d[2:6]}-{d[6:]}"
    return phone.strip()


def check_url_exists(url: str, timeout: int = 6) -> bool:
    try:
        r = requests.head(url, timeout=timeout, allow_redirects=True)
        return r.status_code < 400
    except Exception:
        return False


def enrich_website(website: str) -> tuple[str, str, str]:
    """Baixa o site (se possivel) e descobre telefone/instagram/facebook."""
    if not website:
        return "", "", ""
    try:
        resp = requests.get(website, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code >= 400:
            return "", "", ""
        html = resp.text[:200000]
        phone = ""
        pm = PHONE_RE.search(html)
        if pm:
            maybe = normalize_phone(pm.group(0))
            if is_valid_br_phone(maybe):
                phone = maybe
        insta = INSTA_RE.search(html)
        face = FACE_RE.search(html)
        return (
            phone,
            f"@{insta.group(1)}" if insta else "",
            face.group(1) if face else "",
        )
    except Exception:
        return "", "", ""


# ─── SerpApi Google Maps Search ──────────────────────────────────────────
COORDS = {
    "são paulo": "@-23.5505,-46.6333,12z",
    "sao paulo": "@-23.5505,-46.6333,12z",
    "rio de janeiro": "@-22.9068,-43.1729,12z",
    "belo horizonte": "@-19.9167,-43.9345,12z",
    "brasília": "@-15.7939,-47.8828,12z",
    "salvador": "@-12.9714,-38.5014,12z",
    "fortaleza": "@-3.7319,-38.5267,12z",
    "curitiba": "@-25.4284,-49.2733,12z",
    "recife": "@-8.0476,-34.8770,12z",
    "porto alegre": "@-30.0346,-51.2177,12z",
    "manaus": "@-3.1190,-60.0217,12z",
}


def search_google_maps(niche: str, city: str, limit: int = 20) -> List[Dict]:
    """Busca lugares no Google Maps via SerpApi."""
    from serpapi import GoogleSearch

    ll = COORDS.get(city.lower(), "@-23.5505,-46.6333,12z")
    search = GoogleSearch({
        "q": f"{niche} {city} Brazil",
        "engine": "google_maps",
        "type": "search",
        "ll": ll,
        "api_key": SERPAPI_KEY,
    })
    results = search.get_dict()
    places = results.get("local_results", [])
    print(f"LOCAIS SerpApi retornou {len(places)} lugares")
    return places[:limit]


# ─── Pipeline principal ──────────────────────────────────────────────────
def main(niche: str, city: str, user_id: str):
    print(f"INICIO busca: {niche} em {city} (user: {user_id})")

    places = search_google_maps(niche, city)
    if not places:
        print("SEM_RESULTADOS")
        return

    leads = []
    for place in places:
        # Dados vindos direto do SerpApi (Google Maps)
        name = place.get("title") or ""
        address = place.get("address") or ""
        state = place.get("state") or ""
        place_id = place.get("place_id") or ""

        phone_raw = place.get("phone") or ""
        phone = normalize_phone(phone_raw) if is_valid_br_phone(phone_raw) else ""

        website = place.get("website") or ""
        if website and not check_url_exists(website):
            website = ""

        # Enriquecimento no website (telefone/social) se ainda faltar algo
        insta, face, extra_phone = "", "", ""
        if website:
            extra_phone, insta, face = enrich_website(website)
            if extra_phone and not phone:
                phone = extra_phone

        leads.append({
            "user_id": user_id,
            "name": name or "Sem nome",
            "category": niche,
            "address": address,
            "city": city,
            "state": state,
            "phone": phone,
            "website": website,
            "google_maps_url": place.get("link") or "",
            "rating": str(place.get("rating") or ""),
            "reviews_count": str(place.get("reviews") or ""),
            "instagram": insta,
            "facebook": face,
            "responsavel": "",
            "descricao": "",
            "status": "none",
            "whatsapp_group": "",
            "meeting_dates": [],
            "nome_decisor": "",
            "numero_decisor": "",
            "source": "google_maps",
            "source_place_id": place_id,
        })

    if not leads:
        print("SEM_LEADS_VALIDOS")
        return

    print(f"INSERINDO {len(leads)} leads no Supabase...")
    result = supabase.table("leads").upsert(
        leads, on_conflict="source_place_id"
    ).execute()
    print(f"SUCESSO {len(result.data)} leads salvos/atualizados")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Uso: python search_leads.py <niche> <city> <user_id>")
        sys.exit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3])
