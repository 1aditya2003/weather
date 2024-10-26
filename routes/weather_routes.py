from flask import Blueprint, jsonify, request, render_template
import threading
import time  # Import time for sleep
from utils.weather_utils import convert_temperature, fetch_weather_data
from utils.db_utils import get_daily_summary, save_weather_to_db

weather_bp = Blueprint('weather', __name__)

CITIES = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad']
weather_data = {}

# Function to update weather data periodically
def update_weather_data():
    global weather_data
    while True:
        new_data = fetch_weather_data(CITIES)
        for city, data in new_data.items():
            save_weather_to_db(city, data['temp_kelvin'], data['feels_like_kelvin'], data['condition'])
        weather_data.update(new_data)
        time.sleep(300)  # Wait for 5 minutes before the next update

# Start background thread for fetching data
threading.Thread(target=update_weather_data, daemon=True).start()

@weather_bp.route('/')
def index():
    return render_template('index.html', weather=weather_data)

@weather_bp.route('/api/weather', methods=['GET'])
def weather_api():
    city = request.args.get('city')
    format = request.args.get('format', 'Celsius')
    if city in weather_data:
        data = weather_data[city]
        data['temp'] = round(convert_temperature(data['temp_kelvin'], format), 2)
        data['feels_like'] = round(convert_temperature(data['feels_like_kelvin'], format), 2)
        return jsonify(data)
    else:
        return jsonify({'error': 'City not found'}), 404
    
@weather_bp.route('/api/summary', methods=['GET'])
def daily_summary():
    city = request.args.get('city')
    print(f"Requested summary for city: {city}")  # Debug print
    summary = get_daily_summary(city)
    print(f"Summary data: {summary}")  # Debug print
    return jsonify(summary)



