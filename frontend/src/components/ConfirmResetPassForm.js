import React, { useEffect, useState } from "react";
import * as AuthApi from "../api/auth";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { connect } from "react-redux";
import { Alert, Button, Spinner } from "react-bootstrap";
import { DASHBOARD_URL } from "../constants/routes";
import translateErrors from "../utils/translateErrors";
import { Link } from "react-router-dom";
import isPasswordStrong from "../utils/isPasswordStrong";
function ConfirmResetPassForm({
  onConfirmResetPass,
  loading,
  token,
  authError,
  authActions,
  authMessage,
}) {
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_new_password: "",
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
    if (!formData.new_password) {
      errors.new_password = "New password is required";
    }
    const strongPass = isPasswordStrong(formData.new_password);
    if (!strongPass.status) {
      errors.new_password = strongPass.message;
    }
    if (!formData.confirm_new_password) {
      errors.confirm_new_password = "Password confirmation is required";
    } else if (formData.new_password !== formData.confirm_new_password) {
      errors.confirm_new_password =
        "New password and confirm password must be the same";
    }
    setFormErrors(errors);

    if (Object.keys(errors).length === 0) {
      // Form is valid, you can submit it or perform further actions
      confirm_change_pass();
    }
  };
  const confirm_change_pass = async function confirm_change_pass_Func() {
    if (typeof onConfirmResetPass === "function") {
      const x = {
        password: formData.new_password,
        token,
      };
      await onConfirmResetPass(x);
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
        Resetting Password
      </h5>
      <form>
        <div className="form-floating mb-3">
          <input
            type="password"
            className={`form-control ${
              formErrors.new_password ? "is-invalid" : ""
            }`}
            id="floatingNewPass"
            name="new_password"
            disabled={loading}
            placeholder="New Password"
            onChange={handleChange}
            value={formData.new_password}
          />
          {formErrors.new_password && (
            <div className="invalid-feedback">{formErrors.new_password}</div>
          )}
          <label htmlFor="floatingNewPass">New Password</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="password"
            className={`form-control ${
              formErrors.confirm_new_password ? "is-invalid" : ""
            }`}
            id="floatingConPass"
            name="confirm_new_password"
            disabled={loading}
            placeholder="Confirm New Password"
            onChange={handleChange}
            value={formData.confirm_new_password}
          />
          {formErrors.confirm_new_password && (
            <div className="invalid-feedback">
              {formErrors.confirm_new_password}
            </div>
          )}
          <label htmlFor="floatingConPass">Confirm New Password</label>
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
              "Set New Password"
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
        </div>
      </form>
    </>
  );
}
const mapStateToProps = (state) => ({
  auth: state.auth,
  authError: state.auth.error,
  authMessage: state.auth.message,
  loggedin: state.auth.loggedin,
  loading: state.auth.loading,
});

const mapDispatchToProps = (dispatch) => {
  return {
    onConfirmResetPass: (data) =>
      AuthApi.api_confirm_reset_pass(data)(dispatch, {}),
    authActions: bindActionCreators(AuthActions, dispatch),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmResetPassForm);
