import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// reactstrap components
import {
  Breadcrumb,
  BreadcrumbItem,
  Container,
  Row,
  Col
} from "reactstrap";

class TimelineHeader extends React.Component {

  onHomeCliecked = e => {
    e.preventDefault()
    this.props.history.push("/admin/publicacoes");
  }

  render() {
    return (
      <>
        <div
          style={{
            position: "sticky",
            top: 0,
            border: "1 solid",
            boxShadow: "0px 2px #f5f5f5",
          }}
          className="header header-dark bg-info pb-6 content__title content__title--calendar"
        >
          <Container fluid>
            <div className="header-body">
              <Row className="align-items-center py-4">
                <Col lg="6" xs="7">
                  <Breadcrumb
                    className="d-none d-md-inline-block ml-lg-4"
                    listClassName="breadcrumb-links breadcrumb-dark"
                  >
                    <BreadcrumbItem>
                      <a href="#pablo" onClick={this.onHomeCliecked}>
                        <i className="fas fa-home" />
                      </a>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <a href="#pablo" onClick={e => e.preventDefault()}>
                        {this.props.parentName}
                      </a>
                    </BreadcrumbItem>
                    <BreadcrumbItem aria-current="page" className="active">
                      {this.props.name}
                    </BreadcrumbItem>
                  </Breadcrumb>
                </Col>
              </Row>
            </div>
          </Container>
        </div>
      </>
    );
  }
}

TimelineHeader.propTypes = {
  name: PropTypes.string,
  parentName: PropTypes.string
};

export default TimelineHeader;
