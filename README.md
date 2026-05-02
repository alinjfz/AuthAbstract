# AuthAbstract

**A production-ready authentication starter kit. Clone it, configure it, and build your app on top — auth is already done.**

AuthAbstract gives you a complete, secure authentication system out of the box so you never have to implement login, registration, password reset, or email verification from scratch again. Every auth concern is solved: JWT tokens in httpOnly cookies, Alembic migrations, Docker deployment, rate limiting, HTTPS, and a clean React frontend. Your job is to add your features, not re-implement auth for the fifth time.

---

## What You Get — Out of the Box

### Authentication Features (nothing to implement)

| Feature | Status | Notes |
|---|---|---|
| User registration | Ready | Name + email + password |
| Login / Logout | Ready | JWT in httpOnly cookie |
| Email verification | Ready | Toggle on/off per environment |
| Password reset via email | Ready | Token-based, time-limited |
| Profile view + name update | Ready | Protected endpoint |
| Change password | Ready | Requires current password |
| Protected route guards | Ready | Frontend + backend both enforced |
| Auth-aware navbar | Ready | Shows login/logout based on state |

### Infrastructure (nothing to configure beyond `.env`)

| Feature | Details |
|---|---|
| PostgreSQL database | Postgres 16 via Docker, UUID primary keys |
| Alembic migrations | Schema versioned, runs automatically on container start |
| Docker Compose | 4 services: db, backend, frontend, nginx |
| nginx reverse proxy | Routes `/api/*` → Flask, `/*` → React |
| HTTPS / TLS | Self-signed cert generated at build time (swap for real cert in prod) |
| Rate limiting | 10 req/min on auth endpoints, 30 req/min general API |
| Security headers | HSTS, X-Frame-Options, CSP, nosniff, XSS protection |
| CORS | Configurable allowed origins, cookie-aware |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11 · Flask · SQLAlchemy · Alembic · Flask-Mail |
| Auth | PyJWT · httpOnly cookies · `@jwt_required` decorator |
| Frontend | React 18 (Create React App) · Redux Toolkit · React Router 6 · Bootstrap 5 |
| Database | PostgreSQL 16 |
| Proxy | nginx (rate limiting · TLS · security headers) |
| Deployment | Docker Compose |

---

## Architecture

```
Browser
  └── HTTPS :443
        └── nginx  (TLS termination · rate limiting · security headers)
              ├── /api/*   →  backend:8000   (Flask + gunicorn)
              └── /*       →  frontend:80    (React SPA served by nginx)

backend:8000
  └── PostgreSQL:5432

Volumes: postgres_data
```

### Auth Flow (JWT in httpOnly cookie)

```
1. POST /api/auth/login  →  server validates credentials
2. Server signs JWT (HS256), sets it as httpOnly cookie (not readable by JS)
3. Browser sends cookie automatically on every subsequent request
4. @jwt_required decorator validates the token on protected endpoints
5. POST /api/auth/logout  →  server clears the cookie
```

The cookie approach gives you stateless JWTs (no session store needed, scales horizontally) while keeping the token out of JavaScript reach (no XSS risk). `SameSite=Strict` provides CSRF protection for same-domain Docker deployments.

---

## Quick Start (Docker)

**Requirements:** Docker and Docker Compose installed.

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/AuthAbstract.git
cd AuthAbstract

# 2. Configure
cp .env.example .env
# Open .env and set at minimum:
#   DB_PASSWORD=<strong_password>
#   SECRET_KEY=<run: openssl rand -hex 32>
#   JWT_SECRET_KEY=<run: openssl rand -hex 32>

# 3. Start
docker compose up --build

# 4. Open https://localhost
# Accept the self-signed certificate warning (expected in dev)
```

That's it. Register an account and explore the auth flows.

### Generate Secrets

```bash
openssl rand -hex 32   # use for SECRET_KEY and JWT_SECRET_KEY
openssl rand -hex 16   # use for VERIFICATION_SALT and RESET_PASSWORD_SALT
```

---

## Local Development (without Docker)

Run backend and frontend separately for faster iteration.

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# You need a running PostgreSQL instance.
# Set DATABASE_URL in your .env, then:
alembic upgrade head
flask run
# Backend available at http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:5000 npm start
# Frontend available at http://localhost:3000
```

> **Why `REACT_APP_API_URL`?** In Docker, nginx proxies `/api/*` to the backend on the same origin, so no explicit base URL is needed. In local dev without nginx, you need to point the frontend directly at the Flask server.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. All configuration is environment-driven — no hardcoded secrets.

### Required

| Variable | Description |
|---|---|
| `DB_PASSWORD` | PostgreSQL password. Choose something strong. |
| `SECRET_KEY` | Flask secret key. Used for session signing and email tokens. Generate with `openssl rand -hex 32`. |
| `JWT_SECRET_KEY` | Key used to sign JWT tokens. Must be secret and random. Generate with `openssl rand -hex 32`. |

### Optional (have safe defaults)

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` | `authdb` | PostgreSQL database name |
| `POSTGRES_USER` | `authuser` | PostgreSQL username |
| `JWT_EXPIRE_MINUTES` | `480` (8 hours) | How long a JWT token lives |
| `VERIFICATION_SALT` | — | Salt for email verification tokens. Set to something random. |
| `RESET_PASSWORD_SALT` | — | Salt for password reset tokens. Set to something random. |
| `EMAIL_TOKEN_EXPIRY` | `3600` | Email token lifetime in seconds (1 hour) |
| `EMAIL_VERIFY_ENABLED` | `False` | Set `True` to require email verification on registration |
| `MAIL_ENABLED` | `False` | Set `True` to send real emails (requires MAIL_* settings below) |
| `FRONTEND_URL` | `https://localhost` | Used in email links |
| `ALLOWED_ORIGINS` | `http://localhost:3000,https://localhost` | Comma-separated CORS allowed origins |

### Mail (only if `MAIL_ENABLED=True`)

| Variable | Description |
|---|---|
| `MAIL_SERVER` | SMTP server (e.g. `smtp.gmail.com`) |
| `MAIL_PORT` | SMTP port (e.g. `587` for TLS) |
| `MAIL_USERNAME` | SMTP username / email address |
| `MAIL_PASSWORD` | SMTP password or app password |
| `MAIL_DEFAULT_SENDER` | From address for outgoing emails |

### Development Without SMTP

When `MAIL_ENABLED=False` (the default), email tokens are returned directly in the API response instead of being sent by email. This lets you test the full verification and password-reset flows without any SMTP setup:

```json
// POST /api/auth/register response when MAIL_ENABLED=False:
{
  "message": "Registered successfully.",
  "dev_verification_token": "eyJ0eXAiOiJ..."
}
```

Copy the token, paste it into the verification endpoint — the full flow works end-to-end.

---

## API Endpoints

All endpoints are prefixed with `/api/auth`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create account. Returns `dev_verification_token` if mail is off. |
| `POST` | `/login` | Public | Validate credentials, set JWT cookie. |
| `POST` | `/logout` | Protected | Clear JWT cookie. |
| `GET` | `POST /profile` | Protected | Get or update user profile. |
| `POST` | `/change_password` | Protected | Change password (requires current password). |
| `POST` | `/send_verification` | Public | Re-send verification email. |
| `POST` | `/verify_email` | Public | Verify email with token from link or dev response. |
| `POST` | `/reset_password` | Public | Send password reset email. |
| `POST` | `/reset_password_confirm` | Public | Set new password using reset token. |

### Request/Response Examples

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}

// Response sets httpOnly cookie: auth_token=<jwt>
// Body:
{
  "message": "Login successful.",
  "user": { "email": "alice@example.com", "name": "Alice", "is_verified": false },
  "config": { "email_verify_enabled": false }
}
```

**Protected endpoint (non-browser client)**
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```
Both cookie and `Authorization: Bearer` header are accepted, so non-browser clients (mobile apps, CLIs) work too.

---

## Project Structure

```
AuthAbstract/
├── backend/
│   ├── app/
│   │   ├── __init__.py           Flask app factory; extensions init; CORS
│   │   ├── config.py             All config loaded from environment variables
│   │   ├── models.py             User model only (UUID PK, bcrypt password)
│   │   ├── auth/
│   │   │   ├── views.py          9 endpoints: register, login, logout, profile,
│   │   │   │                     change_password, send_verification, verify_email,
│   │   │   │                     reset_password, reset_password_confirm
│   │   │   ├── jwt_utils.py      create_access_token, decode_token, @jwt_required
│   │   │   └── utils.py          Email sending with dev/prod toggle
│   │   ├── templates/
│   │   │   ├── verify_email.html
│   │   │   └── reset_password_email.html
│   │   └── tests/
│   │       ├── conftest.py       Test fixtures; TestConfig with SQLite in-memory
│   │       └── test_auth.py      13 tests covering full auth lifecycle
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 0001_initial_users_table.py
│   ├── alembic.ini
│   ├── app.py                    Entry point
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── App.js                Router; protected/public route split
│       ├── api/
│       │   └── auth.js           9 async thunks; withCredentials for cookie flow
│       ├── actions/auth.js
│       ├── reducers/
│       │   ├── auth.js           State: user, config, loggedin, loading, error
│       │   └── index.js
│       ├── constants/
│       │   ├── ApiRoutes.js      All API paths; reads REACT_APP_API_URL
│       │   ├── Auth.js           Redux action type constants
│       │   └── routes.js         Frontend route paths
│       ├── pages/                LoginPage, RegisterPage, ProfilePage, etc.
│       └── components/           LoginForm, RegisterForm, ProfileForm, etc.
│
├── nginx/
│   ├── Dockerfile                Generates self-signed cert at build time
│   └── nginx.conf                Rate limiting, TLS, security headers, proxy rules
│
├── .env.example                  Template — copy to .env and fill in secrets
├── .gitignore
├── docker-compose.yml
├── LICENSE
└── README.md
```

---

## Adding Your First Feature

AuthAbstract is the foundation. Here's how to build on top of it:

### 1. Add a Backend Model

```python
# backend/app/models.py
import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from . import db

class Post(db.Model):
    __tablename__ = "posts"

    id      = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title   = Column(String(500), nullable=False)
    body    = Column(String, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
```

### 2. Generate a Migration

```bash
cd backend
alembic revision --autogenerate -m "add posts table"
alembic upgrade head
```

In Docker: just restart the backend container — migrations run automatically on start.

### 3. Create a Blueprint

```python
# backend/app/posts/__init__.py
from flask import Blueprint
posts_bp = Blueprint('posts', __name__)
from . import views  # noqa

# backend/app/posts/views.py
from flask import jsonify
from . import posts_bp
from ..auth.jwt_utils import jwt_required
from ..models import Post

@posts_bp.route('/', methods=['GET'])
@jwt_required
def list_posts(current_user):
    posts = Post.query.filter_by(user_id=current_user.id).all()
    return jsonify([{'id': str(p.id), 'title': p.title} for p in posts])
```

### 4. Register the Blueprint

```python
# backend/app/__init__.py  — inside create_app()
from app.posts import posts_bp
app.register_blueprint(posts_bp, url_prefix='/api/posts')
```

### 5. Add a Frontend Page

```jsx
// frontend/src/pages/PostsPage.js
import { useEffect, useState } from 'react';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts/', { credentials: 'include' })
      .then(r => r.json())
      .then(setPosts);
  }, []);

  return (
    <div className="container mt-5">
      <h1>My Posts</h1>
      {posts.map(p => <div key={p.id}>{p.title}</div>)}
    </div>
  );
}
```

### 6. Add the Route

```jsx
// frontend/src/App.js
import PostsPage from './pages/PostsPage';

// Add inside your router:
<Route path="/posts" element={<ProtectedRoute><PostsPage /></ProtectedRoute>} />
```

That's a complete feature cycle. The auth plumbing (`current_user` injection, JWT validation, cookie handling, Redux state) is already wired up — you just write your business logic.

---

## Running Tests

```bash
cd backend
pip install pytest
pytest app/tests/ -v
```

Tests use an in-memory SQLite database and a `TestConfig` that disables email sending and sets `JWT_COOKIE_SECURE=False` (so cookies work over HTTP in tests). No database setup required.

**Coverage:**

| Test | What it covers |
|---|---|
| `test_register_success` | Happy-path registration |
| `test_register_duplicate_email` | Uniqueness constraint |
| `test_register_invalid_email` | Email format validation |
| `test_login_success` | Credentials + cookie set |
| `test_login_wrong_password` | 401 on bad password |
| `test_login_unverified_user` | 403 when verify is enabled |
| `test_protected_route_without_auth` | 401 on missing token |
| `test_protected_route_with_auth` | Cookie-authenticated request |
| `test_send_verification_email` | Dev token returned in response |
| `test_verify_email_token` | Token accepted, user verified |
| `test_verify_email_expired_token` | Expired token rejected |
| `test_reset_password_flow` | Full reset: request → confirm |
| `test_change_password` | Authenticated password change |

---

## Deployment to Production

### Replace the Self-Signed Certificate

The nginx Dockerfile generates a self-signed cert for local use. For production, mount a real certificate:

```yaml
# docker-compose.prod.yml
nginx:
  volumes:
    - /etc/letsencrypt/live/yourdomain.com/fullchain.pem:/etc/nginx/ssl/authabstract.crt:ro
    - /etc/letsencrypt/live/yourdomain.com/privkey.pem:/etc/nginx/ssl/authabstract.key:ro
```

Or use Certbot with the `--webroot` plugin and mount the challenge directory.

### Production Environment Variables

```bash
# Tighten these for production:
EMAIL_VERIFY_ENABLED=True
MAIL_ENABLED=True
JWT_COOKIE_SECURE=True           # already True by default
SESSION_COOKIE_SECURE=True       # already True by default
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com
```

### Scaling the Backend

Because JWTs are stateless, you can run multiple backend instances without a shared session store:

```yaml
backend:
  deploy:
    replicas: 3
```

nginx round-robins across them automatically. The database is the only shared state.

---

## Security Design

| Concern | How it's handled |
|---|---|
| Token storage | httpOnly cookie — not readable by JavaScript |
| CSRF | `SameSite=Strict` cookie — browser won't send on cross-site requests |
| XSS | Token never touches JS; CSP headers from nginx |
| Brute force | Rate limiting: 10 req/min on login/register/reset endpoints |
| Password storage | `werkzeug.security.generate_password_hash` (PBKDF2-SHA256) |
| Token expiry | JWT expires in 8 hours by default; configurable |
| Email tokens | `itsdangerous.URLSafeTimedSerializer` with per-type salts and max-age |
| Transport | TLS enforced at nginx; HTTP → HTTPS redirect |
| Security headers | HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, X-XSS-Protection |
| SQL injection | SQLAlchemy ORM with parameterized queries |
| Non-browser clients | `Authorization: Bearer <token>` header also accepted |

---

## Feature Toggles

Two environment flags let you ship the same codebase to different environments without code changes:

```
EMAIL_VERIFY_ENABLED=False   # True  = user must verify email before login
MAIL_ENABLED=False           # True  = send real emails via SMTP
```

In development (`MAIL_ENABLED=False`), tokens appear in API responses so you can test flows without an SMTP server. In production, flip both to `True` and configure the `MAIL_*` variables.

---

## Contributing

1. Fork and clone
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes
4. Run tests: `cd backend && pytest app/tests/ -v`
5. Open a pull request

---

## License

MIT — see [LICENSE](LICENSE).
