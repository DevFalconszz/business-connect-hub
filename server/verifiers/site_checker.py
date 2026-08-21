"""
Site Checker - Verifica se um website realmente existe.

Métodos:
1. DNS Resolution - Verifica se o domínio resolve
2. HTTP HEAD Request - Verifica se o servidor responde
"""

import socket
import httpx
from urllib.parse import urlparse
import re


def extract_domain(url: str) -> str:
    """Extrai o domínio de uma URL."""
    if not url:
        return ""
    
    # Remove protocol se existir
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
    
    try:
        parsed = urlparse(url)
        return parsed.hostname or ""
    except Exception:
        return ""


def check_dns(domain: str) -> bool:
    """Verifica se o domínio resolve via DNS."""
    if not domain:
        return False
    
    try:
        socket.gethostbyname(domain)
        return True
    except (socket.gaierror, socket.herror, OSError):
        return False


def check_http(url: str, timeout: float = 5.0) -> dict:
    """
    Verifica se o site responde via HTTP.
    
    Returns:
        dict com:
        - alive: bool - se o site responde
        - status_code: int - código HTTP
        - redirect_url: str - para onde redireciona (se aplicável)
        - has_content: bool - se tem conteúdo HTML
    """
    if not url:
        return {"alive": False, "status_code": 0, "redirect_url": "", "has_content": False}
    
    # Normaliza URL
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    
    result = {
        "alive": False,
        "status_code": 0,
        "redirect_url": "",
        "has_content": False,
    }
    
    try:
        with httpx.Client(
            follow_redirects=True,
            timeout=timeout,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        ) as client:
            # Primeiro tenta HEAD (mais rápido)
            response = client.head(url)
            result["status_code"] = response.status_code
            result["alive"] = response.status_code < 400
            
            if str(response.url) != url:
                result["redirect_url"] = str(response.url)
            
            # Se HEAD falhou, tenta GET
            if not result["alive"]:
                response = client.get(url)
                result["status_code"] = response.status_code
                result["alive"] = response.status_code < 400
            
            # Verifica se tem conteúdo HTML
            content_type = response.headers.get("content-type", "")
            if "text/html" in content_type:
                result["has_content"] = True
            elif result["alive"]:
                # Se respondeu mas não é HTML, ainda conta como vivo
                result["has_content"] = True
                
    except httpx.TimeoutException:
        result["alive"] = False
    except Exception as e:
        result["alive"] = False
    
    return result


def check_website(website_url: str) -> dict:
    """
    Verificação completa de um website.
    
    Args:
        website_url: URL ou domínio do site
        
    Returns:
        dict com:
        - exists: bool - se o site existe de fato
        - dns_resolves: bool - se o DNS resolve
        - http_alive: bool - se responde HTTP
        - status_code: int - código HTTP
        - domain: str - domínio extraído
    """
    if not website_url or not website_url.strip():
        return {
            "exists": False,
            "dns_resolves": False,
            "http_alive": False,
            "status_code": 0,
            "domain": "",
        }
    
    domain = extract_domain(website_url)
    
    # Verifica DNS
    dns_ok = check_dns(domain)
    
    # Verifica HTTP
    http_result = check_http(website_url)
    
    return {
        "exists": dns_ok and http_result["alive"],
        "dns_resolves": dns_ok,
        "http_alive": http_result["alive"],
        "status_code": http_result["status_code"],
        "domain": domain,
    }


if __name__ == "__main__":
    # Teste rápido
    test_urls = [
        "google.com",
        "www.restaurenteficticio123.com.br",
        "facebook.com",
        "sitequenaoexiste99999.com",
    ]
    
    for url in test_urls:
        result = check_website(url)
        print(f"\n{'='*50}")
        print(f"URL: {url}")
        print(f"DNS Resolve: {result['dns_resolves']}")
        print(f"HTTP Alive: {result['http_alive']}")
        print(f"Status: {result['status_code']}")
        print(f"Existe: {result['exists']}")
