import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import current_app, request, jsonify
from app.models import User


def create_access_token(user_id: str) -> str:
    payload = {
        'sub': str(user_id),
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(
            minutes=current_app.config['JWT_EXPIRE_MINUTES']
        ),
    }
    return jwt.encode(
        payload,
        current_app.config['JWT_SECRET_KEY'],
        algorithm=current_app.config['JWT_ALGORITHM']
    )


def decode_token(token: str) -> dict:
    return jwt.decode(
        token,
        current_app.config['JWT_SECRET_KEY'],
        algorithms=[current_app.config['JWT_ALGORITHM']]
    )


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Accept from httpOnly cookie (browser) OR Authorization header (API clients)
        if 'auth_token' in request.cookies:
            token = request.cookies.get('auth_token')
        elif request.headers.get('Authorization', '').startswith('Bearer '):
            token = request.headers['Authorization'].split(' ')[1]

        if not token:
            return jsonify({'error': 'Authentication required.'}), 401

        try:
            payload = decode_token(token)
            current_user = User.query.get(payload['sub'])
            if not current_user or not current_user.is_active:
                return jsonify({'error': 'User not found or inactive.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token.'}), 401

        return f(current_user, *args, **kwargs)
    return decorated
