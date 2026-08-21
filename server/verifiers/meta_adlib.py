"""
Meta Ad Library Checker - Verifica se um negócio possui anúncios ativos no Facebook/Instagram.

A API do Meta Ad Library é gratuita, mas requer um Access Token.
Para obter um token gratuito:
1. Crie um app em https://developers.facebook.com/
2. Vá em Configurações > Básico > Token de Acesso
3. Gere um token de curta duração e troque por um de longa duração

Documentação: https://developers.facebook.com/docs/marketing-api/ads-library-api
"""

import httpx
import os
from typing import Optional


# Configurações
META_ACCESS_TOKEN = os.getenv("META_ACCESS_TOKEN", "")
META_API_VERSION = "v19.0"
META_API_URL = f"https://graph.facebook.com/{META_API_VERSION}/ads_archive"


def search_meta_ads(
    business_name: str,
    country: str = "BR",
    access_token: Optional[str] = None,
) -> dict:
    """
    Busca anúncios ativos de um negócio no Meta Ad Library.
    
    Args:
        business_name: Nome do negócio para buscar
        country: Código do país (padrão: BR)
        access_token: Token de acesso (usa variável de ambiente se não fornecido)
        
    Returns:
        dict com:
        - has_active_ads: bool - se tem anúncios ativos
        - ads_count: int - quantidade de anúncios encontrados
        - ads: list - detalhes dos anúncios
        - error: str - mensagem de erro (se houver)
    """
    token = access_token or META_ACCESS_TOKEN
    
    if not token:
        return {
            "has_active_ads": False,
            "ads_count": 0,
            "ads": [],
            "error": "META_ACCESS_TOKEN não configurado. Veja meta_adlib.py para instruções.",
            "api_available": False,
        }
    
    try:
        params = {
            "search_terms": business_name,
            "search_type": "KEYWORD_UNORDERED",
            "ad_reached_countries": f'["{country}"]',
            "fields": "id,ad_creative_bodies,ad_creative_link_titles,ad_creative_link_descriptions,ad_creative_link_captions,ad_snapshot_url,page_name,page_id,bylines,delivery_info",
            "limit": 10,
            "access_token": token,
        }
        
        with httpx.Client(timeout=15.0) as client:
            response = client.get(META_API_URL, params=params)
            
            if response.status_code != 200:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
                error_msg = error_data.get("error", {}).get("message", f"HTTP {response.status_code}")
                return {
                    "has_active_ads": False,
                    "ads_count": 0,
                    "ads": [],
                    "error": f"Erro na API Meta: {error_msg}",
                    "api_available": True,
                }
            
            data = response.json()
            ads = data.get("data", [])
            
            # Formata os anúncios encontrados
            formatted_ads = []
            for ad in ads[:5]:  # Limita a 5 anúncios
                formatted_ads.append({
                    "id": ad.get("id", ""),
                    "page_name": ad.get("page_name", ""),
                    "page_id": ad.get("page_id", ""),
                    "snapshot_url": ad.get("ad_snapshot_url", ""),
                    "titles": ad.get("ad_creative_link_titles", []),
                    "descriptions": ad.get("ad_creative_link_descriptions", []),
                    "bodies": ad.get("ad_creative_bodies", []),
                    "bylines": ad.get("bylines", []),
                })
            
            return {
                "has_active_ads": len(ads) > 0,
                "ads_count": len(ads),
                "ads": formatted_ads,
                "error": None,
                "api_available": True,
            }
            
    except httpx.TimeoutException:
        return {
            "has_active_ads": False,
            "ads_count": 0,
            "ads": [],
            "error": "Timeout ao acessar Meta Ad Library",
            "api_available": True,
        }
    except Exception as e:
        return {
            "has_active_ads": False,
            "ads_count": 0,
            "ads": [],
            "error": str(e),
            "api_available": True,
        }


def get_ad_library_url(business_name: str, country: str = "BR") -> str:
    """Gera URL direta para o Meta Ad Library."""
    from urllib.parse import quote
    return f"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country={country}&q={quote(business_name)}"


if __name__ == "__main__":
    # Teste rápido
    test_businesses = [
        "Restaurante Bom Sabor",
        "Clínica Saúde Total",
    ]
    
    for business in test_businesses:
        print(f"\n{'='*50}")
        print(f"Negócio: {business}")
        result = search_meta_ads(business)
        print(f"Anúncios ativos: {result['has_active_ads']}")
        print(f"Quantidade: {result['ads_count']}")
        if result.get("error"):
            print(f"Erro: {result['error']}")
        print(f"URL Ad Library: {get_ad_library_url(business)}")
