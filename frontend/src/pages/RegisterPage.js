import React from "react";
import RegisterForm from "../components/RegisterForm";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";
import { DASHBOARD_URL } from "../constants/routes";

function RegisterPage({ loggedin }) {
  if (loggedin) return <Navigate to={DASHBOARD_URL} />;
  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-panel-left">
          <h1 className="auth-panel-heading">Create your account.</h1>
          <p className="auth-panel-sub">
            Join and get started in seconds.
          </p>
        </div>
        <div className="auth-panel-right">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => ({ loggedin: state.auth.loggedin });
export default connect(mapStateToProps)(RegisterPage);
