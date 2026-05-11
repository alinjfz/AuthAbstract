import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as AuthActions from "../actions/auth";

function WelcomeModal({ show, userName, authActions }) {
  const handleClose = () => authActions.auth_clear_welcome_modal();

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Welcome, {userName}!</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Your account has been created. You're now signed in and ready to go.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Get started
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

const mapStateToProps = (state) => ({
  show: state.auth.show_welcome_modal,
  userName: state.auth.user.name,
});

const mapDispatchToProps = (dispatch) => ({
  authActions: bindActionCreators(AuthActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(WelcomeModal);
