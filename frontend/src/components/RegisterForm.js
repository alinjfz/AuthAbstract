import React, { useEffect, useState } from "react";
import validateEmail from "../utils/validateEmail";
import * as AuthApi from "../api/auth";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { connect } from "react-redux";
import { DASHBOARD_URL, LOGIN_URL, RESET_PASS_URL } from "../constants/routes";
import { Link, useNavigate } from "react-router-dom";
import isPasswordStrong from "../utils/isPasswordStrong";
import translateErrors from "../utils/translateErrors";

function RegisterForm({ authloading: loading, onRegister, authActions, authError, authMessage, showWelcomeModal }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirm_password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [shake, setShake] = useState(false);

  const clear_auth_error = () => {
    if (authActions && typeof authActions.auth_clear_error === "function") {
      authActions.auth_clear_error();
    }
  };

  useEffect(() => {
    if (authMessage) {
      setRegistered(true);
      const t = setTimeout(() => navigate(LOGIN_URL), 2000);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line
  }, [authMessage]);

  useEffect(() => {
    if (showWelcomeModal) navigate(DASHBOARD_URL);
    // eslint-disable-next-line
  }, [showWelcomeModal]);

  const validateField = (field, value, data) => {
    const d = data || formData;
    if (field === "email") {
      if (!value) return "Email is required";
      if (!validateEmail(value)) return "Email is invalid";
    }
    if (field === "name") {
      if (!value) return "Name is required";
    }
    if (field === "password") {
      if (!value) return "Password is required";
    }
    if (field === "confirm_password") {
      if (!value) return "Please confirm your password";
      if (value !== d.password) return "Passwords do not match";
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
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    if (touched[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, newData),
      }));
    }
    // Re-validate confirm_password when password changes
    if (name === "password" && touched.confirm_password) {
      setFormErrors((prev) => ({
        ...prev,
        confirm_password: validateField("confirm_password", newData.confirm_password, newData),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, name: true, password: true, confirm_password: true });
    const errors = {
      email: validateField("email", formData.email),
      name: validateField("name", formData.name),
      password: validateField("password", formData.password),
      confirm_password: validateField("confirm_password", formData.confirm_password),
    };
    setFormErrors(errors);
    if (Object.values(errors).some(Boolean)) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onRegister({ email: formData.email, name: formData.name, password: formData.password });
  };

  const pwStrength = formData.password ? isPasswordStrong(formData.password) : null;
  const strengthClass = pwStrength
    ? pwStrength.sec === "strong"
      ? "strong"
      : pwStrength.sec === "medium"
      ? "medium"
      : "weak"
    : "";

  if (registered) {
    return (
      <div className="auth-success-state">
        <svg className="auth-checkmark" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="24" />
          <path d="M14 27l7 7 17-17" />
        </svg>
        <p className="success-heading">Registration successful!</p>
        <p className="success-sub">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <div className={`auth-form-wrapper${shake ? " error" : ""}`}>
      <h2 className="auth-form-title">Create account.</h2>

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
            id="reg-email"
            name="email"
            value={formData.email}
            placeholder=" "
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          <label htmlFor="reg-email">Email address</label>
          {formErrors.email && (
            <span className="field-error">{formErrors.email}</span>
          )}
        </div>

        {/* Name */}
        <div
          className={`auth-field${formErrors.name ? " auth-field--error" : touched.name && !formErrors.name ? " auth-field--valid" : ""}`}
        >
          <input
            type="text"
            id="reg-name"
            name="name"
            value={formData.name}
            placeholder=" "
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          <label htmlFor="reg-name">Full name</label>
          {formErrors.name && (
            <span className="field-error">{formErrors.name}</span>
          )}
        </div>

        {/* Password */}
        <div
          className={`auth-field auth-field-password${formErrors.password ? " auth-field--error" : touched.password && !formErrors.password ? " auth-field--valid" : ""}`}
        >
          <input
            type={showPassword ? "text" : "password"}
            id="reg-password"
            name="password"
            value={formData.password}
            placeholder=" "
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          <label htmlFor="reg-password">Password</label>
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

        {/* Password strength bar */}
        {formData.password && (
          <div className="pw-strength">
            <div className={`pw-strength__bar ${strengthClass}`} />
          </div>
        )}

        {/* Confirm Password */}
        <div
          className={`auth-field auth-field-password${formErrors.confirm_password ? " auth-field--error" : touched.confirm_password && !formErrors.confirm_password ? " auth-field--valid" : ""}`}
        >
          <input
            type={showConfirm ? "text" : "password"}
            id="reg-confirm"
            name="confirm_password"
            value={formData.confirm_password}
            placeholder=" "
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          <label htmlFor="reg-confirm">Confirm password</label>
          <button
            type="button"
            className="pw-toggle"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
          </button>
          {formErrors.confirm_password && (
            <span className="field-error">{formErrors.confirm_password}</span>
          )}
        </div>

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? <span className="btn-spinner" /> : "Create account"}
        </button>
      </form>

      <div className="auth-links">
        <Link to={LOGIN_URL}>Already have an account? Sign in</Link>
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
  authMessage: state.auth.message,
  loggedin: state.auth.loggedin,
  authloading: state.auth.loading,
  authError: state.auth.error,
  showWelcomeModal: state.auth.show_welcome_modal,
});

const mapDispatchToProps = (dispatch) => ({
  onRegister: (data) => AuthApi.api_register(data)(dispatch, {}),
  authActions: bindActionCreators(AuthActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
