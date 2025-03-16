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

    print(f"🚀 Отправка запроса UPDATE на {url}")
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