import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Button, Space } from "antd";

const Footer = ({ className = "footer", ...props }) => {
  return (
    <div className={className}>
      <Row align="middle" justify="center" {...props}>
        <Col align="middle">Footer</Col>
      </Row>
    </div>
  );
};

Footer.propTypes = {
  className: PropTypes.string,
};

export default Footer;
