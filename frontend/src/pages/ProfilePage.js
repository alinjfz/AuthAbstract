import React from "react";
import { Card, Col, Row, Button } from "react-bootstrap";
import { DASHBOARD_URL } from "../constants/routes";
import { Navigate, Link } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import * as AuthApi from "../api/auth";
import ProfileForm from "../components/ProfileForm";

function ProfilePage({ loggedin }) {
  if (!loggedin) return <Navigate to={DASHBOARD_URL} replace={true} />;

  return (
    <Row>
      <Col xs={12} md={10} lg={8} xl={6} className="mx-auto">
        <div className="mb-3">
          <Link to={DASHBOARD_URL}>
            <Button variant="link" size="sm" className="ps-0 text-secondary text-decoration-none">
              &larr; Back to Dashboard
            </Button>
          </Link>
        </div>
        <Card className="border-0 shadow rounded-3 overflow-hidden">
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
