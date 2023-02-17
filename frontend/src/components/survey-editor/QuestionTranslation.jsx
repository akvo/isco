import React from "react";
import { Form, Input } from "antd";
import { orderBy } from "lodash";
import { isoLangs } from "../../lib";

const QuestionTranslation = ({ question, activeLang }) => {
  const { id, name, tooltip } = question;
  const lang = isoLangs?.[activeLang];
  const fieldNamePrefix = `question-${id}-translations-${activeLang}`;
  const placeholder = `Enter ${lang?.name} translation`;

  // filter option from the default option list
  const option = question?.option?.filter((x) => x?.name);

  return (
    <>
      <div className="question-setting-wrapper">
        <Form.Item
          label={<div className="translation-label">{name}</div>}
          name={`${fieldNamePrefix}-name`}
        >
          <Input className="bg-grey" placeholder={placeholder} />
        </Form.Item>
      </div>
      {tooltip && (
        <div className="question-setting-wrapper">
          <Form.Item
            label={<div className="translation-label">{tooltip}</div>}
            name={`${fieldNamePrefix}-tooltip_translations`}
          >
            <Input className="bg-grey" placeholder={placeholder} />
          </Form.Item>
        </div>
      )}
      {option?.length > 0 && (
        <div className="question-setting-wrapper">
          {orderBy(option, ["order"]).map(({ id, name }) => (
            <Form.Item
              key={`option-translation-${id}`}
              label={<div className="translation-label">{name}</div>}
              name={`${fieldNamePrefix}-option_name-${id}`}
            >
              <Input className="bg-grey" placeholder={placeholder} />
            </Form.Item>
          ))}
        </div>
      )}
    </>
  );
};

export default QuestionTranslation;
