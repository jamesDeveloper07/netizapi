/*eslint-disable*/
import React from "react";

// reactstrap components
import { NavItem, NavLink, Nav, Container, Row, Col } from "reactstrap";

class Calendar extends React.Component {
  render() {
    return (
      <>
        <Container fluid>
          <footer className="footer pt-0">
            
	    <Row >
              <Col >
                <div className="copyright text-center text-lg-left text-muted float-right">
                  © {new Date().getFullYear()}{" "}
                  <a
                    className="font-weight-bold ml-1"
                    href="https://netiz.com.br"
                    target="_blank"
                  >
                    Netiz
                  </a>
                </div>
              </Col>
            </Row>

	    <Row >
              <Col >
                <div className="copyright text-center text-lg-left text-muted float-right" style={{fontSize:'x-small'}} >
                  <a
                    className="font-weight-bold ml-1"
                    href="https://netiz.com.br/lp/termos-de-uso.pdf"
                    target="_blank"
                  >
                    Termo de Uso
                  </a>
                </div>
              </Col>
            </Row>

          </footer>
        </Container>
      </>
    );
  }
}

export default Calendar;
