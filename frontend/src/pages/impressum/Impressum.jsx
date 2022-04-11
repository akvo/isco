import React, { useMemo } from "react";
import "./style.scss";
import { Row, Col, Collapse } from "antd";
import { impressumContent } from "../../static";
import { store } from "../../lib";

const { Panel } = Collapse;

const Impressum = () => {
  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const handleShow = () => {
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

  const content = useMemo(() => {
    const value = impressumContent(handleShow);
    return value[activeLang];
  }, [activeLang]);

  const renderImpressum = () => {
    return content.list.map((x, idx) => {
      return (
        <Panel key={"ic-" + idx} header={<h3>{x.h}</h3>}>
          <div className="faqList">{x.c}</div>
        </Panel>
      );
    });
  };

  return (
    <div id="impressum" className="container">
      <Row align="top" justify="center">
        <Col span="20">
          <h3>{content.t}</h3>
          <hr />
          <Collapse accordion>{renderImpressum()}</Collapse>
        </Col>
      </Row>
    </div>
  );
};

export default Impressum;
