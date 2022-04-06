import React from "react";
import "./style.scss";
import { useNavigate } from "react-router-dom";
import { Result, Button } from "antd";

const ErrorPage = ({ status = 500, showButton = true }) => {
  const navigate = useNavigate();

  const BackHome = () =>
    showButton ? (
      <Button type="primary" ghost onClick={() => navigate("/home")}>
        Back Home
      </Button>
    ) : (
      ""
    );

  const config = () => {
    switch (status) {
      case 403:
        return {
          status: status,
          title: "Not authorized.",
          subTitle: "Sorry, you are not authorized to access this page.",
          extra: <BackHome />,
        };
      case 404:
        return {
          status: status,
          title: "Page not found.",
          subTitle: "Sorry, the page you visited does not exist.",
          extra: <BackHome />,
        };
      case "submission-exist":
        return {
          title: "Submission already submitted.",
          subTitle: "Member questionnaire can only be submitted once.",
          extra: <BackHome />,
        };
      default:
        return {
          status: status,
          title: "Error",
          subTitle: "Sorry, something went wrong.",
          extra: <BackHome />,
        };
    }
  };

  return (
    <div id="error">
      <Result {...config()} />
    </div>
  );
};

export default ErrorPage;
