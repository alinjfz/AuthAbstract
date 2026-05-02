import React, { useEffect, useState } from "react";
import * as AuthApi from "../api/auth";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { connect } from "react-redux";
import { Alert, Button, Spinner } from "react-bootstrap";
import { DASHBOARD_URL } from "../constants/routes";
import translateErrors from "../utils/translateErrors";
import { Link } from "react-router-dom";
function ConfirmResetPassForm({
  onVerifyEmail,
  loading,
  token,
  authError,
  authActions,
  authMessage,
}) {
  const [retryBtn, setRetryBtn] = useState(true);
  const verify_email = async function verify_email_Func() {
    if (typeof onVerifyEmail === "function") {
      if (!token) {
        authActions.auth_error({ error: "The link is invalid" });
        setRetryBtn(false);
        return;
      }
      const x = {
        token,
      };
      await onVerifyEmail(x);
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
    verify_email();
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <h5 className="card-title text-center mb-5 fw-light fs-5">
        Verifying Email
      </h5>
      <form>
        <div className="d-grid">
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
          ) : authError === "token has expired" ? (
            <Alert
              className="mt-2"
              variant="danger"
              onClose={clear_auth_error}
              dismissible
            >
              {"The link has expired"}
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
          ) : authError ? (
            <>
              <Alert className="mt-2" variant="danger">
                {translateErrors(authError)}
              </Alert>
              {retryBtn ? (
                <Button onClick={verify_email} variant="primary">
                  Try Again
                </Button>
              ) : (
                <Link className="alert-link" to={DASHBOARD_URL}>
                  <Button
                    variant="link"
                    className="pt-0 pb-0"
                    onClick={clear_auth_error}
                  >
                    Go to Home Page.
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <br />
              <p>Verifying in progress</p>
            </div>
          )}
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
    onVerifyEmail: (data) => AuthApi.api_verify_email(data)(dispatch, {}),
    authActions: bindActionCreators(AuthActions, dispatch),
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmResetPassForm);
