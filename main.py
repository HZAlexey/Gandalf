from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from auth_routes import auth_bp
from VorwandsCreateAPI.Bizaccount import BizAccount
import pyodbc
import psycopg2

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Регистрация Blueprint для авторизации
app.register_blueprint(auth_bp, url_prefix='/auth')

# Перенаправление с корневого URL на авторизацию
@app.route('/')
def root():
    return redirect(url_for('auth.login'))

# Главная страница с вкладками
@app.route('/main')
def main_page():
    if 'cookie' not in session:
        return redirect(url_for('auth.login'))

    hostname = session.get('hostname', 'Неизвестный хост')
    return render_template('index.html', hostname=hostname)

# ✅ Функция загрузки рубрик
@app.route("/api/rubrics", methods=["GET"])
def rubrics():
    """Возвращает список рубрик из MSSQL с учетом поиска"""

    hostname = session.get('hostname', 'default_host')  # Защита от пустого hostname
    search_term = request.args.get("term", "")  # Получаем параметр поиска

    try:
        cnxn = pyodbc.connect(
            "Driver={SQL Server Native Client 11.0};"
            f"Server=uk-{hostname}sql;"
            f"Database=Youla.{hostname};"
            "Trusted_Connection=yes;"
        )
    except Exception as e:
        return jsonify({"error": f"Ошибка подключения к БД: {str(e)}"}), 500

    try:
        with cnxn.cursor() as cursor:
            print(
                f"🔹 Выполняем SQL-запрос: SELECT Syncode, Name FROM reference.Rubrics WHERE Name LIKE '%{search_term}%'")

            cursor.execute(
                """
                SELECT Syncode, Name 
                FROM reference.Rubrics 
                WHERE IsDeleted = 0
                AND Name LIKE ?
                """, (f"%{search_term}%",)
            )

            rows = cursor.fetchall()
            print(f"🔹 Найдено записей: {len(rows)}")

            if not rows:
                return jsonify([])  # Если ничего не нашли, возвращаем пустой список

            rubrics = []
            for row in rows:
                if len(row) < 2:  # Проверяем, что у строки есть две колонки
                    print("❌ Ошибка: строка не содержит две колонки:", row)
                    continue
                rubrics.append({"id": row[0], "text": row[1]})

        return jsonify(rubrics)
    except Exception as e:
        return jsonify({"error": f"Ошибка выполнения SQL-запроса: {str(e)}"}), 500


# ✅ Функция для поиска FirmSyncode по card_syncode в БД

def get_firm_syncode(card_syncode):
    """Получает FirmSyncode по card_syncode из БД"""

    # ✅ Получаем hostname из session
    hostname = session.get('hostname')
    if not hostname:
        print("❌ Ошибка: hostname отсутствует в session.")
        return None

    try:
        cnxn = pyodbc.connect( "Driver={SQL Server Native Client 11.0};"
                                f"Server=uk-{hostname}sql;"
                                f"Database=Youla.{hostname};"
                                "Trusted_Connection=yes;")
    except Exception as e:
        print("❌ Ошибка подключения к БД:", e)
        return None

    try:
        with cnxn.cursor() as curs:
            curs.execute(
                '''
                SELECT FirmSyncode 
                FROM reference.Cards
                WHERE Syncode = ?
                ''', (card_syncode,))

            row = curs.fetchone()
            return row[0] if row else None
    finally:
        curs.close()


# ✅ API для создания зацепки "Новая орг-ция"
@app.route("/api/create-vorwand", methods=["POST"])
def create_vorwand():
    data = request.get_json()
    city_code = data.get("city_code")
    rubrics = data.get("rubrics", [])  # Получаем список рубрик

    cookies = session.get("cookie", "")
    if not cookies:
        return jsonify({"error": "Пользователь не авторизован"}), 401

    if not city_code:
        return jsonify({"error": "Не передан city_code"}), 400

    biz = BizAccount()
    try:
        response = biz.bizaccount_create_vorwands(cookies, city_code, rubrics)

        if response is None:
            return jsonify({"error": "Ошибка генерации XML"}), 500  # ✅ Проверяем, что response не None

        if isinstance(response, tuple) and response[1] == 401:
            return jsonify(response[0]), 401  # Перенаправляем на страницу авторизации

        return jsonify({"vorwand_id": response})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ API для создания зацепки "Обновить данные орг-ции"
@app.route("/api/update-vorwand", methods=["POST"])
def update_vorwand():
    data = request.get_json()
    #city_code = data.get("city_code")
    card_syncode = data.get("card_syncode")

    cookies = session.get("cookie", "")
    if not cookies:
        return jsonify({"error": "Пользователь не авторизован"}), 401

    # 🔹 Ищем FirmSyncode в БД
    firm_syncode = get_firm_syncode(card_syncode)

    if not firm_syncode:
        return jsonify({"error": "фирма не найдена"}), 404

    biz = BizAccount()
    try:
        # 👇 Вызываем новый метод update_vorwand_request (Создадим его ниже)
        response = biz.update_vorwand_request(cookies, firm_syncode, card_syncode)#, city_code)

        if isinstance(response, tuple) and response[1] == 401:
            return jsonify(response[0]), 401  # Перенаправляем на страницу авторизации

        return jsonify({"vorwand_id": response})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)