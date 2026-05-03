import React, { useEffect, useState } from "react";
import * as AuthApi from "../api/auth";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { connect } from "react-redux";
import validateEmail from "../utils/validateEmail";
import { Link } from "react-router-dom";
import { REGISTER_URL, RESET_PASS_URL } from "../constants/routes";
import translateErrors from "../utils/translateErrors";

function LoginForm({ onLogin, loading, authError, authActions }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);

  const clear_auth_error = () => {
    if (authActions && typeof authActions.auth_clear_error === "function") {
      authActions.auth_clear_error();
    }
  };

  useEffect(() => {
    clear_auth_error();
    // eslint-disable-next-line
  }, []);

  const validateField = (field, value) => {
    if (field === "email") {
      if (!value) return "Email is required";
      if (!validateEmail(value)) return "Email is invalid";
    }
    if (field === "password") {
      if (!value) return "Password is required";
    }
    return undefined;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
    };
    setFormErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onLogin({ email: formData.email, password: formData.password });
  };

  return (
    <div className={`auth-form-wrapper${shake ? " error" : ""}`}>
      <h2 className="auth-form-title">Sign in.</h2>

      {authError && (
        <div className="auth-alert auth-alert-error">
          <span>{translateErrors(authError)}</span>
          <button className="auth-alert-close" onClick={clear_auth_error} type="button">
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div
          className={`auth-field${formErrors.email ? " auth-field--error" : touched.email && !formErrors.email ? " auth-field--valid" : ""}`}
        >
          <input
            type="email"
            id="login-email"
            name="email"
            value={formData.email}
            placeholder=" "
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          <label htmlFor="login-email">Email address</label>
          {formErrors.email && (
            <span className="field-error">{formErrors.email}</span>
          )}
        </div>

        {/* Password */}
        <div
          className={`auth-field auth-field-password${formErrors.password ? " auth-field--error" : touched.password && !formErrors.password ? " auth-field--valid" : ""}`}
        >
          <input
            type={showPassword ? "text" : "password"}
            id="login-password"
            name="password"
            value={formData.password}
            placeholder=" "
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          <label htmlFor="login-password">Password</label>
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
          {formErrors.password && (
            <span className="field-error">{formErrors.password}</span>
          )}
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : "Sign in"}
        </button>
      </form>

      <div className="auth-links">
        <Link to={REGISTER_URL}>Don't have an account? Register</Link>
        <Link to={RESET_PASS_URL}>Forgot password?</Link>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  authError: state.auth.error,
  loggedin: state.auth.loggedin,
  authMessage: state.auth.message,
  loading: state.auth.loading,
});

const mapDispatchToProps = (dispatch) => ({
  onLogin: (data) => AuthApi.api_login(data)(dispatch, {}),
  authActions: bindActionCreators(AuthActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
