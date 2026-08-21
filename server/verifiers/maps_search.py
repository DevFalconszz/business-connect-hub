"""
Google Maps Places Search - Busca estabelecimentos usando Google Maps API.

Google Places API (New) oferece:
- $200/mês de crédito gratuito (equivalente a ~10.000 buscas/mês)
- Documentação: https://developers.google.com/maps/documentation/places/web-service

Para usar:
1. Acesse https://console.cloud.google.com/
2. Crie um projeto ou selecione um existente
3. Ative a "Places API"
4. Crie uma chave de API em "Credenciais"
5. Configure a variável de ambiente GOOGLE_MAPS_API_KEY
"""

import httpx
import os
from typing import Optional


# Configurações
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
PLACES_TEXT_SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"
PLACES_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


def search_businesses_maps(
    query: str,
    city: str = "",
    state: str = "",
    country: str = "Brazil",
    api_key: Optional[str] = None,
    limit: int = 20,
) -> dict:
    """
    Busca estabelecimentos usando Google Places API.
    
    Args:
        query: Termo de busca (ex: "Clínica Odontológica")
        city: Cidade
        state: Estado
        country: País
        api_key: Chave da API Google Maps
        limit: Limite de resultados
        
    Returns:
        dict com:
        - success: bool
        - data: list de estabelecimentos
        - error: str (se houver)
    """
    key = api_key or GOOGLE_MAPS_API_KEY
    
    if not key:
        return {
            "success": False,
            "data": [],
            "error": "GOOGLE_MAPS_API_KEY não configurado. Veja maps_search.py para instruções.",
            "api_available": False,
        }
    
    # Monta a query completa
    full_query = f"{query} em {city}"
    if state:
        full_query += f", {state}"
    full_query += f", {country}"
    
    try:
        params = {
            "query": full_query,
            "key": key,
            "language": "pt-BR",
            "region": "br",
        }
        
        with httpx.Client(timeout=15.0) as client:
            response = client.get(PLACES_TEXT_SEARCH_URL, params=params)
            
            if response.status_code != 200:
                return {
                    "success": False,
                    "data": [],
                    "error": f"Erro na API Google: HTTP {response.status_code}",
                    "api_available": True,
                }
            
            data = response.json()
            
            if data.get("status") != "OK":
                error_msg = data.get("error_message", data.get("status", "Erro desconhecido"))
                return {
                    "success": False,
                    "data": [],
                    "error": f"Google Places API: {error_msg}",
                    "api_available": True,
                }
            
            results = data.get("results", [])[:limit]
            
            # Formata os resultados
            businesses = []
            for place in results:
                business = {
                    "name": place.get("name", ""),
                    "address": place.get("formatted_address", ""),
                    "city": city,
                    "state": state,
                    "phone": "",  # Precisa de Details call para pegar
                    "website": "",  # Precisa de Details call para pegar
                    "rating": str(place.get("rating", "")),
                    "reviews_count": str(place.get("user_ratings_total", "")),
                    "google_maps_url": place.get("url", ""),
                    "place_id": place.get("place_id", ""),
                    "category": _extract_category(place),
                    "has_website": False,  # Será verificado depois
                    "has_ads": False,  # Será verificado depois
                }
                businesses.append(business)
            
            return {
                "success": True,
                "data": businesses,
                "error": None,
                "api_available": True,
            }
            
    except httpx.TimeoutException:
        return {
            "success": False,
            "data": [],
            "error": "Timeout ao acessar Google Places API",
            "api_available": True,
        }
    except Exception as e:
        return {
            "success": False,
            "data": [],
            "error": str(e),
            "api_available": True,
        }


def get_place_details(
    place_id: str,
    api_key: Optional[str] = None,
) -> dict:
    """
    Busca detalhes completos de um lugar (telefone, site, etc).
    
    Args:
        place_id: ID do lugar no Google Maps
        api_key: Chave da API
        
    Returns:
        dict com detalhes do lugar
    """
    key = api_key or GOOGLE_MAPS_API_KEY
    
    if not key or not place_id:
        return {}
    
    try:
        params = {
            "place_id": place_id,
            "key": key,
            "fields": "formatted_phone_number,website,url,business_status,opening_hours",
            "language": "pt-BR",
        }
        
        with httpx.Client(timeout=10.0) as client:
            response = client.get(PLACES_DETAILS_URL, params=params)
            
            if response.status_code != 200:
                return {}
            
            data = response.json()
            
            if data.get("status") != "OK":
                return {}
            
            result = data.get("result", {})
            
            return {
                "phone": result.get("formatted_phone_number", ""),
                "website": result.get("website", ""),
                "maps_url": result.get("url", ""),
                "is_open": result.get("business_status", "") == "OPERATIONAL",
            }
            
    except Exception:
        return {}


def _extract_category(place: dict) -> str:
    """Extrai a categoria do lugar a partir dos tipos."""
    types = place.get("types", [])
    
    # Mapeamento de tipos Google para categorias amigáveis
    category_map = {
        "dentist": "Dentista",
        "doctor": "Médico",
        "hospital": "Hospital",
        "pharmacy": "Farmácia",
        "restaurant": "Restaurante",
        "cafe": "Café",
        "bar": "Bar",
        "bakery": "Padaria",
        "gym": "Academia",
        "beauty_salon": "Salão de Beleza",
        "hair_care": "Cabeleireiro",
        "car_repair": "Oficina Mecânica",
        "real_estate_agency": "Imobiliária",
        "lawyer": "Advogado",
        "accountant": "Contador",
        "veterinary_care": "Veterinário",
        "pet_store": "Pet Shop",
        "clothing_store": "Loja de Roupas",
        "electronics_store": "Loja de Eletrônicos",
        "furniture_store": "Móveis",
        "hardware_store": "Casa de Materiais",
        "supermarket": "Supermercado",
        "shopping_mall": "Shopping",
    }
    
    for tipo in types:
        if tipo in category_map:
            return category_map[tipo]
    
    # Retorna o primeiro tipo como categoria
    return types[0].replace("_", " ").title() if types else ""


if __name__ == "__main__":
    # Teste rápido
    result = search_businesses_maps("Clínica Odontológica", "São Paulo", "SP")
    print(f"Sucesso: {result['success']}")
    print(f"Resultados: {len(result['data'])}")
    if result.get("error"):
        print(f"Erro: {result['error']}")
    
    for business in result["data"][:3]:
        print(f"\n  Nome: {business['name']}")
        print(f"  Endereço: {business['address']}")
        print(f"  Rating: {business['rating']}")
