import React, { useState } from "react";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import validateEmail from "../utils/validateEmail";
import * as AuthApi from "../api/auth";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { connect } from "react-redux";
import { Spinner } from "react-bootstrap";
import { LOGIN_URL, RESET_PASS_URL } from "../constants/routes";
import { Link } from "react-router-dom";
import isPasswordStrong from "../utils/isPasswordStrong";
import translateErrors from "../utils/translateErrors";

function RegisterForm({
  loading,
  onRegister,
  authActions,
  authError,
  authMessage,
}) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirm_password: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const clear_auth_error = () => {
    if (authActions && typeof authActions.auth_clear_error === "function") {
      authActions.auth_clear_error();
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const register = async function register_func() {
    if (typeof onRegister === "function") {
      const x = {
        email: formData.email,
        name: formData.name,
        password: formData.password,
      };
      // if (!this.disableCaptcha) x.captcha = this.state.captcha;
      // setloading({ loading: true });
      await onRegister(x);
      // setloading({ loading: false });
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Email is incorrect";
    }
    if (!formData.name) {
      errors.name = "Please Enter a name";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    const strongPass = isPasswordStrong(formData.password);
    if (!strongPass.status) {
      errors.password = strongPass.message;
    }
    if (!formData.confirm_password) {
      errors.confirm_password = "Confirm Password is required";
    }
    if (formData.confirm_password !== formData.password) {
      // errors.password = "Password and Confirm Password must be the same";
      errors.confirm_password =
        "Password and Confirm Password must be the same";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Form is valid, you can submit it or perform further actions
      register();
    }
  };
  if (authMessage === "Registration successful" && formData.email) {
    setFormData({
      email: "",
      name: "",
      password: "",
      confirm_password: "",
    });
  }
  return (
    <>
      <h4 className="card-title text-center mb-5 fw-light fs-5">Register</h4>
      <Form>
        <div className="form-floating mb-3">
          <input
            type="email"
            className={`form-control ${formErrors.email ? "is-invalid" : ""}`}
            id="floatingInput"
            disabled={loading}
            name="email"
            placeholder="name@example.com"
            onChange={handleChange}
            value={formData.email}
          />
          {formErrors.email && (
            <div className="invalid-feedback">{formErrors.email}</div>
          )}
          <label htmlFor="floatingInput">Email address</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="text"
            className={`form-control ${formErrors.name ? "is-invalid" : ""}`}
            id="floatingInputName"
            disabled={loading}
            name="name"
            placeholder="name@example.com"
            onChange={handleChange}
            value={formData.name}
          />
          {formErrors.name && (
            <div className="invalid-feedback">{formErrors.name}</div>
          )}
          <label htmlFor="floatingInputName">Name</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="password"
            className={`form-control ${
              formErrors.password ? "is-invalid" : ""
            }`}
            id="floatingPassword"
            name="password"
            disabled={loading}
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
          />
          {formErrors.password && (
            <div className="invalid-feedback">{formErrors.password}</div>
          )}
          <label htmlFor="floatingPassword">Password</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="password"
            className={`form-control ${
              formErrors.confirm_password ? "is-invalid" : ""
            }`}
            id="floatingConfirmPassword"
            name="confirm_password"
            disabled={loading}
            placeholder="Confirm Password"
            onChange={handleChange}
            value={formData.confirm_password}
          />
          {formErrors.confirm_password && (
            <div className="invalid-feedback">
              {formErrors.confirm_password}
            </div>
          )}
          <label htmlFor="floatingPassword">Confirm Password</label>
        </div>
        <div className="d-grid mb-2">
          <Button
            className="btn-login fw-bold"
            type="submit"
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              "Register"
            )}
          </Button>
        </div>
        {authError ? (
          <Alert
            className="mt-2"
            variant="danger"
            onClose={clear_auth_error}
            dismissible
          >
            {translateErrors(authError)}
          </Alert>
        ) : null}
        {authMessage ? (
          <>
            <Alert
              className="mt-2"
              variant="success"
              onClose={clear_auth_error}
              dismissible
            >
              {authMessage}
              <Link className="alert-link" to={LOGIN_URL}>
                <Button
                  variant="link"
                  className="pt-0 pb-0"
                  onClick={clear_auth_error}
                >
                  Go to Login Page.
                </Button>
              </Link>
            </Alert>
          </>
        ) : null}
        <Row>
          <Col>
            <Link to={LOGIN_URL}>
              <Button
                variant="link"
                className="d-block text-center mt-2"
                size="sm"
              >
                Have an account? Sign In
              </Button>
            </Link>
          </Col>
          <Col>
            <Link to={RESET_PASS_URL} className="float-right">
              <Button variant="link" className="d-block mt-2" size="sm">
                Forgot password? Reset Password
              </Button>
            </Link>
          </Col>
        </Row>
        {/* <hr className="my-4" />

        <div className="d-grid mb-2">
          <Button
            className="btn btn-lg btn-google btn-login fw-bold"
            type="submit"
          >
            <i className="fab fa-google me-2"></i> Sign up with Google
          </Button>
        </div>

        <div className="d-grid">
          <Button
            className="btn btn-lg btn-facebook btn-login fw-bold"
            type="submit"
          >
            <i className="fab fa-facebook-f me-2"></i> Sign up with Facebook
          </Button>
        </div> */}
      </Form>
    </>
  );
}

const mapStateToProps = (state) => ({
  auth: state.auth,
  authMessage: state.auth.message,
  loggedin: state.auth.loggedin,
  authloading: state.auth.loading,
  authError: state.auth.error,
});

const mapDispatchToProps = (dispatch) => {
  return {
    onRegister: (data) => AuthApi.api_register(data)(dispatch, {}),
    authActions: bindActionCreators(AuthActions, dispatch),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(RegisterForm);
