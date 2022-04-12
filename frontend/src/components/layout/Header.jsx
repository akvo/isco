import React from "react";
import PropTypes from "prop-types";
import { Row, Col, Space, Menu, Dropdown, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { BsGearFill } from "react-icons/bs";
import { MdLogout } from "react-icons/md";
import { RiAdminFill } from "react-icons/ri";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { store, api } from "../../lib";

const Header = ({ className = "header", ...props }) => {
  const [cookies, removeCookie] = useCookies(["AUTH_TOKEN"]);
  const { user, isLoggedIn, language } = store.useState((state) => state);
  const { active: activeLang, langs: langList } = language;
  const isAdmin = user?.role?.includes("admin");
  const navigate = useNavigate();

  const handleLogout = () => {
    if (cookies?.AUTH_TOKEN) {
      removeCookie("AUTH_TOKEN");
      api.setToken(null);
      store.update((s) => {
        s.isLoggedIn = false;
        s.user = null;
      });
      navigate("/login");
    }
  };

  const handleOnClickLanguage = (lang) => {
    store.update((s) => {
      s.language = {
        ...language,
        active: lang,
      };
    });
  };

  const renderLangList = () => {
    return (
      langList &&
      Object.keys(langList).map((key) => (
        <Button
          key={key}
          type="link"
          size="large"
          className={`${activeLang === key ? "active" : ""}`}
          onClick={() => handleOnClickLanguage(key)}
        >
          {key.toUpperCase()}
        </Button>
      ))
    );
  };

  const accountMenu = (
    <Menu className="account-dropdown-menu">
      {isAdmin && (
        <>
          <Menu.Item key="admin" className="account-item">
            <Link to="/admin">
              <Space align="center" size={8}>
                <RiAdminFill />
                ADMIN
              </Space>
            </Link>
          </Menu.Item>
          <Menu.Item key="setting" className="account-item">
            <Link to="#">
              <Space align="center" size={8}>
                <BsGearFill />
                SETTING
              </Space>
            </Link>
          </Menu.Item>
        </>
      )}
      <Menu.Item key="logout" className="account-item">
        <Link to="#" onClick={() => handleLogout()}>
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
              {isLoggedIn && (
                <>
                  <Link to="/survey">Survey</Link>
                  <Link to="#">Download</Link>
                </>
              )}
              <Link to="/definition">Definitions</Link>
              {isLoggedIn && (
                <>
                  <Link to="/feedback">Feedback</Link>
                  <Link to="/impressum">Impressum</Link>
                  <Link to="#">FAQ</Link>
                </>
              )}
            </Space>
          </div>
        </Space>
      </Col>
      <Col className="right">
        <Space size="large" align="center">
          <div className="translation-selection">{renderLangList()}</div>
          {isLoggedIn && (
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
                  {user?.name}
                </Space>
              </a>
            </Dropdown>
          )}
        </Space>
      </Col>
    </Row>
  );
};

Header.propTypes = {
  className: PropTypes.string,
};

export default Header;
