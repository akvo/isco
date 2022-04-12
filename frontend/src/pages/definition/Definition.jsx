import React, { useEffect, useCallback } from "react";
import "./style.scss";
import { Row, Col } from "antd";
import { store } from "../../lib";
import { definitionContent } from "../../static";
import sortBy from "lodash/sortBy";

const Definition = () => {
  const language = store.useState((s) => s.language);
  const { active: activeLang } = language;

  const renderDefinition = useCallback(() => {
    let data = definitionContent[activeLang];
    data = data.map((d) => ({ ...d, i: d.i.toLowerCase() }));
    data = sortBy(data, ["i"]);
    return data.map((x, idx) => {
      return (
        <Row
          className="definition-wrapper"
          key={"fr-" + idx}
          align="top"
          justify="space-between"
          gutter={[12, 12]}
        >
          <Col key={"dt-" + idx} span={10} className="title">
            {x.t}
          </Col>
          <Col key={"dd-" + idx} span={14} className="description">
            {x.d}
          </Col>
        </Row>
      );
    });
  }, [activeLang]);

  useEffect(() => {
    renderDefinition();
  }, [activeLang, renderDefinition]);

  return (
    <div id="definition" className="container">
      {renderDefinition()}
    </div>
  );
};

export default Definition;
