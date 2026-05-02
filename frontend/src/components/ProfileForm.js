import React, { useEffect, useState } from "react";
import * as AuthApi from "../api/auth";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { connect } from "react-redux";
import {
  Alert,
  Button,
  Card,
  Col,
  OverlayTrigger,
  Placeholder,
  Row,
  Tooltip,
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
  const clear_auth_error = () => {
    if (authActions && typeof authActions.auth_clear_error === "function") {
      authActions.auth_clear_error();
    }
  };
  const [called, setCalled] = useState(false);
  useEffect(() => {
    if (!user.name) get_profile();
    else if (!called) {
      setCalled(true);
      get_profile();
    }
    if (authError || authMessage) {
      clear_auth_error();
    }
    // eslint-disable-next-line
  }, []);
  const get_profile = async function profileFunc() {
    if (typeof onGetProfile === "function") {
      await onGetProfile();
    }
  };
  const send_verify = async function sendVerificationFunc() {
    if (typeof onSendVerificaton === "function") {
      await onSendVerificaton();
    }
  };

  let { name, email } = user;

  if (authError) {
    name = email = "";
  }
  return (
    <>
      <form>
        <div className="form-floating">
          <Row>
            <Col className="col-lg-4 d-flex flex-column align-items-center">
              <img
                className="mt-5"
                width="150px"
                height="100px"
                alt="Profile"
                src="/icons/profile.svg"
              />
              {user.email && !user.is_verified ? (
                <Button
                  className="profile-button w-100"
                  disabled={loading}
                  variant="primary"
                  onClick={send_verify}
                >
                  Verify your Email
                </Button>
              ) : null}
            </Col>
            <Col>
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="text-right">Profile Settings</h4>
                </div>
                <div className="form-floating mb-3">
                  {loading ? (
                    <Placeholder size="lg" as={Card.Text} animation="glow">
                      <label htmlFor="floatingInput">Name</label>
                      <br />
                      <Placeholder xs={8} />
                    </Placeholder>
                  ) : (
                    <>
                      <input
                        type="text"
                        className={`form-control`}
                        id="floatingInput"
                        disabled={true}
                        value={name}
                        name="name"
                      />
                      <label htmlFor="floatingInput">Name</label>
                    </>
                  )}
                </div>
                <div className="form-floating mb-3">
                  {loading ? (
                    <Placeholder size="lg" as={Card.Text} animation="glow">
                      <label htmlFor="floatingInput">Email address</label>
                      <br />
                      <Placeholder xs={8} />
                    </Placeholder>
                  ) : (
                    <>
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 250, hide: 400 }}
                        overlay={
                          <Tooltip id="button-tooltip">
                            Cannot be modified
                          </Tooltip>
                        }
                      >
                        <input
                          type="email"
                          className={`form-control`}
                          id="floatingInput"
                          disabled={true}
                          value={email}
                          name="email"
                        />
                      </OverlayTrigger>
                      <label htmlFor="floatingInput">Email address</label>
                    </>
                  )}
                </div>
                {authError ? (
                  <>
                    <Alert className="mt-2" variant="danger">
                      {translateErrors(authError)}
                    </Alert>
                    <Button
                      className="profile-button"
                      onClick={get_profile}
                      variant="primary"
                    >
                      Try Again
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="profile-button"
                      disabled
                      variant="primary"
                    >
                      Save Profile
                    </Button>
                  </>
                )}
                <Link to={CHANGE_PASS_URL} className="float-right">
                  <Button variant="link" className="d-block mt-2" size="sm">
                    Change Password
                  </Button>
                </Link>
                {authMessage && authMessage !== "Success" ? (
                  <>
                    <Alert
                      className="mt-2"
                      variant="success"
                      onClose={clear_auth_error}
                      dismissible
                    >
                      {authMessage}
                    </Alert>
                  </>
                ) : null}
              </div>
            </Col>
          </Row>
        </div>
      </form>
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
