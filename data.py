import datetime

def prepare_phone():
    """
    Генерирует случайный номер телефона.
    """
    now = datetime.datetime.now().strftime("%m%d%Y%H%M%S%f")
    random_num = f"{now[16:20]}"  # Генерируем случайный номер
    return random_num

def generate_rubrics_xml(rubrics):
    """
    Генерирует XML-блок для рубрик.
    :param rubrics: Список словарей с рубриками ({ "id": "12345", "action": "Create" })
    :return: Строка с XML или пустая строка, если рубрик нет.
    """
    if not rubrics:
        return ""

    rubrics_xml = "<Rubrics>\n"
    for rubric in rubrics:
        if isinstance(rubric, dict) and "id" in rubric and "action" in rubric:
            rubric_id = rubric["id"]
            action = rubric["action"]  # "Create" или "Delete"
            rubrics_xml += f'    <Rubric ModificationType="{action}" Code="{rubric_id}"/>\n'
        else:
            print(f"❌ Ошибка: Некорректный формат рубрики: {rubric}")  # Логируем ошибку
    rubrics_xml += "</Rubrics>\n"

    return rubrics_xml