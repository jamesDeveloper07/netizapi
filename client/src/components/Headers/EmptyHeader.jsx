import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// reactstrap components
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Container,
  Row,
  Col
} from "reactstrap";

class EmptyHeader extends React.Component {
  render() {
    return (
      <>
        <div className="header header-dark bg-info pb-6 content__title content__title--calendar">
        
        </div>
      </>
    );
  }
}

EmptyHeader.propTypes = {
  name: PropTypes.string,
  parentName: PropTypes.string
};

export default EmptyHeader;
