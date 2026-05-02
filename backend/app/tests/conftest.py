import pytest
from app import create_app, db as _db


class TestConfig:
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SECRET_KEY = 'test-secret'
    JWT_SECRET_KEY = 'test-jwt-secret'
    JWT_ALGORITHM = 'HS256'
    JWT_EXPIRE_MINUTES = 60
    JWT_COOKIE_HTTPONLY = True
    JWT_COOKIE_SAMESITE = 'Lax'
    JWT_COOKIE_SECURE = False
    EMAIL_VERIFY_ENABLED = False
    MAIL_ENABLED = False
    MAIL_SERVER = 'localhost'
    MAIL_PORT = 25
    MAIL_USE_TLS = False
    MAIL_USERNAME = ''
    MAIL_PASSWORD = ''
    MAIL_DEFAULT_SENDER = 'test@example.com'
    EMAIL_TOKEN_EXPIRY = 3600
    VERIFICATION_SALT = 'email-verification'
    RESET_PASSWORD_SALT = 'password-reset'
    FRONTEND_URL = 'http://localhost:3000'
    ALLOWED_ORIGINS = ['http://localhost:3000']
    WTF_CSRF_ENABLED = False


@pytest.fixture()
def app():
    app = create_app(TestConfig)
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def registered_user(client):
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'name': 'Test User',
        'password': 'StrongPass123!'
    })
    return {'email': 'test@example.com', 'password': 'StrongPass123!'}


@pytest.fixture()
def logged_in_client(client, registered_user):
    """Client with auth_token cookie set."""
    res = client.post('/api/auth/login', json=registered_user)
    assert res.status_code == 200
    return client
