import pytest


# ── Register ──────────────────────────────────────────────────────────────────

def test_register_success(client):
    res = client.post('/api/auth/register', json={
        'email': 'new@example.com', 'name': 'Ali', 'password': 'Pass123!'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['user']['email'] == 'new@example.com'


def test_register_duplicate_email(client):
    payload = {'email': 'dup@example.com', 'name': 'Ali', 'password': 'Pass123!'}
    client.post('/api/auth/register', json=payload)
    res = client.post('/api/auth/register', json=payload)
    assert res.status_code == 409


def test_register_invalid_email(client):
    res = client.post('/api/auth/register', json={
        'email': 'notanemail', 'name': 'Ali', 'password': 'Pass123!'
    })
    assert res.status_code == 400


def test_register_missing_fields(client):
    res = client.post('/api/auth/register', json={'email': 'a@b.com'})
    assert res.status_code == 400


# ── Login ─────────────────────────────────────────────────────────────────────

def test_login_success(client, registered_user):
    res = client.post('/api/auth/login', json=registered_user)
    assert res.status_code == 200
    data = res.get_json()
    assert data['user']['email'] == registered_user['email']
    # JWT cookie must be set
    assert 'auth_token' in res.headers.get('Set-Cookie', '')


def test_login_wrong_password(client, registered_user):
    res = client.post('/api/auth/login', json={
        'email': registered_user['email'], 'password': 'wrongpassword'
    })
    assert res.status_code == 401


def test_login_unknown_email(client):
    res = client.post('/api/auth/login', json={
        'email': 'nobody@example.com', 'password': 'whatever'
    })
    assert res.status_code == 401


# ── Login — email verify gate ─────────────────────────────────────────────────

def test_login_unverified_user_blocked(app, client):
    """When EMAIL_VERIFY_ENABLED=True, unverified users cannot log in."""
    app.config['EMAIL_VERIFY_ENABLED'] = True
    client.post('/api/auth/register', json={
        'email': 'unverified@example.com', 'name': 'UV', 'password': 'Pass123!'
    })
    res = client.post('/api/auth/login', json={
        'email': 'unverified@example.com', 'password': 'Pass123!'
    })
    assert res.status_code == 403
    app.config['EMAIL_VERIFY_ENABLED'] = False


# ── Logout ────────────────────────────────────────────────────────────────────

def test_logout(logged_in_client):
    res = logged_in_client.post('/api/auth/logout')
    assert res.status_code == 200


# ── Profile ───────────────────────────────────────────────────────────────────

def test_get_profile_authenticated(logged_in_client):
    res = logged_in_client.get('/api/auth/profile')
    assert res.status_code == 200
    assert 'email' in res.get_json()['user']


def test_get_profile_unauthenticated(client):
    res = client.get('/api/auth/profile')
    assert res.status_code == 401


# ── Change password ───────────────────────────────────────────────────────────

def test_change_password(logged_in_client):
    res = logged_in_client.post('/api/auth/change_password', json={
        'current_password': 'StrongPass123!',
        'new_password': 'NewPass456!'
    })
    assert res.status_code == 200


def test_change_password_wrong_current(logged_in_client):
    res = logged_in_client.post('/api/auth/change_password', json={
        'current_password': 'wrong',
        'new_password': 'NewPass456!'
    })
    assert res.status_code == 400


# ── Password reset ────────────────────────────────────────────────────────────

def test_reset_password_flow(client, registered_user):
    # Request reset
    res = client.post('/api/auth/reset_password', json={'email': registered_user['email']})
    assert res.status_code == 200
    token = res.get_json().get('dev_reset_link', '').split('/')[-1]

    # Confirm reset
    res2 = client.post('/api/auth/reset_password_confirm', json={
        'token': token, 'password': 'BrandNewPass789!'
    })
    assert res2.status_code == 200

    # Login with new password
    res3 = client.post('/api/auth/login', json={
        'email': registered_user['email'], 'password': 'BrandNewPass789!'
    })
    assert res3.status_code == 200


def test_reset_password_invalid_token(client):
    res = client.post('/api/auth/reset_password_confirm', json={
        'token': 'bogustoken', 'password': 'Whatever123!'
    })
    assert res.status_code == 400


# ── Email verification ────────────────────────────────────────────────────────

def test_verify_email_flow(app, client):
    app.config['EMAIL_VERIFY_ENABLED'] = True
    res = client.post('/api/auth/register', json={
        'email': 'verify@example.com', 'name': 'V', 'password': 'Pass123!'
    })
    assert res.status_code == 201
    token = res.get_json().get('dev_verification_token')
    assert token

    res2 = client.post('/api/auth/verify_email', json={'token': token})
    assert res2.status_code == 200
    app.config['EMAIL_VERIFY_ENABLED'] = False


def test_verify_email_expired_token(client):
    res = client.post('/api/auth/verify_email', json={'token': 'expiredtoken'})
    assert res.status_code == 400
