import React, { useEffect, useState } from "react";
import * as AuthApi from "../api/auth";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { connect } from "react-redux";
import { Alert, Button, Col, Row, Spinner } from "react-bootstrap";
import translateErrors from "../utils/translateErrors";
import { Link } from "react-router-dom";
import validateEmail from "../utils/validateEmail";
import { DASHBOARD_URL, LOGIN_URL, REGISTER_URL } from "../constants/routes";
function SendResetPassForm({
  onSendResetPass,
  loading,
  authError,
  authActions,
  authMessage,
}) {
  const [formData, setFormData] = useState({
    email: "",
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
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      // Form is valid, you can submit it or perform further actions
      send_reset_pass();
    }
  };
  const send_reset_pass = async function send_reset_pass_Func() {
    if (typeof onSendResetPass === "function") {
      const x = {
        email: formData.email,
      };
      await onSendResetPass(x);
    }
  };
  const clear_auth_error = () => {
    if (
      authActions &&
      typeof authActions.auth_clear_error === "function" &&
      (authError || authMessage)
    ) {
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
      <h5 className="card-title text-center mb-5 fw-light fs-5">
        Reset Password
      </h5>
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
          <label htmlFor="floatingPass">Email</label>
        </div>
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
              "Reset Password"
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
          {authMessage ? (
            <>
              <Alert
                className="mt-2"
                variant="success"
                onClose={clear_auth_error}
                dismissible
              >
                {authMessage}
                <Link className="alert-link" to={DASHBOARD_URL}>
                  <Button
                    variant="link"
                    className="pt-0 pb-0"
                    onClick={clear_auth_error}
                  >
                    Go to Home Page.
                  </Button>
                </Link>
              </Alert>
            </>
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
              <Link to={LOGIN_URL} className="float-right">
                <Button variant="link" className="d-block mt-2" size="sm">
                  Have an account? Sign in
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </form>
    </>
  );
}
const mapStateToProps = (state) => ({
  auth: state.auth,
  authError: state.auth.error,
  authMessage: state.auth.message,
  loading: state.auth.loading,
});

const mapDispatchToProps = (dispatch) => {
  return {
    onSendResetPass: (data) => AuthApi.api_send_reset_pass(data)(dispatch, {}),
    authActions: bindActionCreators(AuthActions, dispatch),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SendResetPassForm);
