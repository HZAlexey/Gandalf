from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from auth_routes import auth_bp
from VorwandsCreateAPI.Bizaccount import BizAccount
import pyodbc

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

    cookies = session.get("cookie", "")
    if not cookies:
        return jsonify({"error": "Пользователь не авторизован"}), 401

    if not city_code:
        return jsonify({"error": "Не передан city_code"}), 400

    biz = BizAccount()
    try:
        response = biz.bizaccount_create_vorwands(cookies, city_code)
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

    #if not city_code:
    #    return jsonify({"error": "Не передан city_code"}), 400

    # 🔹 Ищем FirmSyncode в БД
    firm_syncode = get_firm_syncode(card_syncode)

    if not firm_syncode:
        return jsonify({"error": "фирма не найдена"}), 404

    biz = BizAccount()
    try:
        # 👇 Вызываем новый метод update_vorwand_request (Создадим его ниже)
        response = biz.update_vorwand_request(cookies, firm_syncode, card_syncode)#, city_code)
        return jsonify({"vorwand_id": response})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    app.run(debug=True)