import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Row, Col, Button, Form, Space, Select, message } from "antd";
// import "antd/dist/antd.min.css";
import "./styles.css";
import moment from "moment";
import {
  range,
  intersection,
  maxBy,
  isEmpty,
  takeRight,
  take,
  last,
} from "lodash";
import {
  transformForm,
  translateForm,
  todayDate,
  detectMobile,
  generateDataPointName,
  filterFormValues,
} from "./lib";
import {
  ErrorComponent,
  Print,
  IFrame,
  MobileFooter,
  Sidebar,
  LeftDrawer,
} from "./support";
import ds from "./lib/db";
import extras from "./lib/extras";
import locale from "./locale";
import GlobalStore from "./lib/store";
import { QuestionGroup, SavedSubmissionList } from "./components";

export const dataStore = ds;
export const SavedSubmission = SavedSubmissionList;
export const DownloadAnswerAsExcel = extras.DownloadAnswerAsExcel;

export const Webform = ({
  forms,
  style,
  formRef = null,
  sidebar = true,
  sticky = false,
  initialValue: initialDataValue = [],
  submitButtonSetting = {
    position: "bottom",
  },
  extraButton = "",
  printConfig = {
    showButton: false,
    hideInputType: [],
    header: "",
    filename: null,
  },
  customComponent = {},
  onChange = () => {},
  onFinish = () => {},
  onCompleteFailed = () => {},
  leftDrawerConfig = {},
  autoSave = {},
  downloadSubmissionConfig = {},
  fieldIcons = true,
  languagesDropdownSetting = {},
  UIText = {},
}) => {
  const originalForms = forms;

  const [form] = Form.useForm();
  const initialValue = GlobalStore.useState((s) => s.initialValue);
  const current = GlobalStore.useState((s) => s.current);
  const dataPointName = GlobalStore.useState((s) => s.dataPointName);
  const [activeGroup, setActiveGroup] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [completeGroup, setCompleteGroup] = useState([]);
  const [showGroup, setShowGroup] = useState([]);
  const [updatedQuestionGroup, setUpdatedQuestionGroup] = useState([]);
  const [showLangDropdown, setShowLangDropdown] = useState(true);
  const [lang, setLang] = useState(forms?.defaultLanguage || "en");
  const [isPrint, setIsPrint] = useState(false);
  const [isMobile, setIsMobile] = useState(detectMobile());
  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);

  const originalDocTitle = document.title;

  // check screen size or mobile browser
  window.addEventListener("resize", () => {
    setIsMobile(detectMobile());
  });

  const uiText = useMemo(() => {
    const UILocale = locale?.[lang] || locale.en;
    const UITextParam = UIText?.[lang] || {};
    return { ...UILocale, ...UITextParam };
  }, [lang, UIText]);

  useEffect(() => {
    if (
      !isEmpty(languagesDropdownSetting) &&
      typeof languagesDropdownSetting?.showLanguageDropdown !== "undefined"
    ) {
      setShowLangDropdown(languagesDropdownSetting.showLanguageDropdown);
    }
    if (
      !isEmpty(languagesDropdownSetting) &&
      languagesDropdownSetting?.languageDropdownValue
    ) {
      setLang(languagesDropdownSetting.languageDropdownValue);
    }
  }, [languagesDropdownSetting]);

  const formsMemo = useMemo(() => {
    // add fieldIcons to question param
    const updateQuestionParam = forms?.question_group?.map((qg) => {
      const questions = qg?.question?.map((q) => ({
        ...q,
        fieldIcons: fieldIcons,
      }));
      return {
        ...qg,
        question: questions,
      };
    });
    let formDef = transformForm({
      ...forms,
      question_group: updateQuestionParam,
    });
    if (updatedQuestionGroup.length) {
      formDef = {
        ...formDef,
        question_group: updatedQuestionGroup,
      };
    }
    const translated = translateForm(formDef, lang);
    return translated;
  }, [lang, updatedQuestionGroup, forms, fieldIcons]);

  const sidebarProps = useMemo(() => {
    return {
      uiText: uiText,
      sidebar: sidebar,
      showGroup: showGroup,
      activeGroup: activeGroup,
      setActiveGroup: setActiveGroup,
      completeGroup: completeGroup,
      formsMemo: formsMemo?.question_group
        ? formsMemo
        : { ...formsMemo, question_group: [] },
    };
  }, [sidebar, formsMemo, activeGroup, showGroup, completeGroup, uiText]);

  useEffect(() => {
    GlobalStore.update((gs) => {
      gs.formConfig = { autoSave: autoSave };
    });
  }, [autoSave]);

  // handle leading_question
  const leadingQuestions = useMemo(() => {
    const questions = forms?.question_group?.flatMap((qg) => qg.question);
    return questions.filter((q) => q?.lead_repeat_group?.length);
  }, [forms]);

  useEffect(() => {
    const meta = forms.question_group
      .filter((qg) => !qg?.repeatable)
      .flatMap((qg) => qg.question.filter((q) => q?.meta))
      .map((q) => ({ id: q.id, type: q.type, value: null }));
    GlobalStore.update((gs) => {
      gs.dataPointName = meta;
    });
  }, [forms]);

  useEffect(() => {
    if (typeof initialDataValue !== "undefined" && initialDataValue !== null) {
      form.resetFields();
      setCompleteGroup([]);
      GlobalStore.update((gs) => {
        gs.initialValue = initialDataValue;
      });
    }
    if (!initialDataValue?.length) {
      // reset datapoint name
      GlobalStore.update((gs) => {
        gs.dataPointName = [];
        gs.initialValue = [];
      });
    }
  }, [initialDataValue, form]);

  useEffect(() => {
    if (autoSave?.name) {
      ds.getId(autoSave.name)
        .then((d) => {
          ds.get(d.id);
        })
        .catch(() => {
          ds.new(autoSave?.formId || 1, autoSave.name);
        });
    } else {
      ds.disable();
    }
  }, [autoSave]);

  // handle leading_question
  const updateRepeatByLeadingQuestionAnswer = useCallback(
    ({ value, question_group }) => {
      if (!leadingQuestions?.length) {
        return question_group;
      }
      const answerId = Object.keys(value)[0];
      const findLeadingQuestion = leadingQuestions.find(
        (q) => q.id === parseInt(answerId)
      );
      if (
        !findLeadingQuestion ||
        !findLeadingQuestion?.lead_repeat_group?.length
      ) {
        return question_group;
      }
      const leadingQuestionAnswer = value?.[findLeadingQuestion.id] || null;
      if (!leadingQuestionAnswer) {
        return question_group;
      }
      // update repeat
      const updated = question_group.map((x) => {
        // if group id inside lead_repeat_group
        if (findLeadingQuestion.lead_repeat_group.includes(x.id)) {
          // update is_repeat_identifier default value
          x.question
            .filter((q) => q?.is_repeat_identifier)
            ?.forEach((q) => {
              const repeatKey = last(leadingQuestionAnswer);
              let repeatAnswer = last(leadingQuestionAnswer);
              if (q.type === "multiple_option") {
                repeatAnswer = [repeatAnswer];
              }
              form.setFieldsValue({
                [`${q.id}-${repeatKey}`]: repeatAnswer,
              });
            });
          return {
            ...x,
            repeat: leadingQuestionAnswer?.length || 1,
            repeats: leadingQuestionAnswer,
          };
        }
        return x;
      });
      setUpdatedQuestionGroup(updated);
      return updated;
    },
    [leadingQuestions, form]
  );

  const handleBtnPrint = () => {
    setIsPrint(true);
    setTimeout(() => {
      const print = document.getElementById("arf-print-iframe");
      if (print) {
        const { filename } = printConfig;
        const title = filename || `${formsMemo?.name}_${todayDate()}`;
        // change iframe title
        print.contentDocument.title = title;
        // change document title
        document.title = title;
        print.focus();
        print.contentWindow.print();
      }
      setIsPrint(false);
      document.title = originalDocTitle;
    }, 2500);
  };

  const updateRepeat = (index, value, operation, repeatIndex = null) => {
    const updated = formsMemo.question_group.map((x, xi) => {
      const isRepeatsAvailable = x?.repeats && x?.repeats?.length;
      const repeatNumber = isRepeatsAvailable
        ? x.repeats[x.repeats.length - 1] + 1
        : value - 1;
      let repeats = isRepeatsAvailable ? x.repeats : [0];
      if (xi === index) {
        if (operation === "add") {
          repeats = [...repeats, repeatNumber];
        }
        if (operation === "delete") {
          repeats.pop();
        }
        if (operation === "delete-selected" && repeatIndex !== null) {
          repeats = repeats.filter((r) => r !== repeatIndex);
        }
        return { ...x, repeat: value, repeats: repeats };
      }
      return x;
    });
    setCompleteGroup(
      completeGroup?.filter((c) => c !== `${index}-${value + 1}`)
    );
    setUpdatedQuestionGroup(updated);
  };

  const onComplete = (values) => {
    if (onFinish) {
      // filter form values
      const filteredFormValues = filterFormValues(values, formsMemo);
      const { dpName, dpGeo } = generateDataPointName(dataPointName);
      const refreshForm = () => {
        if (autoSave?.name) {
          ds.getId(autoSave.name).then((d) => {
            form.resetFields();
            ds.status(d.id, 1);
          });
        } else {
          form.resetFields();
        }
      };
      onFinish(
        { ...filteredFormValues, datapoint: { name: dpName, geo: dpGeo } },
        refreshForm
      );
      // reset datapoint name
      GlobalStore.update((gs) => {
        gs.dataPointName = [];
        gs.initialValue = [];
      });
    }
  };

  const onFinishFailed = ({ values, errorFields, outOfDate }) => {
    if (onCompleteFailed) {
      // filter form values
      const filteredFormValues = filterFormValues(values, formsMemo);
      onCompleteFailed({ values: filteredFormValues, errorFields, outOfDate });
    }
  };

  const onSave = () => {
    message.success(uiText.submissionSaved);
    Object.keys(current)
      .filter((x) => current[x])
      .forEach((x) => {
        ds.value.save({
          questionId: x,
          value: current[x],
        });
      });
  };

  const onValuesChange = useCallback(
    (qg, value /*, values */) => {
      // handle leading question
      const updatedQuestionGroupByLeadingQuestion =
        updateRepeatByLeadingQuestionAnswer({
          value,
          question_group: qg,
        });
      // filter form values
      const values = filterFormValues(form.getFieldsValue(), forms);
      const errors = form.getFieldsError();
      const data = Object.keys(values).map((k) => ({
        id: k.toString(),
        value: values[k],
      }));

      const incomplete = errors.map((e) => e.name[0]);
      const incompleteWithMoreError = errors
        .filter((e) => e.errors.length)
        .map((e) => e.name[0]);
      // mark as filled for 0 number input and check if that input has an error
      const filled = data.filter(
        (x) =>
          (x.value || x.value === 0) &&
          !incompleteWithMoreError.includes(parseInt(x.id))
      );
      const completeQg = updatedQuestionGroupByLeadingQuestion
        .map((x, ix) => {
          const isLeadingQuestion = x?.leading_question;
          let ids = x.question.map((q) => q.id);
          // handle repeat group question
          let ixs = [ix];
          if (x?.repeatable) {
            let iter = x?.repeat;
            let suffix = "";
            // handle leading_question
            if (isLeadingQuestion) {
              // handle ids naming for leading_question
              const repeatSuffix =
                iter && x?.repeats?.length ? x.repeats[iter - 1] : "";
              suffix = iter ? `-${repeatSuffix}` : "";
            } else {
              // normal repeat group
              suffix = iter > 1 ? `-${iter - 1}` : "";
            }
            do {
              const rids = x.question.map((q) => `${q.id}${suffix}`);
              ids = [...ids, ...rids];
              ixs = [...ixs, `${ix}-${iter}`];
              iter--;
            } while (iter > 0);
          }
          // end of handle repeat group question
          const mandatory = intersection(incomplete, ids)?.map((id) =>
            id.toString()
          );
          const filledMandatory = filled.filter((f) =>
            mandatory.includes(f.id)
          );
          return {
            i: ixs,
            complete: filledMandatory.length === mandatory.length,
          };
        })
        .filter((x) => x.complete);
      setCompleteGroup(completeQg.flatMap((qg) => qg.i));

      const appearQuestion = Object.keys(values).map((x) =>
        parseInt(x.replace("-", ""))
      );
      const appearGroup = forms?.question_group
        ?.map((qg, qgi) => {
          const appear = intersection(
            qg.question.map((q) => q.id),
            appearQuestion
          );
          return { groupIndex: qgi, appearQuestion: appear.length };
        })
        .filter((x) => x.appearQuestion)
        .map((x) => x.groupIndex);
      setShowGroup(appearGroup);

      if (autoSave?.name) {
        ds.value.update({ value: value });
      }

      if (onChange) {
        GlobalStore.update((s) => {
          s.current = values;
        });
        onChange({
          current: value,
          values: values,
          progress: (filled.length / errors.length) * 100,
        });
      }
    },
    [autoSave, form, forms, onChange, updateRepeatByLeadingQuestionAnswer]
  );

  useEffect(() => {
    // initial value load: related to src/lib/db.js line 95
    setLoadingInitial(true);
    let values = {};
    const allQuestions =
      forms?.question_group
        ?.map((qg, qgi) =>
          qg.question.map((q) => ({
            ...q,
            groupIndex: qgi,
            group_leading_question: qg?.leading_question || null,
          }))
        )
        ?.flatMap((q) => q) || [];
    const groupRepeats = transformForm(forms)?.question_group?.map((qg) => {
      const q = initialValue.filter((i) =>
        qg.question.map((q) => q.id).includes(i.question)
      );
      const rep = maxBy(q, "repeatIndex")?.repeatIndex;
      // handle not leading question when load initial value
      if (!qg?.leading_question && rep) {
        return { ...qg, repeat: rep + 1, repeats: range(rep + 1) };
      }
      // handle leading question when load initial value
      if (qg?.leading_question && rep) {
        const findLeadingAnswer = initialValue?.find(
          (v) => v.question === qg.leading_question
        );
        return {
          ...qg,
          repeat: rep + 1,
          repeats: findLeadingAnswer?.value || range(rep + 1),
        };
      }
      return qg;
    });
    setUpdatedQuestionGroup(groupRepeats);

    for (const val of initialValue) {
      const question = allQuestions.find((q) => q.id === val.question);
      let objName = val?.repeatIndex
        ? `${val.question}-${val.repeatIndex}`
        : val.question;

      // handle leading question when load initial value
      if (question?.group_leading_question) {
        const findLeadingAnswer = initialValue?.find(
          (v) => v.question === question.group_leading_question
        );
        if (
          findLeadingAnswer?.value &&
          findLeadingAnswer?.value?.[val.repeatIndex]
        ) {
          objName = `${val.question}-${
            findLeadingAnswer.value[val.repeatIndex]
          }`;
        }
      }
      // handle to show also 0 init value from number
      values =
        val?.value || val?.value === 0
          ? {
              ...values,
              [objName]:
                question?.type !== "date" ? val.value : moment(val.value),
            }
          : values;
    }
    if (isEmpty(values)) {
      form.setFieldsValue({});
      form.resetFields();
      setCompleteGroup([]);
      setLoadingInitial(false);
    } else {
      form.setFieldsValue(values);
      setTimeout(() => {
        onValuesChange(groupRepeats, values[Object.keys(values)[0]], values);
        setLoadingInitial(false);
      }, 1000);
    }
    const appearQuestion = Object.keys(form.getFieldsValue()).map((x) =>
      parseInt(x.replace("-", ""))
    );
    const appearGroup = forms?.question_group
      ?.map((qg, qgi) => {
        const appear = intersection(
          qg.question.map((q) => q.id),
          appearQuestion
        );
        return { groupIndex: qgi, appearQuestion: appear.length };
      })
      .filter((x) => x.appearQuestion)
      .map((x) => x.groupIndex);
    setShowGroup(appearGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue]);

  useEffect(() => {
    const appearQuestion = Object.keys(form.getFieldsValue()).map((x) =>
      parseInt(x.replace("-", ""))
    );
    const appearGroup = forms?.question_group
      ?.map((qg, qgi) => {
        const appear = intersection(
          qg.question.map((q) => q.id),
          appearQuestion
        );
        return { groupIndex: qgi, appearQuestion: appear.length };
      })
      .filter((x) => x.appearQuestion)
      .map((x) => x.groupIndex);
    setShowGroup(appearGroup);
  }, [form, forms]);

  const firstGroup = take(showGroup);
  const lastGroup = takeRight(showGroup);

  const SubmitButton = ({ ...props }) => (
    <Button
      key="submit"
      type="primary"
      htmlType="submit"
      onClick={() => form.submit()}
      {...submitButtonSetting}
      {...props}
    >
      {uiText.submit}
    </Button>
  );

  const PrevNextButton = () => {
    return formsMemo?.question_group.map((_, key) => {
      return (
        activeGroup === key && (
          <Row gutter={[18, 18]} key={key} className="arf-next">
            <Col span={12} align="start" style={{ float: "left" }}>
              {!firstGroup?.includes(key) && (
                <Button
                  className="arf-btn-previous"
                  type="default"
                  disabled={firstGroup?.includes(key)}
                  onClick={() => {
                    const prevIndex = showGroup.indexOf(key);
                    setActiveGroup(showGroup[prevIndex - 1]);
                  }}
                >
                  {uiText.previous}
                </Button>
              )}
            </Col>
            <Col span={12} align="end" style={{ float: "right" }}>
              {!lastGroup.includes(key) && (
                <Button
                  className="arf-btn-next"
                  type="default"
                  disabled={lastGroup.includes(key)}
                  onClick={() => {
                    const nextIndex = showGroup.indexOf(key);
                    setActiveGroup(showGroup[nextIndex + 1]);
                  }}
                >
                  {uiText.next}
                </Button>
              )}
            </Col>
          </Row>
        )
      );
    });
  };

  const onDownload = () => {
    extras.DownloadAnswerAsExcel({
      question_group: originalForms?.question_group,
      answers: current,
      horizontal: downloadSubmissionConfig?.horizontal,
      filename: downloadSubmissionConfig?.filename,
    });
  };

  const isLastGroup = useMemo(() => {
    const lastShownGroup = last(showGroup);
    return activeGroup === lastShownGroup;
  }, [activeGroup, showGroup]);

  if (!formsMemo?.question_group) {
    return "Error Format";
  }

  return (
    <Row className="arf-container">
      <Col
        span={24}
        className={`arf-form-header ${sticky ? "arf-sticky" : ""}`}
      >
        <Row align="middle">
          <Col
            span={12}
            className={isMobile ? "arf-mobile-header-wrapper" : ""}
          >
            <h1>{formsMemo?.name}</h1>
            <p>{generateDataPointName(dataPointName)?.dpName}</p>
          </Col>
          <Col span={12} align="right">
            <Space>
              {showLangDropdown && (
                <Select
                  options={formsMemo.languages}
                  onChange={setLang}
                  defaultValue={formsMemo?.defaultLanguage || "en"}
                  style={{ width: isMobile ? 105 : 150, textAlign: "left" }}
                />
              )}
              {!isMobile && loadingInitial ? (
                <Button type="secondary" loading disabled>
                  {uiText.loadingInitialData}
                </Button>
              ) : !isMobile ? (
                [
                  autoSave?.name && (
                    <Button key="save" onClick={onSave}>
                      {autoSave?.buttonText || uiText.save}
                    </Button>
                  ),
                  submitButtonSetting?.position === "top" && <SubmitButton />,
                  downloadSubmissionConfig?.visible && (
                    <Button key="download" type="primary" onClick={onDownload}>
                      {uiText.download}
                    </Button>
                  ),
                ]
              ) : (
                ""
              )}
              {extraButton}
              {printConfig.showButton && (
                <Button
                  ghost
                  type="primary"
                  onClick={handleBtnPrint}
                  loading={isPrint}
                >
                  {uiText.print}
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Col>

      {/* Sidebar */}
      {sidebar && !isMobile && (
        <Col span={6} className={`arf-sidebar ${sticky ? "arf-sticky" : ""}`}>
          <Sidebar
            {...sidebarProps}
            submitButton={
              <div
                style={{
                  marginTop: "16px",
                  borderTop: "2px solid #F0F0F0",
                  paddingRight: "12px",
                  paddingTop: "16px",
                }}
              >
                <SubmitButton
                  block
                  disabled={isLastGroup ? submitButtonSetting?.disabled : true}
                />
              </div>
            }
            submitButtonSetting={submitButtonSetting}
          />
        </Col>
      )}

      {/* Form */}
      <Col span={sidebar && !isMobile ? 18 : 24}>
        <Form
          ref={formRef}
          form={form}
          layout="vertical"
          name={formsMemo.name}
          scrollToFirstError="true"
          onValuesChange={(value, values) =>
            setTimeout(() => {
              onValuesChange(formsMemo.question_group, value, values);
            }, 100)
          }
          onFinish={onComplete}
          onFinishFailed={onFinishFailed}
          style={style}
          requiredMark={false}
        >
          {formsMemo?.question_group?.map((g, key) => {
            const isRepeatable = g?.repeatable;
            // handle leading_question
            const isLeadingQuestion = g?.leading_question;
            let repeats = g?.repeats?.length ? g.repeats : range(1);
            if (isLeadingQuestion && !g?.show_repeat_in_question_level) {
              // This is for the normal repeat group UI Style
              repeats = g?.repeats && g?.repeats?.length ? g.repeats : [];
            }
            // Handle show repeat in question level setting
            // This is for the repeat group inside each question
            // to show the repeat group as a table
            if (g?.show_repeat_in_question_level) {
              // This is for the repeat group inside each question
              repeats = g?.repeats && g?.repeats?.length ? range(1) : [];
              g["question"] = g["question"].map((q) => ({
                ...q,
                show_repeat_in_question_level:
                  g?.repeats && g?.repeats?.length ? true : false,
                repeats: g?.repeats && g?.repeats?.length ? g.repeats : [],
              }));
            }
            const headStyle =
              sidebar && sticky && isRepeatable
                ? {
                    backgroundColor: "#fff",
                    position: "sticky",
                    top: sticky ? "59px" : 0,
                    zIndex: 9999,
                  }
                : {};
            let QuestionGroupComponent = QuestionGroup;
            if (g?.custom_component) {
              QuestionGroupComponent =
                customComponent?.[g.custom_component] || ErrorComponent;
            }
            return (
              <QuestionGroupComponent
                key={key}
                index={key}
                group={g}
                forms={formsMemo}
                activeGroup={activeGroup}
                sidebar={sidebar}
                updateRepeat={updateRepeat}
                repeats={repeats}
                headStyle={headStyle}
                initialValue={initialValue}
                showGroup={showGroup}
                uiText={uiText}
                formRef={formRef}
              />
            );
          })}
        </Form>

        {/* Previous & Next Button */}
        {sidebar && !isMobile && <PrevNextButton />}
      </Col>

      {/* Mobile Footer */}
      {isMobile && (
        <MobileFooter
          sidebarProps={sidebarProps}
          form={form}
          isMobile={isMobile}
          isMobileMenuVisible={isMobileMenuVisible}
          setIsMobileMenuVisible={setIsMobileMenuVisible}
          isSaveFeatureEnabled={false}
          loadingInitial={loadingInitial}
          submitButtonSetting={submitButtonSetting}
          autoSave={autoSave}
          onSave={onSave}
          downloadSubmissionConfig={{
            ...downloadSubmissionConfig,
            onDownload: onDownload,
          }}
          uiText={uiText}
        />
      )}

      {/* Saved submission drawer */}
      {leftDrawerConfig?.visible && <LeftDrawer {...leftDrawerConfig} />}

      {isPrint && (
        <IFrame>
          <Print forms={originalForms} lang={lang} printConfig={printConfig} />
        </IFrame>
      )}
    </Row>
  );
};
