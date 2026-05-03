# AuthAbstract Frontend Redesign Plan

## Context
Current frontend uses Bootstrap/Bootswatch "Litera" theme with submit-time-only validation, no animations, no post-registration redirect, too-wide forms, and a self-signed HTTPS cert that triggers browser warnings. Goal: modern, responsive redesign preserving the navy blue (#22528e) + Charter/Canela font DNA.

---

## Phase 1: HTTPS Fix + Design Foundation

### 1.1 Fix HTTPS (mkcert)
**Problem**: `nginx/Dockerfile` generates a self-signed cert with OpenSSL — browsers don't trust it.

**Fix**: Use `mkcert` to generate a locally-CA-trusted cert pair, mount via docker-compose volume.

- Extend `setup.sh`:
  ```sh
  mkcert -install
  mkdir -p nginx/ssl
  mkcert -key-file nginx/ssl/localhost.key -cert-file nginx/ssl/localhost.crt localhost 127.0.0.1
  ```
- `nginx/Dockerfile`: remove the `openssl req` RUN step, just copy nginx.conf
- `docker-compose.yml`: add volume `./nginx/ssl:/etc/nginx/ssl:ro` to the nginx service
- `.gitignore`: add `nginx/ssl/`

**Files**: `nginx/Dockerfile`, `docker-compose.yml`, `setup.sh`

### 1.2 SCSS Design Tokens
Populate `frontend/src/styles/base/variables.scss` (currently empty):
```scss
$auth-form-max-width: 480px;
$transition-fast: 0.15s ease;
$transition-base: 0.2s ease;
$transition-smooth: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
$radius-input: 6px;
$radius-card: 12px;
$shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
$shadow-md: 0 4px 16px rgba(0,0,0,0.12);
```

### 1.3 Narrow Form Width
Add `.auth-form-wrapper` constraint to auth page SCSS:
```scss
.auth-form-wrapper {
  max-width: $auth-form-max-width;
  width: 100%;
  margin: 0 auto;
}
```
Apply wrapper `<div>` in `LoginPage.js` and `RegisterPage.js`.

---

## Phase 2: UI Redesign

### Design Direction
Keep: navy `#22528e`, Charter/Canela fonts, minimal philosophy.
Change: Replace Bootswatch Litera generic look with an editorial-meets-product aesthetic.

### 2.1 Auth Page Split Layout
Replace centered single-column Bootstrap card with a two-column layout:

- **Left panel** (60% desktop, hidden mobile): Large Charter display heading ("Welcome back." / "Create your account."), CSS-only navy gradient background with subtle geometric shapes via `clip-path` or pseudo-elements — no images.
- **Right panel** (40% desktop, full-width mobile): White/off-white background, narrow form.

**Files**: `LoginPage.js`, `RegisterPage.js`, new `frontend/src/styles/pages/authPage.scss`

### 2.2 Input Field Redesign
Replace Bootstrap default inputs with custom floated-label inputs:
- Label sits inside input, floats up on focus or when filled
- Bottom-border-only style on focus (no full box border on focus)
- Password strength meter bar below password field (red/orange/green fill)
- Show/hide password toggle (eye icon) inside input

**Files**: `RegisterForm.js`, `LoginForm.js`, new `frontend/src/styles/components/auth-inputs.scss`

### 2.3 Button Redesign
Primary CTA: full-width, navy fill, Charter font, slight uppercase letter-spacing, hover lift (`translateY(-1px)` + shadow bump).

### 2.4 Responsive Breakpoints
- `>= 768px`: two-column split
- `< 768px`: single column, left panel hidden, form full-width with 24px side padding
- Use `clamp()` for heading fluid type scale

---

## Phase 3: UX & Animations

### 3.1 Inline Validation
Add blur-first validation — validate on blur, re-validate on `onChange` only if the field was already touched:

```javascript
const [touched, setTouched] = useState({});

const handleBlur = (field) => {
  setTouched(prev => ({ ...prev, [field]: true }));
  // run single-field validation and update formErrors state
};

// In onChange: if (touched[field]) validateField(field);
```

Reuse existing utils: `validateEmail.js`, `isPasswordStrong.js`.

Fields: email format, password strength, confirm-password match, name required.

**Files**: `RegisterForm.js`, `LoginForm.js`

### 3.2 Post-Registration Redirect
On successful register: show checkmark success state → auto-redirect to `/login` after 2s.

```javascript
// After authMessage received in RegisterForm.js
useEffect(() => {
  if (props.authMessage) {
    setRegistered(true);
    const t = setTimeout(() => navigate(ROUTES.LOGIN_URL), 2000);
    return () => clearTimeout(t);
  }
}, [props.authMessage]);
```

Use React Router v6 `useNavigate` (already used in other pages). **File**: `RegisterForm.js`

### 3.3 Animations
All pure CSS — no extra libraries.

| Effect | Implementation |
|--------|----------------|
| Page enter | `@keyframes pageEnter` — opacity 0→1, translateY 12px→0, 0.3s; applied to route wrapper in `App.js` |
| Input label float | `transition: 0.2s ease` on label position/size |
| Button hover lift | `transform: translateY(-1px)`, `transition: 0.15s ease` |
| Alert appear | `@keyframes slideDown` — translateY -8px→0 + opacity, 0.25s |
| Form shake on error | `@keyframes shake` — horizontal bounce, 0.4s, applied to `.auth-form-wrapper.error` |
| Register success | SVG checkmark with `stroke-dasharray` + `stroke-dashoffset` draw animation, 0.5s |

**Files**: `variables.scss`, `auth-inputs.scss`, `base-style.scss`, `App.js`

---

## Verification Checklist
1. `setup.sh` → `docker compose up --build` → `https://localhost` shows green trusted lock
2. Register: type email, blur → inline error/valid appears immediately
3. Password field: strength meter bar fills as you type
4. Submit valid form → animated checkmark → redirects to `/login` in 2s
5. Forms max ~480px wide on desktop
6. Resize to mobile → single-column, no horizontal scroll
7. Page load: form fades+slides in; form error: shakes; alerts slide down
