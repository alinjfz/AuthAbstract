import React, { useEffect } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Alert, Button, Spinner } from "react-bootstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { Navigate } from "react-router-dom";
import { DASHBOARD_URL } from "../constants/routes";
import * as AuthApi from "../api/auth";
import translateErrors from "../utils/translateErrors";

function LogoutPage({ loggedin, onLogout, authActions, authError }) {
  useEffect(() => {
    logout();
    // eslint-disable-next-line
  }, []);
  const logout = async function logoutFunc() {
    if (typeof onLogout === "function") {
      await onLogout();
    }
  };
  if (!loggedin) return <Navigate to={DASHBOARD_URL} replace={true} />;
  let mainComponent = <></>;

  const tryAgainHandle = () => {
    logout();
  };
  if (authError)
    mainComponent = (
      <>
        <Alert className="mt-2" variant="danger">
          {translateErrors(authError)}
        </Alert>
        <Button onClick={tryAgainHandle} variant="primary">
          Try Again
        </Button>
      </>
    );
  else
    mainComponent = (
      <>
        <p>Logout in progress</p>
        <br />
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </>
    );
  return (
    <Row>
      <Col className="col-lg-8 col-xl-7 mx-auto">
        {/* <Card className="card flex-row border-0 shadow rounded-3 overflow-hidden">
          <Card.Body className="p-4 p-sm-5 d-flex align-items-center justify-content-center"> */}
        <div className="p-4 p-sm-5 d-flex flex-column align-items-center justify-content-center">
          {mainComponent}
        </div>
        {/* </Card.Body>
        </Card> */}
      </Col>
    </Row>
  );
}

const mapStateToProps = (state) => ({
  loggedin: state.auth.loggedin,
  authError: state.auth && state.auth.error,
});
const mapDispatchToProps = (dispatch) => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    onLogout: () => AuthApi.api_logout()(dispatch, {}),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(LogoutPage);
