from Bizaccount import BizAccount

# Создаём экземпляр класса
biz_account = BizAccount()

# Задаём тестовые значения
cookies = "ss-id=your_session_id; ss-pid=your_pid"  # Укажите реальные куки
hostname = "meduza"  # Укажите реальный hostname

try:
    # Вызываем метод и выводим результат
    result = biz_account.bizaccount_create_vorwands(cookies, hostname)
    print("Результат запроса:", result)
except ValueError as e:
    print("Ошибка:", e)
except Exception as e:
    print("Произошла ошибка:", e)