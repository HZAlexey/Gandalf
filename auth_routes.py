from flask import Blueprint, render_template, request, redirect, url_for, session
import requests

auth_bp = Blueprint('auth', __name__)  # Создаём Blueprint

# Маршрут для отображения страницы авторизации
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hostname = request.form['hostname']  # Получаем выбранную тестовую среду

        # Формируем URL API для авторизации
        api_url = f"http://{hostname}.2gis.local/apiw/json/reply/auth?username={username}&password={password}"

        # Отправляем запрос к API
        response = requests.get(api_url, headers={'Content-Type': 'application/json'})
        if response.status_code == 200:
            data = response.json()
            session_id = data.get('sessionId')

            if session_id:
                # Сохраняем сессию
                session['cookie'] = f"ss-id={session_id}"
                session['hostname'] = hostname
                print(url_for('main_page'))
                return redirect(url_for('main_page'))  # Переходим на главную страницу
            else:
                # Ошибка авторизации (неверный логин/пароль)
                error_message = "Неверный логин или пароль. Попробуйте снова."
                return render_template('login.html', error=error_message)
        else:
            # Ошибка подключения к API
            error_message = f"Ошибка подключения к API: {response.status_code}"
            return render_template('login.html', error=error_message)

    # Метод GET: отображаем форму авторизации
    return render_template('login.html')

# Маршрут для выхода из системы
@auth_bp.route('/logout')
def logout():
    session.clear()  # Очищаем сессию
    return redirect(url_for('auth.login'))