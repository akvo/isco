import React from "react";
import { Card, Button } from "antd";
import { PlusSquareFilled } from "@ant-design/icons";
import Question from "./Question";
import FieldGroupHeader from "./FieldGroupHeader";
import RepeatTitle from "./RepeatTitle";

const BottomGroupButton = ({ group, index, updateRepeat, uiText }) => {
  const heading = group.name || "Section";
  const repeat = group?.repeat;
  const repeatText = group?.repeatText || `${uiText.addAnother} ${heading}`;
  const repeatButtonPlacement = group?.repeatButtonPlacement;

  if (!repeatButtonPlacement || repeatButtonPlacement === "top") {
    return "";
  }

  return (
    <div className="arf-repeat-title arf-field-group-bottom-button">
      <Button
        block
        type="link"
        onClick={() => updateRepeat(index, repeat + 1, "add")}
      >
        <PlusSquareFilled />
        {repeatText}
      </Button>
    </div>
  );
};

const QuestionGroup = ({
  index,
  group,
  forms,
  activeGroup,
  sidebar,
  updateRepeat,
  repeats,
  initialValue,
  headStyle,
  showGroup,
  uiText,
}) => {
  const isGroupAppear = showGroup.includes(index);
  return (
    <Card
      key={index}
      title={
        isGroupAppear && (
          <FieldGroupHeader
            group={group}
            index={index}
            updateRepeat={updateRepeat}
          />
        )
      }
      className={`arf-field-group ${
        activeGroup !== index && sidebar ? "arf-hidden" : ""
      }`}
      headStyle={headStyle}
    >
      {group?.description && isGroupAppear ? (
        <div className="arf-description">{group.description}</div>
      ) : (
        ""
      )}
      {repeats.map((r) => (
        <div key={r}>
          {group?.repeatable && isGroupAppear && (
            <RepeatTitle
              index={index}
              group={group}
              repeat={r}
              updateRepeat={updateRepeat}
            />
          )}
          <Question
            group={group}
            fields={group.question}
            cascade={forms.cascade}
            tree={forms.tree}
            initialValue={initialValue.filter((x) => {
              return (
                r === (x?.repeatIndex ? x.repeatIndex : 0) &&
                group.question.map((g) => g.id).includes(x.question)
              );
            })}
            repeat={r}
            uiText={uiText}
          />
        </div>
      ))}
      {isGroupAppear && (
        <BottomGroupButton
          group={group}
          index={index}
          updateRepeat={updateRepeat}
          uiText={uiText}
        />
      )}
    </Card>
  );
};

export default QuestionGroup;
