/*eslint-disable*/
import React from "react";

// reactstrap components
import { NavItem, NavLink, Nav, Container, Row, Col } from "reactstrap";

class AuthFooter extends React.Component {
  render() {
    return (
      <>
        <footer className="py-5" id="footer-main">
          <Container>
            <Row className="align-items-center justify-content-xl-between">
              <Col xl="6">
                <div className="copyright text-center text-xl-left text-white">
                  © {new Date().getFullYear()}{" "}
                  <a
                    className="font-weight-bold ml-1 text-white"
                    href="https://netiz.com.br"
                    target="_blank"
                  >
                    Netiz
                  </a>
                </div>
              </Col>
            </Row>
          </Container>
        </footer>
      </>
    );
  }
}

export default AuthFooter;
