import React from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Checkbox,
  Button,
  Space,
  Select,
  Tag,
} from "antd";
import { BiRadioCircle } from "react-icons/bi";
import { HiPlus, HiMinus, HiArrowSmUp, HiArrowSmDown } from "react-icons/hi";
import { store } from "../../lib";
import orderBy from "lodash/orderBy";
import { defaultOption, defaultRepeatingObject } from "../../lib/store";
import { generateID, insert } from "../../lib/util";
import { useNotification } from "../../util";

const RenderOptionInput = ({
  question,
  handlePlusMinusOptionButton,
  handleOrderingOption,
}) => {
  const qId = question?.id;
  const options = question?.option;

  const ButtonUp = ({ index, order }) => {
    if (!index) {
      return "";
    }
    return (
      <Button
        type="text"
        icon={<HiArrowSmUp />}
        onClick={() => handleOrderingOption(order, order - 1)}
      />
    );
  };

  const ButtonDown = ({ index, order }) => {
    if (index === options.length - 1) {
      return "";
    }
    return (
      <Button
        type="text"
        icon={<HiArrowSmDown />}
        onClick={() => handleOrderingOption(order, order + 1)}
      />
    );
  };

  return orderBy(options, ["order"])?.map((opt, optIndex) => (
    <Row key={`option-${opt?.id}`} justify="space-between" gutter={[12, 12]}>
      <Col span={19}>
        <Form.Item
          label={<BiRadioCircle />}
          name={`question-${qId}-option-${opt?.id}`}
          rules={[{ required: true, message: "Please input option value" }]}
        >
          <Input className="bg-grey" placeholder="Enter an answer option" />
        </Form.Item>
      </Col>
      <Col span={2} align="end">
        <Space size={1} align="center" className="float-right">
          <ButtonUp index={optIndex} order={opt.order} />
          <ButtonDown index={optIndex} order={opt.order} />
          <Button
            type="text"
            icon={<HiPlus />}
            onClick={() => handlePlusMinusOptionButton("add", opt, optIndex)}
          />
          <Button
            type="text"
            icon={<HiMinus />}
            onClick={() => handlePlusMinusOptionButton("remove", opt, optIndex)}
          />
        </Space>
      </Col>
    </Row>
  ));
};

const RenderRepeatingObjectInput = ({
  question,
  handlePlusMinusRepeatingObjects,
}) => {
  const qId = question?.id;
  const repeating_objects = question?.repeating_objects;
  let repeating_object_option = store.useState(
    (s) => s?.optionValues?.repeating_object_option
  );

  // filter repeating object option by repeting object filled
  repeating_object_option = repeating_object_option?.filter(
    (x) => !repeating_objects?.map((y) => y?.field).includes(x)
  );

  return repeating_objects?.map((ro, roi) => (
    <Row
      key={`repeating-object-${ro?.id || roi}`}
      justify="space-between"
      gutter={[12, 12]}
    >
      <Col span={22}>
        <Row align="middle" justify="space-between" gutter={[12, 12]}>
          <Col span={12}>
            <Form.Item
              name={`question-${qId}-repeating_objects_field-${ro?.id || roi}`}
            >
              <Select
                allowClear
                placeholder="Select field value"
                className="bg-grey"
                options={repeating_object_option?.map((x) => ({
                  label: x,
                  value: x,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={`question-${qId}-repeating_objects_value-${ro?.id || roi}`}
            >
              <Input placeholder="Value" className="bg-grey" />
            </Form.Item>
          </Col>
        </Row>
      </Col>
      <Col span={2}>
        <Space size={1} align="center">
          <Button
            type="text"
            icon={<HiPlus />}
            disabled={repeating_object_option?.length === 0}
            onClick={() => handlePlusMinusRepeatingObjects("add", ro, roi)}
          />
          <Button
            type="text"
            icon={<HiMinus />}
            onClick={() => handlePlusMinusRepeatingObjects("remove", ro, roi)}
          />
        </Space>
      </Col>
    </Row>
  ));
};

const QuestionDetail = ({
  form,
  questionGroup,
  question,
  handleFormOnValuesChange,
  setAllowOther,
  allowOther,
}) => {
  const { notify } = useNotification();
  const surveyEditor = store.useState((s) => s?.surveyEditor);
  const tempStorage = store.useState((s) => s?.tempStorage);
  const { cascade, nested } = store.useState((s) => s?.optionValues);
  const { type, option, repeating_objects } = question;
  const { questionGroup: questionGroupState } = surveyEditor;
  const qId = question?.id;

  const cascadeValues = type === "cascade" ? cascade : nested;

  const handleOrderingOption = (selectedOrder, targetOrder) => {
    const updatedQuestionGroup = questionGroupState.map((qg) => {
      const updatedQuestion = qg.question.map((q) => {
        let options = q.option;
        if (q.id === qId) {
          options = q.option.map((o) => {
            let newOrder = o.order;
            if (selectedOrder > targetOrder) {
              newOrder =
                o.order === selectedOrder
                  ? targetOrder
                  : o.order >= targetOrder && o.order < selectedOrder
                  ? o.order + 1
                  : o.order;
            }
            if (selectedOrder < targetOrder) {
              newOrder =
                o.order === selectedOrder
                  ? targetOrder
                  : o.order > selectedOrder && o.order <= targetOrder
                  ? o.order - 1
                  : o.order;
            }
            return {
              ...o,
              order: newOrder,
            };
          });
        }
        return {
          ...q,
          option: options,
        };
      });
      return {
        ...qg,
        question: updatedQuestion,
      };
    });
    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: updatedQuestionGroup,
      };
    });
  };

  const handlePlusMinusOptionButton = (operation, opt, optIndex) => {
    const filterQuestionGroup = surveyEditor?.questionGroup?.filter(
      (qg) => qg?.id !== questionGroup?.id
    );

    const filterQuestion = questionGroup?.question?.filter(
      (q) => q?.id !== question?.id
    );

    let updatedOption = [];
    if (operation === "add") {
      updatedOption = insert(orderBy(option, ["order"]), optIndex + 1, {
        ...defaultOption,
        id: generateID(),
      })?.map((op, opi) => ({
        ...op,
        order: opi + 1,
      }));
    }

    if (operation === "remove") {
      // Check if option use in skip logic
      const allSkipLogic = questionGroupState?.flatMap((qg) =>
        qg?.question?.flatMap((q) => q?.skip_logic)
      );
      const lookup = allSkipLogic
        ?.filter((x) => x?.dependent_to === opt?.question)
        .flatMap((x) => x.value.split("|").map((v) => Number(v)));
      const check = lookup.some((val) => val === opt.id);
      if (check) {
        notify({
          type: "warning",
          message: `Can't delete option ${opt.name}, because this option is used in dependency.`,
        });
        return;
      }
      // end check
      updatedOption = question?.option?.filter((op) => op?.id !== opt?.id);
      // reordering option
      updatedOption = orderBy(updatedOption, ["order"]).map((o, oi) => ({
        ...o,
        order: oi + 1,
      }));
      // store removed option to delete when save button clicked
      const storage = tempStorage;
      const filterTempStorage = storage.deletedOptions?.filter(
        (x) => x?.id !== opt?.id
      );
      store.update((s) => {
        s.tempStorage = {
          ...storage,
          deletedOptions: [...filterTempStorage, opt],
        };
      });
    }

    // add new default option value if all deleted
    if (updatedOption.length === 0) {
      updatedOption = [
        {
          ...defaultOption,
          id: generateID(),
          order: 1,
        },
      ];
    }

    const questionGroupWithUpdatedQuestionOption = {
      ...questionGroup,
      question: [
        ...filterQuestion,
        {
          ...question,
          option: updatedOption,
        },
      ],
    };

    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: [
          ...filterQuestionGroup,
          questionGroupWithUpdatedQuestionOption,
        ],
      };
    });
  };

  const handlePlusMinusRepeatingObjects = (operation, ro, roi) => {
    const filterQuestionGroup = surveyEditor?.questionGroup?.filter(
      (qg) => qg?.id !== questionGroup?.id
    );

    const filterQuestion = questionGroup?.question?.filter(
      (q) => q?.id !== question?.id
    );

    let updatedRepeatingObject = [];
    if (operation === "add") {
      updatedRepeatingObject = insert(repeating_objects, roi + 1, {
        ...defaultRepeatingObject,
        id: generateID(),
      })?.map((r, ri) => ({
        ...r,
        order: ri + 1,
      }));
    }

    if (operation === "remove") {
      updatedRepeatingObject = question?.repeating_objects?.filter(
        (op) => op?.id !== ro?.id || op?.field !== ro?.field
      );
    }

    // add new default repeating objects if all deleted
    if (updatedRepeatingObject.length === 0) {
      updatedRepeatingObject = [
        { ...defaultRepeatingObject, id: generateID(), order: 1 },
      ];
    }

    const questionGroupWithUpdatedRepeatingObject = {
      ...questionGroup,
      question: [
        ...filterQuestion,
        {
          ...question,
          repeating_objects: updatedRepeatingObject,
        },
      ],
    };

    store.update((s) => {
      s.surveyEditor = {
        ...s.surveyEditor,
        questionGroup: [
          ...filterQuestionGroup,
          questionGroupWithUpdatedRepeatingObject,
        ],
      };
    });
  };

  const handleAllowOtherChange = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    setAllowOther(val);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  const handleOnChangeAutofield = (val, field) => {
    const fieldValue = { [field]: val };
    form.setFieldsValue(fieldValue);
    handleFormOnValuesChange(fieldValue, form?.getFieldsValue());
  };

  return (
    <>
      {/* Cascade / Nested dropdown */}
      {(type === "cascade" || type === "nested_list") && (
        <div className="question-setting-wrapper">
          <div className="field-wrapper">
            <div className="field-label">Question Cascade</div>
            <Form.Item
              name={`question-${qId}-cascade`}
              rules={[{ required: true, message: "Please select cascade" }]}
            >
              <Select
                allowClear
                className="bg-grey"
                placeholder={`Select ${type?.split("_").join(" ")}`}
                options={cascadeValues?.map((x) => {
                  return {
                    label: x?.name,
                    value: x?.id,
                  };
                })}
              />
            </Form.Item>
          </div>
        </div>
      )}
      {/* Options */}
      {(type === "option" || type === "multiple_option") && (
        <>
          <div className="question-setting-wrapper">
            <div className="field-wrapper">
              <div className="field-label">Question Option</div>
              <RenderOptionInput
                question={question}
                handlePlusMinusOptionButton={handlePlusMinusOptionButton}
                handleOrderingOption={handleOrderingOption}
              />
            </div>
          </div>
          <div className="question-setting-wrapper">
            <Form.Item name={`question-${qId}-rule-allow_other`} hidden noStyle>
              <Input />
            </Form.Item>
            <Space>
              <Checkbox
                checked={allowOther}
                onChange={(val) =>
                  handleAllowOtherChange(
                    val?.target?.checked,
                    `question-${qId}-rule-allow_other`
                  )
                }
              />
              <span>Add an &quot;Other&quot; answer option</span>
            </Space>
          </div>
        </>
      )}
      {/* Autofield Question*/}
      {type === "autofield" && (
        <div className="question-setting-wrapper">
          <div style={{ padding: "0 0 15px 0" }}>
            <Tag>Question ID: {qId}</Tag>
          </div>
          <div className="field-wrapper">
            <div className="field-label">Add Function (String) Here</div>
            <Form.Item
              name={`question-${qId}-autofield-fnString`}
              rules={[
                { required: true, message: "Please add autofield function" },
              ]}
            >
              <Input.TextArea
                rows={5}
                allowClear
                placeholder="function () { return #question_id / #question_id } OR () => { return #1.includes('Test') ? #question_id / #question_id : 0 }"
                onChange={(val) =>
                  handleOnChangeAutofield(
                    val?.target?.value,
                    `question-${qId}-autofield-fnString`
                  )
                }
                className="bg-grey"
              />
            </Form.Item>
          </div>
        </div>
      )}
      {/* Repeating Objects */}
      <div className="question-setting-wrapper">
        <div className="field-wrapper">
          <div className="field-label">Extra Field</div>
          <RenderRepeatingObjectInput
            question={question}
            handlePlusMinusRepeatingObjects={handlePlusMinusRepeatingObjects}
          />
        </div>
      </div>
    </>
  );
};

export default QuestionDetail;
