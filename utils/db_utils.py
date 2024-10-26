import mariadb
import os

def get_db_connection():
    try:
        conn = mariadb.connect(
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            host=os.getenv('DB_HOST'),
            port=3306,
            database=os.getenv('DB_NAME')
        )
        return conn
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB: {e}")
        return None

def save_weather_to_db(city, temp_kelvin, feels_like_kelvin, condition):
    conn = get_db_connection()
    if conn is None:
        return

    try:
        cursor = conn.cursor()
        query = """
            INSERT INTO weather(city, temp, feels_like, weather_condition)
            VALUES (?, ?, ?, ?)
        """
        cursor.execute(query, (city, temp_kelvin, feels_like_kelvin, condition))
        conn.commit()
    except mariadb.Error as e:
        print(f"Error saving weather data: {e}")
    finally:
        conn.close()

def get_daily_summary(city=None):
    conn = get_db_connection()
    if conn is None:
        return {}

    try:
        cursor = conn.cursor()
        if city:  # If a city is provided, filter by city
            query = """
                SELECT city, AVG(temp) AS avg_temp, MIN(temp) AS min_temp, 
                MAX(temp) AS max_temp, weather_condition
                FROM weather
                WHERE DATE(timestamp) = CURDATE() AND city = ?
                GROUP BY city
            """
            cursor.execute(query, (city,))
        else:
            query = """
                SELECT city, AVG(temp) AS avg_temp, MIN(temp) AS min_temp, 
                MAX(temp) AS max_temp, weather_condition
                FROM weather
                WHERE DATE(timestamp) = CURDATE()
                GROUP BY city
            """
            cursor.execute(query)

        results = cursor.fetchall()
        summary = []
        for (city, avg_temp, min_temp, max_temp, weather_condition) in results:
            summary.append({
                "city": city,
                "avg_temp": avg_temp,
                "min_temp": min_temp,
                "max_temp": max_temp,
                "condition": weather_condition
            })
        return summary
    except mariadb.Error as e:
        print(f"Error fetching daily summary: {e}")
        return []
    finally:
        conn.close()





