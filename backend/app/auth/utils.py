from flask import current_app, render_template
from flask_mail import Message
from app import mail, generate_token


def send_verification_email(user) -> str:
    """Send verification email or return token in dev mode."""
    token = generate_token(user.email, 'VERIFICATION_SALT')
    user.verification_token = token

    if not current_app.config.get('MAIL_ENABLED'):
        return token

    frontend_url = current_app.config['FRONTEND_URL'].rstrip('/')
    verification_link = f"{frontend_url}/verify_email/{token}"
    html_content = render_template(
        'verify_email.html',
        user=user.name,
        verification_link=verification_link
    )
    msg = Message(
        subject='Email Verification',
        sender=current_app.config['MAIL_DEFAULT_SENDER'],
        recipients=[user.email],
        html=html_content
    )
    mail.send(msg)
    return token


def send_reset_email(user) -> str:
    """Send password reset email or return link in dev mode."""
    token = generate_token(user.email, 'RESET_PASSWORD_SALT')
    user.reset_token = token

    frontend_url = current_app.config['FRONTEND_URL'].rstrip('/')
    reset_link = f"{frontend_url}/reset_password_confirm/{token}"

    if not current_app.config.get('MAIL_ENABLED'):
        return reset_link

    html_content = render_template(
        'reset_password_email.html',
        user=user.name,
        reset_link=reset_link
    )
    msg = Message(
        subject='Password Reset',
        sender=current_app.config['MAIL_DEFAULT_SENDER'],
        recipients=[user.email],
        html=html_content
    )
    mail.send(msg)
    return reset_link
