import requests

def handle_world():
    """
    Обработчик для пункта "World".
    Выполняет запрос к соответствующему API.
    """
    api_url = 'https://example.com/api/world'
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        return response.json(), 200
    except requests.exceptions.RequestException as e:
        return f"Ошибка при запросе к API: {e}", 500