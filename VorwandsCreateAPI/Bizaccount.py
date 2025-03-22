from flask import session, url_for
import requests
from data import generate_rubrics_xml, prepare_phone

class BizAccount:
    def bizaccount_create_vorwands(self, cookies, city_code, rubrics=None):

        phone = prepare_phone()
        hostname = session.get('hostname')
        if not hostname:
            raise ValueError("Ошибка: hostname отсутствует в session. Пользователь не выбрал тестовую среду.")

        # 🔹 Генерируем XML для рубрик (если есть)
        rubrics_xml = generate_rubrics_xml(rubrics)


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




        # Заголовки с куками
        headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Cookie": cookies
        }

        # Формируем URL с hostname
        url = f"http://{hostname}/api/Vorwands/Create/BizAccount/Extended"

        print(f"🚀 Отправка запроса на {url}")
        print("\n🔹 ОТПРАВЛЯЕМ XML:")
        print(data["xml"])
        print("🔹 КОНЕЦ XML\n")

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

    def update_vorwand_request(self, cookies, firm_code, card_code, rubrics=None):
        hostname = session.get('hostname')
        if not hostname:
            raise ValueError("Ошибка: hostname отсутствует в session. Пользователь не выбрал тестовую среду.")

        phone = prepare_phone()
        rubrics_xml = generate_rubrics_xml(rubrics)

        data = {
            "xml": f"""<?xml version="1.0"?>
            <BizaccountVorwandRequestExtended Type="Update" FirmCode="{firm_code}" CardCode="{card_code}">
                {rubrics_xml}
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

        print(f"🚀 Отправка запроса на {url}")
        print("\n🔹 ОТПРАВЛЯЕМ XML:")
        print(data["xml"])
        print("🔹 КОНЕЦ XML\n")

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