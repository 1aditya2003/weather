from flask import Flask
from dotenv import load_dotenv
from config.config import Config
from routes.weather_routes import weather_bp
from utils.db_utils import save_weather_to_db


# Load environment variables from .env file
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config.from_object(Config)

# Register blueprint for weather routes
app.register_blueprint(weather_bp)

if __name__ == '__main__':
    app.run(debug=True)
