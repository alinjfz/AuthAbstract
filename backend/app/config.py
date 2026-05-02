import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-change-me')

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql+psycopg2://authuser:authpass@localhost:5432/authdb'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    # JWT stored in httpOnly cookie
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-secret-change-me')
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRE_MINUTES = int(os.environ.get('JWT_EXPIRE_MINUTES', 480))
    JWT_COOKIE_HTTPONLY = True
    JWT_COOKIE_SAMESITE = 'Strict'
    JWT_COOKIE_SECURE = os.environ.get('JWT_COOKIE_SECURE', 'True') == 'True'

    # Email verification toggle
    EMAIL_VERIFY_ENABLED = os.environ.get('EMAIL_VERIFY_ENABLED', 'False') == 'True'

    # Mail (optional)
    MAIL_ENABLED = os.environ.get('MAIL_ENABLED', 'False') == 'True'
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', '')

    # Token expiry for email tokens (itsdangerous)
    EMAIL_TOKEN_EXPIRY = int(os.environ.get('EMAIL_TOKEN_EXPIRY', 3600))
    VERIFICATION_SALT = os.environ.get('VERIFICATION_SALT', 'email-verification')
    RESET_PASSWORD_SALT = os.environ.get('RESET_PASSWORD_SALT', 'password-reset')

    FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
