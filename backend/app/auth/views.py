import re
from flask import Blueprint, current_app, jsonify, request
from flask_mail import Message
from app import db, verify_token
from app.models import User
from app.auth.jwt_utils import create_access_token, jwt_required
from app.auth.utils import send_verification_email, send_reset_email

auth = Blueprint('auth', __name__)

EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')


def _set_auth_cookie(resp, token: str):
    resp.set_cookie(
        'auth_token',
        token,
        httponly=current_app.config['JWT_COOKIE_HTTPONLY'],
        secure=current_app.config['JWT_COOKIE_SECURE'],
        samesite=current_app.config['JWT_COOKIE_SAMESITE'],
        max_age=current_app.config['JWT_EXPIRE_MINUTES'] * 60
    )


# ── Register ──────────────────────────────────────────────────────────────────

@auth.route('/register', methods=['POST'])
def api_register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    name = data.get('name', '').strip()
    password = data.get('password', '')

    if not email or not name or not password:
        return jsonify({'error': 'email, name, and password are required.'}), 400

    if not EMAIL_RE.match(email):
        return jsonify({'error': 'Invalid email.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered.'}), 409

    user = User(name=name, email=email)
    user.set_password(password)
    db.session.add(user)

    if current_app.config['EMAIL_VERIFY_ENABLED']:
        dev_token = send_verification_email(user)
        db.session.commit()
        resp_data = {'message': 'Registered. Check your email to verify your account.'}
        if not current_app.config['MAIL_ENABLED']:
            resp_data['dev_verification_token'] = dev_token
        return jsonify(resp_data), 201
    else:
        user.is_verified = True
        db.session.commit()
        return jsonify({
            'message': 'Registered successfully.',
            'user': {'email': user.email, 'name': user.name, 'is_verified': user.is_verified}
        }), 201


# ── Login ─────────────────────────────────────────────────────────────────────

@auth.route('/login', methods=['POST'])
def api_login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials.'}), 401

    if current_app.config['EMAIL_VERIFY_ENABLED'] and not user.is_verified:
        return jsonify({'error': 'Email not verified. Check your inbox.'}), 403

    token = create_access_token(user.id)
    resp = jsonify({
        'message': 'Login successful.',
        'user': {
            'email': user.email,
            'name': user.name,
            'is_verified': user.is_verified
        },
        'config': {
            'email_verify_enabled': current_app.config['EMAIL_VERIFY_ENABLED']
        }
    })
    _set_auth_cookie(resp, token)
    return resp, 200


# ── Logout ────────────────────────────────────────────────────────────────────

@auth.route('/logout', methods=['POST'])
def api_logout():
    resp = jsonify({'message': 'Logged out.'})
    resp.delete_cookie('auth_token')
    return resp, 200


# ── Profile ───────────────────────────────────────────────────────────────────

@auth.route('/profile', methods=['GET'])
@jwt_required
def api_profile(current_user):
    return jsonify({
        'message': 'Success.',
        'user': {
            'email': current_user.email,
            'name': current_user.name,
            'is_verified': current_user.is_verified
        }
    }), 200


@auth.route('/profile', methods=['PUT'])
@jwt_required
def api_update_profile(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'name is required.'}), 400
    current_user.name = name
    db.session.commit()
    return jsonify({
        'message': 'Profile updated.',
        'user': {
            'email': current_user.email,
            'name': current_user.name,
            'is_verified': current_user.is_verified
        }
    }), 200


# ── Change password ───────────────────────────────────────────────────────────

@auth.route('/change_password', methods=['POST'])
@jwt_required
def api_change_password(current_user):
    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return jsonify({'error': 'current_password and new_password are required.'}), 400

    if not current_user.check_password(current_password):
        return jsonify({'error': 'Current password is incorrect.'}), 400

    current_user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password changed successfully.'}), 200


# ── Password reset ────────────────────────────────────────────────────────────

@auth.route('/reset_password', methods=['POST'])
def api_reset_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    user = User.query.filter_by(email=email).first()
    if not user:
        # Don't reveal whether email exists
        return jsonify({'message': 'If that email exists, reset instructions were sent.'}), 200

    dev_link = send_reset_email(user)
    db.session.commit()

    resp_data = {'message': 'If that email exists, reset instructions were sent.'}
    if not current_app.config['MAIL_ENABLED']:
        resp_data['dev_reset_link'] = dev_link
    return jsonify(resp_data), 200


@auth.route('/reset_password_confirm', methods=['POST'])
def api_reset_password_confirm():
    data = request.get_json() or {}
    token = data.get('token', '')
    new_password = data.get('password', '')

    if not token or not new_password:
        return jsonify({'error': 'token and password are required.'}), 400

    email = verify_token(token, 'RESET_PASSWORD_SALT')
    if not email:
        return jsonify({'error': 'Token is invalid or expired.'}), 400

    user = User.query.filter_by(email=email, reset_token=token).first()
    if not user:
        return jsonify({'error': 'Token is invalid or expired.'}), 400

    user.set_password(new_password)
    user.reset_token = None
    db.session.commit()
    return jsonify({'message': 'Password reset successfully.'}), 200


# ── Email verification ────────────────────────────────────────────────────────

@auth.route('/send_verification', methods=['POST'])
@jwt_required
def api_send_verification(current_user):
    if current_user.is_verified:
        return jsonify({'message': 'Email already verified.'}), 200

    dev_token = send_verification_email(current_user)
    db.session.commit()

    resp_data = {'message': 'Verification email sent.'}
    if not current_app.config['MAIL_ENABLED']:
        resp_data['dev_verification_token'] = dev_token
    return jsonify(resp_data), 200


@auth.route('/verify_email', methods=['POST'])
def api_verify_email():
    data = request.get_json() or {}
    token = data.get('token', '')

    if not token:
        return jsonify({'error': 'token is required.'}), 400

    email = verify_token(token, 'VERIFICATION_SALT')
    if not email:
        return jsonify({'error': 'Token is invalid or expired.'}), 400

    user = User.query.filter_by(email=email, verification_token=token).first()
    if not user:
        return jsonify({'error': 'Token is invalid or expired.'}), 400

    user.is_verified = True
    user.verification_token = None
    db.session.commit()
    return jsonify({'message': 'Email verified successfully.'}), 200
