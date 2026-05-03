import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";
import { Navigate } from "react-router-dom";
import { DASHBOARD_URL } from "../constants/routes";
import SendResetPassForm from "../components/SendResetPassForm";

function ResetPassPage({ loggedin }) {
  if (loggedin) return <Navigate to={DASHBOARD_URL} replace={true} />;

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-panel-left">
          <h1 className="auth-panel-heading">Reset your password.</h1>
          <p className="auth-panel-sub">
            Enter your email and we'll send you a link to get back into your account.
          </p>
        </div>
        <div className="auth-panel-right">
          <SendResetPassForm />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({
  loggedin: state.auth.loggedin,
});
const mapDispatchToProps = (dispatch) => {
  return {
    Authactions: bindActionCreators(AuthActions, dispatch),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(ResetPassPage);
