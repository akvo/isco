import React, { useMemo } from "react";
import "./style.scss";
import { Row, Col, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { homeContent, uiText } from "../../static";
import { store } from "../../lib";

const Home = () => {
  const navigate = useNavigate();
  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const youtubeLink = "https://www.youtube.com/embed/rCL0IAbchd8";
  const slideLink = "#";
  const host = window.location.hostname.split(".").slice(-2)[0];

  const handleOnClickDataSecurity = () => {
    store.update((s) => {
      s.notificationModal = {
        ...s.notificationModal,
        dataSecurity: {
          ...s.notificationModal.dataSecurity,
          visible: true,
        },
      };
    });
  };

  const renderGsParagraph = (texts) => {
    return texts.map((x, i) => {
      return <p key={"p-" + i}>{x}</p>;
    });
  };

  const content = useMemo(() => {
    const value = homeContent(
      handleOnClickDataSecurity,
      youtubeLink,
      slideLink
    );
    return value[activeLang];
  }, [activeLang]);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  return (
    <div id="home">
      <Row className="home-landing" align="middle" justify="center">
        <Col className="intro-text" align="middle">
          <h1>{content.h}</h1>
          <p>
            <span>{content.p1}</span> <br />
            {content.p2}
          </p>
          <div className="start-btn-wrapper">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/survey")}
            >
              {text.btnStartSurvey}
            </Button>
          </div>
        </Col>
      </Row>

      {host === "cocoamonitoring" ? (
        ""
      ) : (
        <Row className="getting-started" align="middle" justify="center">
          <Col align="middle">
            <h1>{content.gettingStarted.h}</h1>
            {renderGsParagraph(content.gettingStarted.p1)}
            {false && (
              <iframe
                className="mt-3 mb-3"
                src={youtubeLink}
                width="700px"
                height="400px"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            )}
            {renderGsParagraph(content.gettingStarted.p2)}
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Home;
