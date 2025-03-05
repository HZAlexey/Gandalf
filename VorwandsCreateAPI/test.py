import pyodbc

def get_firm_syncode(card_syncode):
    """Получает FirmSyncode по card_syncode"""
    try:
        with pyodbc.connect(
            "Driver={SQL Server Native Client 11.0};"
            "Server=uk-rhinosql;"
            "Database=Youla.Rhino;"
            "Trusted_Connection=yes;"
        ) as cnxn:
            with cnxn.cursor() as curs:
                curs.execute(
                    ''' 
                    SELECT FirmSyncode 
                    FROM [reference].[Cards] 
                    WHERE Syncode = ?  
                    ''',
                    (card_syncode,)  # ✅ Передаем параметр
                )
                row = curs.fetchone()
                return row[0] if row else None

    except Exception as e:
        print("❌ Ошибка подключения к БД или выполнения запроса:", e)
        return None

# ✅ Тестируем конкретное значение
syncode_test = 70000001006577638
firm_syncode = get_firm_syncode(syncode_test)
print(f"✅ Полученный FirmSyncode для {syncode_test}: {firm_syncode}")