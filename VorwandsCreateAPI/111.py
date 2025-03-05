import datetime

def prepare_phone():
    """Генерация уникального телефона"""
    now = datetime.datetime.now().strftime("%m%d%Y%H%M%S%f")
    phone = f"+7 (9{now[:2]}) {now[3:6]}-{now[6:8]}-{now[18:20]}"

    print(now[16:20])
    return phone

if __name__ == "__main__":
    prepare_phone()