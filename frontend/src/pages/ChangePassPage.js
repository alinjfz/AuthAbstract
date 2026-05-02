import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ChangePassForm from "../components/ChangePassForm";
import { Card } from "react-bootstrap";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { Navigate } from "react-router-dom";
import { DASHBOARD_URL } from "../constants/routes";

function ChangePassPage({ authState, loggedin }) {
  if (!loggedin) return <Navigate to={DASHBOARD_URL} replace={true} />;
  return (
    <Row>
      <Col className="col-lg-8 col-xl-7 mx-auto">
        <Card className="card flex-row border-0 shadow rounded-3 overflow-hidden">
          <Card.Body className="p-4 p-sm-5">
            <ChangePassForm />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

const mapStateToProps = (state) => ({
  authState: state.auth,
  loggedin: state.auth.loggedin,
});
const mapDispatchToProps = (dispatch) => {
  return {
    Authactions: bindActionCreators(AuthActions, dispatch),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ChangePassPage);
