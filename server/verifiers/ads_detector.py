"""
Ads Detector - Detecta se um site possui anúncios Google Ads.

Métodos:
1. Análise do código-fonte - Busca por scripts de Google Ads
2. Verificação de tags de rastreamento
3. Detecção de Google Tag Manager
"""

import httpx
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin


# Padrões que indicam presença de Google Ads
GOOGLE_ADS_PATTERNS = {
    "google_ads": [
        r"google[\._/]?ads",
        r"googlesyndication\.com",
        r"googleadservices\.com",
        r"pagead2\.googlesyndication",
        r"adsbygoogle",
        r"ca-pub-\d+",
        r"data-ad-client",
        r"data-ad-slot",
    ],
    "google_tag_manager": [
        r"googletagmanager\.com",
        r"GTM-[A-Z0-9]+",
        r"gtag\(",
        r"ga\('send'",
    ],
    "google_analytics": [
        r"google-analytics\.com",
        r"analytics\.js",
        r"gtag\.js",
        r"UA-\d+-\d+",
        r"G-[A-Z0-9]+",
    ],
    "meta_pixel": [
        r"facebook\.net/en_US/fbevents",
        r"fbq\(",
        r"pixel\.facebook\.com",
        r"connect\.facebook\.net",
    ],
    "microsoft_ads": [
        r"bat\.bing\.com",
        r"clarity\.ms",
        r"uetq\.bing\.com",
    ],
}


def fetch_page_source(url: str, timeout: float = 10.0) -> str:
    """Busca o código-fonte de uma página."""
    if not url:
        return ""
    
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    
    try:
        with httpx.Client(
            follow_redirects=True,
            timeout=timeout,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
            }
        ) as client:
            response = client.get(url)
            if response.status_code < 400:
                return response.text
    except Exception:
        pass
    
    return ""


def detect_patterns(html: str) -> dict:
    """Detecta padrões de anúncios no HTML."""
    if not html:
        return {category: False for category in GOOGLE_ADS_PATTERNS}
    
    results = {}
    for category, patterns in GOOGLE_ADS_PATTERNS.items():
        found = False
        for pattern in patterns:
            if re.search(pattern, html, re.IGNORECASE):
                found = True
                break
        results[category] = found
    
    return results


def extract_ad_details(html: str) -> dict:
    """Extrai detalhes específicos sobre os anúncios encontrados."""
    details = {
        "google_adsense_id": "",
        "gtm_id": "",
        "ga_tracking_id": "",
        "meta_pixel_id": "",
        "ad_scripts_count": 0,
    }
    
    if not html:
        return details
    
    # Google AdSense ID
    adsense_match = re.search(r"ca-pub-(\d+)", html)
    if adsense_match:
        details["google_adsense_id"] = f"ca-pub-{adsense_match.group(1)}"
    
    # GTM ID
    gtm_match = re.search(r"GTM-([A-Z0-9]+)", html)
    if gtm_match:
        details["gtm_id"] = f"GTM-{gtm_match.group(1)}"
    
    # Google Analytics ID
    ga_match = re.search(r"(UA-\d+-\d+|G-[A-Z0-9]+)", html)
    if ga_match:
        details["ga_tracking_id"] = ga_match.group(1)
    
    # Meta Pixel ID
    pixel_match = re.search(r"pixelID['\"]\s*:\s*['\"]?(\d+)", html)
    if pixel_match:
        details["meta_pixel_id"] = pixel_match.group(1)
    
    # Conta scripts de ads
    adsense_scripts = re.findall(r"adsbygoogle", html, re.IGNORECASE)
    details["ad_scripts_count"] = len(adsense_scripts)
    
    return details


def detect_google_ads(website_url: str) -> dict:
    """
    Detecta se um site possui anúncios Google Ads.
    
    Args:
        website_url: URL do site a ser analisado
        
    Returns:
        dict com:
        - has_google_ads: bool
        - has_google_tag_manager: bool
        - has_google_analytics: bool
        - has_meta_pixel: bool
        - has_microsoft_ads: bool
        - details: dict com IDs e contadores encontrados
        - confidence: float (0-1) - confiança na detecção
    """
    if not website_url:
        return {
            "has_google_ads": False,
            "has_google_tag_manager": False,
            "has_google_analytics": False,
            "has_meta_pixel": False,
            "has_microsoft_ads": False,
            "details": {},
            "confidence": 0.0,
        }
    
    html = fetch_page_source(website_url)
    
    if not html:
        return {
            "has_google_ads": False,
            "has_google_tag_manager": False,
            "has_google_analytics": False,
            "has_meta_pixel": False,
            "has_microsoft_ads": False,
            "details": {"error": "Não foi possível acessar o site"},
            "confidence": 0.0,
        }
    
    patterns = detect_patterns(html)
    details = extract_ad_details(html)
    
    # Calcula confiança
    confidence = 0.0
    if patterns.get("google_ads"):
        confidence += 0.5
    if patterns.get("google_tag_manager"):
        confidence += 0.2
    if patterns.get("google_analytics"):
        confidence += 0.1
    if patterns.get("meta_pixel"):
        confidence += 0.1
    if patterns.get("microsoft_ads"):
        confidence += 0.1
    
    return {
        "has_google_ads": patterns.get("google_ads", False),
        "has_google_tag_manager": patterns.get("google_tag_manager", False),
        "has_google_analytics": patterns.get("google_analytics", False),
        "has_meta_pixel": patterns.get("meta_pixel", False),
        "has_microsoft_ads": patterns.get("microsoft_ads", False),
        "details": details,
        "confidence": min(confidence, 1.0),
    }


if __name__ == "__main__":
    # Teste rápido
    test_sites = [
        "google.com",
        "facebook.com",
        "sitequenaoexiste99999.com",
    ]
    
    for site in test_sites:
        print(f"\n{'='*50}")
        print(f"Site: {site}")
        result = detect_google_ads(site)
        print(f"Google Ads: {result['has_google_ads']}")
        print(f"GTM: {result['has_google_tag_manager']}")
        print(f"GA: {result['has_google_analytics']}")
        print(f"Meta Pixel: {result['has_meta_pixel']}")
        print(f"Confiança: {result['confidence']:.0%}")
