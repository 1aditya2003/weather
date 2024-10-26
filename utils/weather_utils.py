import requests
import time
import os
from utils.db_utils import save_weather_to_db

def convert_temperature(kelvin, unit):
    if unit == 'Celsius':
        return kelvin - 273.15
    elif unit == 'Fahrenheit':
        return (kelvin - 273.15) * 9/5 + 32
    return kelvin  # Default to Kelvin

def fetch_weather_data(cities):
    weather_data = {}
    for city in cities:
        url = f'http://api.openweathermap.org/data/2.5/weather?q={city}&appid={os.getenv("API_KEY")}'
        response = requests.get(url)
        data = response.json()
        if response.status_code == 200:
            temp_kelvin = data['main']['temp']
            feels_like_kelvin = data['main']['feels_like']

            weather_data[city] = {
                'temp_kelvin': temp_kelvin,
                'feels_like_kelvin': feels_like_kelvin,
                'temp': round(convert_temperature(temp_kelvin, 'Celsius'), 2),
                'feels_like': round(convert_temperature(feels_like_kelvin, 'Celsius'), 2),
                'condition': data['weather'][0]['main'],
                'time': time.ctime(data['dt'])
            }

            # Save to DB after fetching
            save_weather_to_db(city, temp_kelvin, feels_like_kelvin, data['weather'][0]['main'])
        else:
            print(f"Error fetching data for {city}: {data.get('message', 'Unknown error')}")
    return weather_data
# https://history.openweathermap.org/data/2.5/history/city?lat=41.85&lon=-87.65&appid={API key}


