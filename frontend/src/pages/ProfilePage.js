import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import { DASHBOARD_URL } from "../constants/routes";
import { Navigate } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import * as AuthApi from "../api/auth";
import ProfileForm from "../components/ProfileForm";
function ProfilePage({ loggedin }) {
  if (!loggedin) return <Navigate to={DASHBOARD_URL} replace={true} />;
  return (
    <Row>
      <Col lg={8} xl={7} xxl={5} className="mx-auto">
        <Card className="card flex-row border-0 shadow rounded-3 overflow-hidden">
          <Card.Body className="p-4 p-sm-5">
            <ProfileForm />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

const mapStateToProps = (state) => ({
  loggedin: state.auth.loggedin,
  loading: state.auth.loading,
  authError: state.auth && state.auth.error,
  user: state.auth && state.auth.user,
});
const mapDispatchToProps = (dispatch) => {
  return {
    authActions: bindActionCreators(AuthActions, dispatch),
    onGetProfile: () => AuthApi.api_get_profile()(dispatch, {}),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
