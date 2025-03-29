from flask import Flask
from flask_cors import CORS
from extensions import db, migrate
from config import Config

app = Flask(__name__)
CORS(app)
app.config.from_object(Config)

db.init_app(app)
migrate.init_app(app, db)

# Import and register blueprints
from controllers.userController import user_bp
from controllers.bookingController import booking_bp
from controllers.tabelsControllers import tables_bp

app.register_blueprint(user_bp, url_prefix="/users")
app.register_blueprint(booking_bp, url_prefix="/bookings")
app.register_blueprint(tables_bp, url_prefix="/tabels")

if __name__ == "__main__":
    app.run(debug=True)
