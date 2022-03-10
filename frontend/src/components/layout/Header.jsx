import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Space, Button, Menu, Dropdown } from "antd";
import { FaUser } from "react-icons/fa";
import { BsGearFill } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = ({ className = "header", ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const accountMenu = (
    <Menu className="account-dropdown-menu">
      <Menu.Item className="account-item">
        <Link to="#">
          <Space align="center" size={8}>
            <BsGearFill />
            SETTING
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item className="account-item">
        <Link to="#">
          <Space align="center" size={8}>
            <MdLogout />
            LOGOUT
          </Space>
        </Link>
      </Menu.Item>
    </Menu>
  );

  return (
    <Row
      className={className}
      align="middle"
      justify="space-between"
      {...props}
    >
      <Col className="left">
        <Space size="large" align="center">
          <div className="brand">
            <Link to="/">
              <span className="title">HOME</span>
            </Link>
          </div>
          <div className="navigation">
            <Space size="large" align="center">
              <Link to="#">Survey</Link>
              <Link to="#">Download</Link>
              <Link to="#">Definitions</Link>
              <Link to="#">Feedback</Link>
              <Link to="#">Impressum</Link>
              <Link to="#">FAQ</Link>
            </Space>
          </div>
        </Space>
      </Col>
      <Col className="right">
        <Space size="large" align="center">
          <div className="translation-selection">
            <Space align="middle">
              <div>EN</div>
              <div>DE</div>
            </Space>
          </div>
          <Dropdown
            overlay={accountMenu}
            overlayClassName="account-dropdown-wrapper"
          >
            <a
              className="ant-dropdown-link"
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <Space align="center">
                <span className="icon">
                  <FaUser />
                </span>
                John Doe
              </Space>
            </a>
          </Dropdown>
        </Space>
      </Col>
    </Row>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
