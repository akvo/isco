import React from "react";
import { Row, Col, Button, Drawer, Space } from "antd";
import { FiMenu } from "react-icons/fi";
import { GrLinkPrevious, GrLinkNext } from "react-icons/gr";
import Sidebar from "./Sidebar";
import take from "lodash/take";
import takeRight from "lodash/takeRight";

const MobileFooter = ({
  isMobile,
  isMobileMenuVisible,
  setIsMobileMenuVisible,
  sidebarProps,
  form,
  loadingInitial,
  submitButtonSetting,
  autoSave,
  onSave,
  downloadSubmissionConfig,
  uiText,
}) => {
  const { sidebar, activeGroup, setActiveGroup, showGroup } = sidebarProps;
  const { visible: downloadBtnVisible, onDownload } = downloadSubmissionConfig;
  const firstGroup = take(showGroup);
  const lastGroup = takeRight(showGroup);

  return (
    <Col span={24} className="arf-mobile-footer-container">
      <Row justify="space-between" align="middle">
        {sidebar && (
          <Col span={10} align="start">
            <Space size={5}>
              <Button
                type="link"
                icon={<FiMenu className="arf-icon" />}
                onClick={() => setIsMobileMenuVisible(!isMobileMenuVisible)}
              />
              <div style={{ marginRight: 5 }}>
                {!firstGroup?.includes(activeGroup) && (
                  <Button
                    className="arf-btn-previous"
                    type="link"
                    disabled={firstGroup?.includes(activeGroup)}
                    onClick={() => {
                      const prevIndex = showGroup.indexOf(activeGroup);
                      setActiveGroup(showGroup[prevIndex - 1]);
                    }}
                    icon={<GrLinkPrevious style={{ marginTop: 4 }} />}
                    shape="circle"
                    size="small"
                  />
                )}
                {!lastGroup?.includes(activeGroup) && (
                  <Button
                    className="arf-btn-next"
                    type="link"
                    disabled={lastGroup?.includes(activeGroup)}
                    onClick={() => {
                      setIsMobileMenuVisible(false);
                      const nextIndex = showGroup.indexOf(activeGroup);
                      setActiveGroup(showGroup[nextIndex + 1]);
                    }}
                    icon={<GrLinkNext style={{ marginTop: 4 }} />}
                    shape="circle"
                    size="small"
                  />
                )}
              </div>
              <div>
                {activeGroup + 1} / {showGroup.length}
              </div>
            </Space>
          </Col>
        )}
        <Col span={sidebar ? 14 : 24} align="end">
          <Space style={{ float: "right" }}>
            {loadingInitial ? (
              <Button type="secondary" loading disabled>
                {uiText.loadingInitialData}
              </Button>
            ) : (
              [
                autoSave?.name && (
                  <Button key="save" onClick={onSave}>
                    {autoSave?.buttonText || "Save"}
                  </Button>
                ),
                <Button
                  key="submit"
                  type="primary"
                  htmlType="submit"
                  onClick={() => form.submit()}
                  {...submitButtonSetting}
                >
                  {uiText.submit}
                </Button>,
                downloadBtnVisible && (
                  <Button key="download" type="primary" onClick={onDownload}>
                    {uiText.download}
                  </Button>
                ),
              ]
            )}
          </Space>
        </Col>
      </Row>
      {/* Drawer menu */}
      <Drawer
        title={null}
        placement="bottom"
        closable={false}
        onClose={() => setIsMobileMenuVisible(false)}
        open={isMobileMenuVisible}
        className="arf-sidebar arf-mobile"
        height="100%"
        width="100%"
        zIndex="1001"
        bodyStyle={{ padding: 0 }}
      >
        <Sidebar
          {...sidebarProps}
          isMobile={isMobile}
          setIsMobileMenuVisible={setIsMobileMenuVisible}
        />
      </Drawer>
    </Col>
  );
};

export default MobileFooter;
