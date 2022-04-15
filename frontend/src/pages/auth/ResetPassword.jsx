import React, { useState, useEffect } from "react";
import "./style.scss";
import { Row, Col, Space } from "antd";
import Auth from "./Auth";
import { api } from "../../lib";
import { useParams, useLocation } from "react-router-dom";
import { useNotification } from "../../util";
import SetPassword from "./components/SetPassword";

const ResetPassword = () => {
  const { tokenId } = useParams();
  const location = useLocation();
  const [guess, setGuess] = useState({
    name: "",
    id: 0,
    invitation: "",
    email: "",
  });
  const [errorTokenId, setErrorTokenId] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    api
      .get(`/user/${location.pathname}`)
      .then((res) => {
        setErrorTokenId(false);
        api.setToken(null);
        setGuess(res.data);
      })
      .catch(() => {
        api.setToken(null);
        setErrorTokenId(true);
        notify({
          type: "error",
          message: "Token ID not found",
        });
      });
  }, [notify]);

  const isInvitation =
    location.pathname.replace(tokenId, "") === "/invitation/";

  return (
    <Auth>
      <Space direction="vertical">
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={24} align="start">
            <h2>
              {errorTokenId
                ? "Link is not valid"
                : isInvitation
                ? "Welcome "
                : "Reset Password"}
              <b>{guess.name.length && isInvitation ? `${guess.name}` : ""}</b>
            </h2>
          </Col>
        </Row>
        <SetPassword
          url={location.pathname}
          invalidUrl={errorTokenId}
          notify={notify}
        />
      </Space>
    </Auth>
  );
};

export default ResetPassword;
