import React from "react";
import { List, Button } from "antd";
import { MdRadioButtonChecked, MdCheckCircle } from "react-icons/md";
import { AiOutlineDown } from "react-icons/ai";

const Sidebar = ({
  formsMemo,
  showGroup,
  activeGroup,
  setActiveGroup,
  completeGroup,
  isMobile,
  setIsMobileMenuVisible,
  uiText,
}) => {
  return (
    <List
      bordered={false}
      header={
        <div className="arf-sidebar-header">
          {isMobile && (
            <Button
              type="link"
              icon={
                <AiOutlineDown
                  className="arf-icon"
                  onClick={() => isMobile && setIsMobileMenuVisible(false)}
                />
              }
            />
          )}{" "}
          {uiText.formOverview}
        </div>
      }
      dataSource={formsMemo?.question_group?.map((qg, qgi) => ({
        ...qg,
        appear: showGroup.includes(qgi),
      }))}
      renderItem={(item, key) =>
        item.appear && (
          <List.Item
            key={key}
            onClick={() => {
              isMobile && setIsMobileMenuVisible(false);
              setActiveGroup(key);
            }}
            className={`arf-sidebar-list ${
              activeGroup === key ? "arf-active" : ""
            } ${
              completeGroup.includes(
                item?.repeatable ? `${key}-${item?.repeat}` : key
              )
                ? "arf-complete"
                : ""
            }`}
          >
            {completeGroup.includes(
              item?.repeatable ? `${key}-${item?.repeat}` : key
            ) ? (
              <MdCheckCircle className="arf-icon" />
            ) : (
              <MdRadioButtonChecked className="arf-icon" />
            )}
            {item?.name || `Section ${key + 1}`}
          </List.Item>
        )
      }
    />
  );
};

export default Sidebar;
