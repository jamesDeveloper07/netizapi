import React from "react";
// react library for routing
import { Link } from "react-router-dom";
// reactstrap components
import {
  NavbarBrand,
  Navbar,
  Container
} from "reactstrap";

class AuthNavbar extends React.Component {
  render() {
    return (
      <>
        <Navbar
          className="navbar-horizontal navbar-main navbar-dark navbar-transparent"
          expand="lg"
          id="navbar-main"
        >
        
        </Navbar>
      </>
    );
  }
}

export default AuthNavbar;
