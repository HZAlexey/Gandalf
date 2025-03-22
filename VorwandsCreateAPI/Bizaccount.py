import requests
import datetime
from flask import session, url_for  # Используем session для hostname

class BizAccount:
    def prepare_phone(self):
        """Генерация уникального телефона"""
        now = datetime.datetime.now().strftime("%m%d%Y%H%M%S%f")
        phone = f"+7 (9{now[:2]}) {now[3:6]}-{now[6:8]}-{now[18:20]}"
        random_num = f"{now[16:20]}"
        return random_num #phone

    def bizaccount_create_vorwands(self, cookies, city_code, rubrics=None):

        phone = self.prepare_phone()

        # Получаем hostname из session
        hostname = session.get('hostname')
        if not hostname:
            raise ValueError("Ошибка: hostname отсутствует в session. Пользователь не выбрал тестовую среду.")

        # 🔹 Генерируем XML для рубрик (если есть)
        rubrics_xml = ""
        print("📌 Полученные rubrics:", rubrics)  # ✅ Логируем входные данные

        if rubrics:
            rubrics_xml = "<Rubrics>\n"

            for rubric in rubrics:
                # ✅ Проверяем, что rubric — это словарь с ключами "id" и "action"
                if isinstance(rubric, dict) and "id" in rubric and "action" in rubric:
                    rubric_id = rubric["id"]
                    action = rubric["action"]  # "Create" или "Delete"
                    rubrics_xml += f'    <Rubric ModificationType="{action}" Code="{rubric_id}"/>\n'
                else:
                    print(f"❌ Ошибка: Некорректный формат рубрики: {rubric}")  # Логируем ошибку

            rubrics_xml += "</Rubrics>\n"


        # ✅ Формируем XML-запрос (даже если нет рубрик)
        data = {
            "xml": f"""<?xml version="1.0"?>
        <BizaccountVorwandRequestExtended Type="Create" CityCode="{city_code}">
        {rubrics_xml}
            <Name Name="Viking Coffee"/>
            <Contacts>
                <Contact ModificationType="Create" ContactType="Email" Value="vladimir.malov.88@mail.ru"/>
                <Contact ModificationType="Create" ContactType="Phone" Value="{phone}" CountryCode="1"/>
            </Contacts>
            <Schedules>
                <Schedule ModificationType="Update" Comment="" IsTemporarilyClosed="false">
                    <Day Label="Fri" From="09:00:00" To="18:00:00"/>
                    <Day Label="Mon" From="09:00:00" To="18:00:00"/>
                    <Day Label="Sat" From="09:00:00" To="18:00:00"/>
                    <Day Label="Sun"/>
                    <Day Label="Thu" From="09:00:00" To="18:00:00"/>
                    <Day Label="Tue" From="09:00:00" To="18:00:00"/>
                    <Day Label="Wed" From="09:00:00" To="18:00:00"/>
                </Schedule>
            </Schedules>
        </BizaccountVorwandRequestExtended>"""
        }

        # ✅ Проверяем XML перед отправкой
        print("\n🔹 ОТПРАВЛЯЕМ XML:")
        print(data["xml"])
        print("🔹 КОНЕЦ XML\n")

            #return {"xml": data}  # Теперь возвращаем XML в JSON-объекте

        # Заголовки с куками
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Cookie": cookies
        }

        # Формируем URL с hostname
        url = f"http://{hostname}/api/Vorwands/Create/BizAccount/Extended"
        print(f"🚀 Отправка запроса на {url}")
        print(f"📜 Данные запроса: {data}")

        try:
            response = requests.post(url, json=data, headers=headers)

            if response.status_code == 401:
                print("❌ Ошибка 401: Неавторизованный доступ. Перенаправление на страницу входа.")
                session.pop("cookie", None)  # Удаляем куки из сессии
                return {"redirect": url_for("auth.login")}, 401  # Возвращаем редирект

            response.raise_for_status()
            Vorwand_result = response.json()
            print("✅ Ответ сервера:", Vorwand_result)
            return Vorwand_result

        except requests.exceptions.RequestException as e:
            print("❌ Ошибка при отправке запроса:", e)
            return None

    def update_vorwand_request(self, cookies, firm_code, card_code):
        hostname = session.get('hostname')
        if not hostname:
            raise ValueError("Ошибка: hostname отсутствует в session. Пользователь не выбрал тестовую среду.")

        phone = self.prepare_phone()

        data = {
            "xml": f"""<?xml version="1.0"?>
            <BizaccountVorwandRequestExtended Type="Update" FirmCode="{firm_code}" CardCode="{card_code}">
                <Rubrics>
                    <Rubric ModificationType="Create" Code="110358"/>
                </Rubrics>
                <Address Address="Даяна Мурзина, 7/1" BuildingSyncode="70030076269813188"/>
                <Contacts>
                    <Contact ModificationType="Create" ContactType="Phone" Value="{phone}" CountryCode="1"
                    Description="Заместитель директора"/>
                </Contacts>
            </BizaccountVorwandRequestExtended>"""
        }

        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Cookie": cookies
        }

        url = f"http://{hostname}/api/Vorwands/Create/BizAccount/Extended"

        #print(f"🚀 Отправка запроса UPDATE на {url}")
        #print(f"📜 Данные запроса: {data}")

        try:
            response = requests.post(url, json=data, headers=headers)

            if response.status_code == 401:
                print("❌ Ошибка 401: Неавторизованный доступ. Перенаправление на страницу входа.")
                session.pop("cookie", None)  # Удаляем куки из сессии
                return {"redirect": url_for("auth.login")}, 401  # Возвращаем редирект

            response.raise_for_status()
            Vorwand_result = response.json()
            print("✅ Ответ сервера:", Vorwand_result)
            return Vorwand_result
        except requests.exceptions.RequestException as e:
            print("❌ Ошибка при отправке запроса:", e)
            return None