import React from "react";
import { Space, Row, Col, Skeleton } from "antd";

const MainEditorSkeleton = () => {
  return (
    <div id="main-form-editor">
      <Space direction="vertical" size="large">
        <Row align="middle">
          <Col span={24}>
            <div>
              <Row align="middle" className="form-editor-wrapper">
                {/* Button */}
                <Col span={24}>
                  <Row align="start" justify="space-between">
                    <Col span={14}>
                      <Space direction="vertical">
                        {[1, 2, 3].map((i) => (
                          <div key={`form-meta-${i}`}>
                            <Skeleton paragraph={false} />
                            <Skeleton.Input block />
                          </div>
                        ))}
                        <Skeleton.Button />
                      </Space>
                    </Col>
                    <Col span={10} align="end">
                      <Skeleton.Button />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Space direction="vertical" size={20} style={{ marginTop: 24 }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={`qg-${i}`}>
                    <Skeleton.Input block size="large" />
                  </div>
                ))}
              </Space>
            </div>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default MainEditorSkeleton;
