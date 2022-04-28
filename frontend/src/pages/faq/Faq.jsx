import React, { useMemo } from "react";
import "./style.scss";
import { Row, Col, Collapse } from "antd";
import { store } from "../../lib";
import { faqContent, uiText } from "../../static";

const { Panel } = Collapse;

const Faq = () => {
  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const content = useMemo(() => {
    return faqContent[activeLang];
  }, [activeLang]);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const renderFaq = () => {
    return content.map((x, idx) => {
      return (
        <Panel key={"ic-" + idx} header={<h3>{x.h}</h3>}>
          <div className="faqList">{x.c}</div>
        </Panel>
      );
    });
  };

  return (
    <div id="faq" className="container">
      <Row align="top" justify="center">
        <Col span="20">
          <h3>{text.faqTitle}</h3>
          <hr />
          <Collapse accordion>{renderFaq()}</Collapse>
        </Col>
      </Row>
    </div>
  );
};

export default Faq;
