import React from "react";
import LoginForm from "../components/LoginForm";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";
import { DASHBOARD_URL } from "../constants/routes";

function LoginPage({ loggedin }) {
  if (loggedin) return <Navigate to={DASHBOARD_URL} replace />;
  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-panel-left">
          <h1 className="auth-panel-heading">Welcome back.</h1>
          <p className="auth-panel-sub">
            Sign in to continue where you left off.
          </p>
        </div>
        <div className="auth-panel-right">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({ loggedin: state.auth.loggedin });
export default connect(mapStateToProps)(LoginPage);
