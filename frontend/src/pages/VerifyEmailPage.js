import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import { useParams } from "react-router-dom";
import VerifyEmailForm from "../components/VerifyEmailForm";
export default function VerifyEmailPage(props) {
  let { token = "" } = useParams();
  return (
    <Row>
      <Col className="col-lg-8 col-xl-7 mx-auto">
        <Card className="card flex-row border-0 shadow rounded-3 overflow-hidden">
          <Card.Body className="p-4 p-sm-5">
            <VerifyEmailForm token={token} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
