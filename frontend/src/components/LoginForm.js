import React, { useEffect, useState } from "react";
import * as AuthApi from "../api/auth";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { connect } from "react-redux";
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";
import validateEmail from "../utils/validateEmail";
import { Link } from "react-router-dom";
import { REGISTER_URL, RESET_PASS_URL } from "../constants/routes";
import translateErrors from "../utils/translateErrors";
function LoginForm({ onLogin, loading, authError, authActions, authMessage }) {
  // const [loading, setloading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Email is incorrect";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Form is valid, you can submit it or perform further actions
      signin();
    }
  };
  const signin = async function loginFunc() {
    if (typeof onLogin === "function") {
      const x = {
        email: formData.email,
        password: formData.password,
      };
      // if (!this.disableCaptcha) x.captcha = this.state.captcha;
      // setloading({ loading: true });
      await onLogin(x);
      // setloading({ loading: false });
    }
  };
  const clear_auth_error = () => {
    if (authActions && typeof authActions.auth_clear_error === "function") {
      authActions.auth_clear_error();
    }
  };

  useEffect(() => {
    if (authError || authMessage) {
      clear_auth_error();
    }
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <h5 className="card-title text-center mb-5 fw-light fs-5">Sign In</h5>
      <form>
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

        {/* <div className="form-check mb-3">
          <input
          className="form-check-input"
          type="checkbox"
          value=""
          id="rememberPasswordCheck"
          onChange={}
          />
          <label className="form-check-label" htmlFor="rememberPasswordCheck">
          Remember password
          </label>
        </div> */}
        <div className="d-grid">
          <Button
            variant="primary"
            className="btn-login fw-bold"
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            ) : (
              "Sign in"
            )}
          </Button>
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
          <Row>
            <Col>
              <Link to={REGISTER_URL}>
                <Button
                  variant="link"
                  className="d-block text-center mt-2"
                  size="sm"
                >
                  Don't have an account? Register
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
        </div>
        {/* <hr className="my-4" />
        <div className="d-grid mb-2">
          <Button
            className="btn btn-google btn-login fw-bold"
            type="submit"
          >
            <i className="fab fa-google me-2"></i> Sign in with Google
          </Button>
        </div>
        <div className="d-grid">
          <Button
            className="btn btn-facebook btn-login fw-bold"
            type="submit"
          >
            <i className="fab fa-facebook-f me-2"></i> Sign in with Facebook
          </Button>
        </div> */}
      </form>
    </>
  );
}
const mapStateToProps = (state) => ({
  auth: state.auth,
  authError: state.auth.error,
  loggedin: state.auth.loggedin,
  authMessage: state.auth.message,
  loading: state.auth.loading,
});

const mapDispatchToProps = (dispatch) => {
  return {
    onLogin: (data) => AuthApi.api_login(data)(dispatch, {}),
    authActions: bindActionCreators(AuthActions, dispatch),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
