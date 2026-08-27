#!/usr/bin/env python3
"""
Search leads via SerpApi (Google Maps) + Google Maps Scraper + Supabase.
Zero AI, pure data extraction. Runs in GitHub Actions free tier.
"""

import os
import re
import sys
import json
import time
import subprocess
import requests
from typing import Optional, List, Dict, Any
from supabase import create_client, Client


# ─── Config ──────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, SERPAPI_KEY]):
    print("❌ Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, SERPAPI_KEY")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


# ─── Helpers ─────────────────────────────────────────────────────────────
PHONE_RE = re.compile(r"(?:(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4})")
INSTA_RE = re.compile(r'instagram\.com/([^/"\'\s?#]+)', re.I)
FACE_RE = re.compile(r'facebook\.com/([^/"\'\s?#]+)', re.I)


def is_valid_br_phone(phone: str) -> bool:
    digits = re.sub(r"\D", "", phone)
    return 10 <= len(digits) <= 11 and not re.match(r"^(\d)\1+$", digits)


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 11:
        return f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
    if len(digits) == 10:
        return f"({digits[:2]}) {digits[2:6]}-{digits[6:]}"
    return phone.strip()


def check_url_exists(url: str, timeout: int = 5) -> bool:
    try:
        r = requests.head(url, timeout=timeout, allow_redirects=True)
        return r.status_code < 400
    except Exception:
        return False


def extract_socials_from_html(html: str) -> tuple[str, str]:
    insta = INSTA_RE.search(html)
    face = FACE_RE.search(html)
    return (
        f"@{insta.group(1)}" if insta else "",
        face.group(1) if face else ""
    )


# ─── SerpApi Google Maps Search ──────────────────────────────────────────
def search_google_maps(niche: str, city: str, limit: int = 20) -> List[Dict]:
    """Use SerpApi to search Google Maps for place_ids."""
    from serpapi import GoogleSearch

    # Coordinates for major BR cities
    coords = {
        "são paulo": "@-23.5505,-46.6333,12z",
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
    ll = coords.get(city.lower(), "@-23.5505,-46.6333,12z")

    search = GoogleSearch({
        "q": f"{niche} {city} Brazil",
        "engine": "google_maps",
        "type": "search",
        "ll": ll,
        "api_key": SERPAPI_KEY,
    })

    results = search.get_dict()
    places = results.get("local_results", [])
    print(f"📍 SerpApi returned {len(places)} places")
    return places[:limit]


# ─── Google Maps Scraper (via subprocess) ────────────────────────────────
def run_maps_scraper(place_ids: List[str]) -> List[Dict]:
    """Run the open-source google-maps-scraper for each place_id."""
    if not place_ids:
        return []

    # Write place_ids to temp file
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as f:
        f.write("\n".join(place_ids))
        ids_file = f.name

    try:
        # Run scraper: outputs JSON lines to stdout
        cmd = [
            sys.executable, "-m", "googlemaps_scraper",
            "--input", ids_file,
            "--output", "json",
        ]
        print(f"🔧 Running scraper for {len(place_ids)} places...")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)

        if result.returncode != 0:
            print(f"⚠️ Scraper stderr: {result.stderr[:500]}")
            return []

        # Parse JSON lines output
        leads = []
        for line in result.stdout.strip().split("\n"):
            if line.strip():
                try:
                    leads.append(json.loads(line))
                except json.JSONDecodeError:
                    pass
        print(f"✅ Scraper returned {len(leads)} enriched places")
        return leads

    except subprocess.TimeoutExpired:
        print("❌ Scraper timeout")
        return []
    except Exception as e:
        print(f"❌ Scraper error: {e}")
        return []


# ─── Firecrawl Keyless (optional enrichment) ─────────────────────────────
def enrich_with_firecrawl(website: str) -> tuple[str, str]:
    """Use Firecrawl Keyless to scrape website for phone/socials."""
    if not website:
        return "", ""
    try:
        resp = requests.post(
            "https://api.firecrawl.dev/v2/scrape",
            headers={"Content-Type": "application/json"},
            json={
                "url": website,
                "formats": ["markdown"],
                "onlyMainContent": True,
            },
            timeout=30,
        )
        if not resp.ok:
            return "", ""
        data = resp.json()
        markdown = data.get("data", {}).get("markdown", "")
        phone_match = PHONE_RE.search(markdown)
        insta, face = extract_socials_from_html(markdown)
        return normalize_phone(phone_match.group(0)) if phone_match else "", insta or face
    except Exception:
        return "", ""


# ─── Main Pipeline ───────────────────────────────────────────────────────
def main(niche: str, city: str, user_id: str):
    print(f"🔍 Iniciando busca: {niche} em {city} (user: {user_id})")

    # 1. Search Google Maps via SerpApi
    places = search_google_maps(niche, city)
    if not places:
        print("⚠️ Nenhum lugar encontrado")
        return

    # 2. Collect place_ids for scraper
    place_ids = [p.get("place_id") for p in places if p.get("place_id")]
    print(f"📋 {len(place_ids)} place_ids para enriquecer")

    # 3. Run Google Maps Scraper for detailed data
    scraped = run_maps_scraper(place_ids)
    scraped_by_id = {s.get("place_id"): s for s in scraped if s.get("place_id")}

    # 4. Build leads combining SerpApi + Scraper + validations
    leads = []
    for place in places:
        pid = place.get("place_id")
        enriched = scraped_by_id.get(pid, {})

        # Phone: prefer scraper, fallback to SerpApi, validate
        phone = enriched.get("phone") or place.get("phone") or ""
        phone = normalize_phone(phone) if is_valid_br_phone(phone) else ""

        # Website: prefer scraper, fallback to SerpApi, verify HTTP
        website = enriched.get("website") or place.get("website") or ""
        if website and not check_url_exists(website):
            website = ""

        # Socials: try website scrape if we have one
        insta, face = "", ""
        if website:
            extra_phone, social = enrich_with_firecrawl(website)
            if extra_phone and not phone:
                phone = extra_phone
            if social and not insta:
                insta = social

        # Address
        address = enriched.get("address") or place.get("address") or ""

        lead = {
            "user_id": user_id,
            "name": place.get("title") or enriched.get("name") or "Sem nome",
            "category": niche,
            "address": address,
            "city": city,
            "state": "SP" if "sao" in city.lower() or "paulo" in city.lower() else "",
            "phone": phone,
            "website": website,
            "rating": str(enriched.get("rating") or place.get("rating") or ""),
            "reviews_count": str(enriched.get("reviews") or place.get("reviews") or ""),
            "instagram": insta,
            "facebook": face,
            "source": "google_maps",
            "source_place_id": pid,
            "hours": json.dumps(enriched.get("hours") or place.get("hours") or {}),
        }
        leads.append(lead)

    # 5. Bulk upsert to Supabase (on_conflict = source_place_id)
    if leads:
        print(f"💾 Salvando {len(leads)} leads no Supabase...")
        result = supabase.table("leads").upsert(
            leads, on_conflict="source_place_id"
        ).execute()
        print(f"✅ {len(result.data)} leads salvos/atualizados")
    else:
        print("⚠️ Nenhum lead válido para salvar")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Uso: python search_leads.py <niche> <city> <user_id>")
        sys.exit(1)

    niche, city, user_id = sys.argv[1], sys.argv[2], sys.argv[3]
    main(niche, city, user_id)