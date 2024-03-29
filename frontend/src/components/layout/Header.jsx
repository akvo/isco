import React, { useMemo } from "react";
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
import { uiText } from "../../static";

const Header = ({ className = "header", ...props }) => {
  const [cookies, removeCookie] = useCookies(["AUTH_TOKEN"]);
  const { user, isLoggedIn, language } = store.useState((state) => state);
  const { active: activeLang, langs: langList } = language;
  const admins = ["secretariat_admin"];
  const isAdmin = admins.includes(user?.role);
  const navigate = useNavigate();

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const handleLogout = () => {
    if (cookies?.AUTH_TOKEN) {
      removeCookie("AUTH_TOKEN");
      removeCookie("REFRESH_TOKEN");
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
        <Menu.Item key="admin" className="account-item">
          <Link to="/admin">
            <Space align="center" size={8}>
              <RiAdminFill />
              {text.navAdmin}
            </Space>
          </Link>
        </Menu.Item>
      )}
      <Menu.Item key="setting" className="account-item">
        <Link to="/setting">
          <Space align="center" size={8}>
            <BsGearFill />
            {text.navSetting}
          </Space>
        </Link>
      </Menu.Item>
      <Menu.Item key="logout" className="account-item">
        <Link to="#" onClick={() => handleLogout()}>
          <Space align="center" size={8}>
            <MdLogout />
            {text.navLogout}
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
              <span className="title">{text.navHome}</span>
            </Link>
          </div>
          <div className="navigation">
            <Space size="large" align="center">
              {isLoggedIn && (
                <>
                  <Link to="/survey">{text.navSurvey}</Link>
                  <Link to="/download">{text.navDownload}</Link>
                </>
              )}
              <Link to="/definition">{text.navDefinitions}</Link>
              {isLoggedIn && (
                <>
                  <Link to="/feedback">{text.navFeedback}</Link>
                  <Link to="/impressum">{text.navImpressum}</Link>
                  <Link to="/faq">{text.navFaq}</Link>
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
