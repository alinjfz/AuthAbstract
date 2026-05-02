import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_mail import Mail
from itsdangerous import URLSafeTimedSerializer

from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(name)s: %(message)s'
)
logging.getLogger('flask_cors').setLevel(logging.WARNING)


def generate_token(email: str, salt_key: str) -> str:
    serializer = URLSafeTimedSerializer(Config.SECRET_KEY)
    return serializer.dumps(email, salt=getattr(Config, salt_key))


def verify_token(token: str, salt_key: str, max_age: int = None) -> str | None:
    serializer = URLSafeTimedSerializer(Config.SECRET_KEY)
    try:
        expiry = max_age if max_age is not None else Config.EMAIL_TOKEN_EXPIRY
        return serializer.loads(token, salt=getattr(Config, salt_key), max_age=expiry)
    except Exception:
        return None


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)

    CORS(app,
         origins=app.config['ALLOWED_ORIGINS'],
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

    from app.auth.views import auth
    app.register_blueprint(auth, url_prefix='/api/auth')

    return app
