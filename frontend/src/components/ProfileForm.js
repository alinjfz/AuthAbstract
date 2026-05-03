import React, { useEffect, useState } from "react";
import * as AuthApi from "../api/auth";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { connect } from "react-redux";
import {
  Alert,
  Button,
  Card,
  Placeholder,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { CHANGE_PASS_URL } from "../constants/routes";
import translateErrors from "../utils/translateErrors";

function ProfileForm({
  onGetProfile,
  authError,
  user,
  authMessage,
  authActions,
  loading,
  onSendVerificaton,
}) {
  const [verifyClicked, setVerifyClicked] = useState(false);

  const clear_auth_error = () => {
    if (authActions && typeof authActions.auth_clear_error === "function") {
      authActions.auth_clear_error();
    }
  };

  useEffect(() => {
    // Clear any stale messages from previous pages before fetching profile
    clear_auth_error();
    get_profile();
    // eslint-disable-next-line
  }, []);

  const get_profile = async () => {
    if (typeof onGetProfile === "function") {
      await onGetProfile();
      // Silently clear the "Success" message set by profile fetch —
      // the user sees their data, no alert needed.
      clear_auth_error();
    }
  };

  const send_verify = async () => {
    if (typeof onSendVerificaton === "function") {
      setVerifyClicked(true);
      await onSendVerificaton();
    }
  };

  let { name, email } = user;
  if (authError) {
    name = email = "";
  }

  return (
    <>
      <h5 className="fw-semibold mb-4 text-center">Profile Settings</h5>

      {/* Avatar */}
      <div className="text-center mb-4">
        <img
          width="80"
          height="80"
          alt="Profile"
          src="/icons/profile.svg"
          className="rounded-circle border"
          style={{ objectFit: "cover" }}
        />
        <div className="mt-2 fw-semibold">
          {loading ? <span className="text-muted small">Loading...</span> : (name || "")}
        </div>
        {user.email && !user.is_verified && (
          <Button
            size="sm"
            className="mt-2"
            disabled={loading}
            variant="outline-warning"
            onClick={send_verify}
          >
            Verify your Email
          </Button>
        )}
      </div>

      {/* Fields */}
      <div className="form-floating mb-3">
        {loading ? (
          <Placeholder size="lg" as={Card.Text} animation="glow">
            <label>Name</label>
            <br />
            <Placeholder xs={8} />
          </Placeholder>
        ) : (
          <>
            <input
              type="text"
              className="form-control"
              id="profileName"
              disabled={true}
              value={name || ""}
              name="name"
              placeholder="Name"
            />
            <label htmlFor="profileName">Name</label>
          </>
        )}
      </div>

      <div className="form-floating mb-3">
        {loading ? (
          <Placeholder size="lg" as={Card.Text} animation="glow">
            <label>Email address</label>
            <br />
            <Placeholder xs={8} />
          </Placeholder>
        ) : (
          <>
            <input
              type="email"
              className="form-control"
              id="profileEmail"
              disabled={true}
              value={email || ""}
              name="email"
              placeholder="Email"
              title="Cannot be modified"
            />
            <label htmlFor="profileEmail">Email address</label>
          </>
        )}
      </div>

      {/* Error state */}
      {authError ? (
        <>
          <Alert className="mt-2" variant="danger">
            {translateErrors(authError)}
          </Alert>
          <Button className="w-100 mb-2" onClick={get_profile} variant="primary">
            Try Again
          </Button>
        </>
      ) : (
        <Button className="w-100 mb-2" disabled variant="primary">
          Save Profile
        </Button>
      )}

      <Link to={CHANGE_PASS_URL}>
        <Button variant="link" className="d-block w-100 text-center mt-1" size="sm">
          Change Password
        </Button>
      </Link>

      {/* Only show success alert when the user explicitly triggered send_verify */}
      {verifyClicked && authMessage ? (
        <Alert
          className="mt-3"
          variant="success"
          onClose={() => { clear_auth_error(); setVerifyClicked(false); }}
          dismissible
        >
          {authMessage}
        </Alert>
      ) : null}
    </>
  );
}

const mapStateToProps = (state) => ({
  loggedin: state.auth.loggedin,
  loading: state.auth.loading,
  authMessage: state.auth.message,
  authError: state.auth && state.auth.error,
  user: state.auth && state.auth.user,
});
const mapDispatchToProps = (dispatch) => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    onGetProfile: () => AuthApi.api_get_profile()(dispatch, {}),
    onSendVerificaton: () => AuthApi.api_send_verification()(dispatch, {}),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ProfileForm);
