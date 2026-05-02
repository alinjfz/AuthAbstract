import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { NavDropdown } from "react-bootstrap";
import { connect } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import * as URLs from "../constants/routes";

function MyNavbar({ loggedin }) {
  const [dropdownActive, setDropdownActive] = useState(false);

  const publicNav = (
    <Navbar.Collapse id="responsive-navbar-nav">
      <Nav className="ms-auto">
        <NavLink className="nav-link" to={URLs.LOGIN_URL}>
          Login / Register
        </NavLink>
      </Nav>
    </Navbar.Collapse>
  );

  const privateNav = (
    <Navbar.Collapse id="responsive-navbar-nav">
      <Nav className="ms-auto">
        <NavDropdown
          show={dropdownActive}
          onToggle={() => setDropdownActive(!dropdownActive)}
          title="Account"
          id="nav-dropdown"
        >
          <Link className="dropdown-item" to={URLs.PROFILE_URL} onClick={() => setDropdownActive(false)}>
            Profile
          </Link>
          <Link className="dropdown-item" to={URLs.LOGOUT_URL} onClick={() => setDropdownActive(false)}>
            Log out
          </Link>
        </NavDropdown>
      </Nav>
    </Navbar.Collapse>
  );

  return (
    <Navbar collapseOnSelect expand="lg" className="my-navbar">
      <Container>
        <Navbar.Brand>
          <NavLink className="nav-link" to={URLs.DASHBOARD_URL}>
            <span className="site-name">AuthAbstract</span>
          </NavLink>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        {loggedin ? privateNav : publicNav}
      </Container>
    </Navbar>
  );
}

const mapStateToProps = (state) => ({ loggedin: state.auth.loggedin });
export default connect(mapStateToProps)(MyNavbar);
