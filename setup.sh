#!/usr/bin/env bash
set -euo pipefail

# ── colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
fail()    { echo -e "${RED}[FAIL]${RESET}  $*" >&2; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "\n${BOLD}AuthAbstract - one-command setup${RESET}\n"

# ── 1. prerequisites ──────────────────────────────────────────────────────────
info "Checking prerequisites..."

command -v docker  >/dev/null 2>&1 || fail "Docker not found. Install from https://docs.docker.com/get-docker/"
command -v mkcert  >/dev/null 2>&1 || fail "mkcert not found. Install it: brew install mkcert"
command -v openssl >/dev/null 2>&1 || fail "openssl not found. Install it: brew install openssl"

# Accept both 'docker compose' (v2) and 'docker-compose' (v1)
if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE="docker-compose"
else
    fail "Docker Compose not found. Update Docker Desktop or run: pip install docker-compose"
fi

success "Docker, Compose, mkcert, and openssl all present."

# ── 2. mkcert — locally-trusted SSL cert ─────────────────────────────────────
info "Installing mkcert root CA and generating localhost cert..."
mkcert -install
mkdir -p nginx/ssl
mkcert -key-file nginx/ssl/localhost.key -cert-file nginx/ssl/localhost.crt localhost 127.0.0.1
success "Trusted SSL cert generated in nginx/ssl/."

# ── 3. environment file ───────────────────────────────────────────────────────
if [[ -f .env ]]; then
    warn ".env already exists — skipping generation (delete it to regenerate)."
else
    info "Generating .env from .env.example with secure random secrets..."

    DB_PASS=$(openssl rand -hex 20)
    SECRET=$(openssl rand -hex 32)
    JWT_SECRET=$(openssl rand -hex 32)
    V_SALT=$(openssl rand -hex 16)
    R_SALT=$(openssl rand -hex 16)

    sed \
        -e "s|CHANGE_ME_strong_password_here|${DB_PASS}|g" \
        -e "s|CHANGE_ME_generate_with_openssl_rand_hex_32|${SECRET}|1" \
        -e "s|CHANGE_ME_generate_with_openssl_rand_hex_32|${JWT_SECRET}|1" \
        -e "s|CHANGE_ME_random_string|${V_SALT}|1" \
        -e "s|CHANGE_ME_random_string|${R_SALT}|1" \
        .env.example > .env

    success ".env created with generated secrets."
fi

# ── 3. Python venv + backend tests (no DB needed – SQLite in-memory) ──────────
info "Setting up Python venv and running backend tests..."

VENV_DIR="$SCRIPT_DIR/.venv-test"

if [[ ! -d "$VENV_DIR" ]]; then
    python3 -m venv "$VENV_DIR"
fi

"$VENV_DIR/bin/pip" install --quiet --upgrade pip
"$VENV_DIR/bin/pip" install --quiet -r backend/requirements.txt

success "Dependencies installed."

info "Running pytest..."
echo ""
(
    cd backend
    "$VENV_DIR/bin/pytest" app/tests/ -v
)
echo ""
success "All tests passed."

# ── 4. build + start Docker services ─────────────────────────────────────────
info "Building Docker images (this takes a minute on first run)..."
$COMPOSE build --quiet

info "Starting services..."
$COMPOSE up -d

# ── 5. wait for backend health ────────────────────────────────────────────────
info "Waiting for backend to be ready..."
ATTEMPTS=0
MAX=30
until curl -sf http://localhost/api/auth/health >/dev/null 2>&1 || \
      curl -sfk https://localhost/api/auth/health >/dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [[ $ATTEMPTS -ge $MAX ]]; then
        warn "Backend health check timed out. Services may still be starting."
        warn "Check logs with:  docker compose logs -f"
        break
    fi
    sleep 3
done

if [[ $ATTEMPTS -lt $MAX ]]; then
    success "Backend is up."
fi

# ── 6. status summary ─────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}────────────────────────────────────────${RESET}"
echo -e "${GREEN}  Setup complete!${RESET}"
echo -e "${BOLD}────────────────────────────────────────${RESET}"
echo ""
echo -e "  App URL  : ${CYAN}https://localhost${RESET}  (trusted cert via mkcert — green lock)"
echo -e "  API base : ${CYAN}https://localhost/api/auth${RESET}"
echo ""
echo -e "  Useful commands:"
echo -e "    ${YELLOW}$COMPOSE logs -f${RESET}          stream logs"
echo -e "    ${YELLOW}$COMPOSE down${RESET}             stop services"
echo -e "    ${YELLOW}$COMPOSE down -v${RESET}          stop + wipe DB volume"
echo ""
