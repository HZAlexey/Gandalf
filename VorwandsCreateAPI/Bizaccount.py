import requests
import datetime
from flask import session  # Используем session для hostname

class BizAccount:
    def prepare_phone(self):
        """Генерация уникального телефона"""
        now = datetime.datetime.now().strftime("%m%d%Y%H%M%S%f")
        phone = f"+7 (9{now[:2]}) {now[3:6]}-{now[6:8]}-{now[18:20]}"
        random_num = f"{now[16:20]}"
        return random_num #phone

    def bizaccount_create_vorwands(self, cookies, city_code):

        # Получаем hostname из session
        hostname = session.get('hostname')
        if not hostname:
            raise ValueError("Ошибка: hostname отсутствует в session. Пользователь не выбрал тестовую среду.")

        # Подготовка данных <Contact ModificationType="Create" ContactType="Phone" Value="{phone}"/>
        random_num = self.prepare_phone()


        data = {
            "xml": f"""<?xml version="1.0"?>
            <BizaccountVorwandRequestExtended Type="Create" CityCode="{city_code}"
            ContactPersonName="Testing" 
            ContactPersonEmail="8778131{random_num}">
                <Name Name="New organization {random_num}"/>
                <Contacts>
                    <Contact ModificationType="Create" ContactType="Email" Value="test@mail.ru"/>
                </Contacts>
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
        print(f"📜 Данные запроса: {data}")

        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()

            # Пробуем получить JSON
            Vorwand_result = response.json()
            print("✅ Ответ сервера:", Vorwand_result)
            return Vorwand_result  # Возвращаем результат

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
                    <Rubric ModificationType="Delete" Code="110358"/>
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

        print(f"🚀 Отправка запроса UPDATE на {url}")
        print(f"📜 Данные запроса: {data}")

        try:
            response = requests.post(url, json=data, headers=headers)
            response.raise_for_status()
            Vorwand_result = response.json()
            print("✅ Ответ сервера:", Vorwand_result)
            return Vorwand_result
        except requests.exceptions.RequestException as e:
            print("❌ Ошибка при отправке запроса:", e)
            return None