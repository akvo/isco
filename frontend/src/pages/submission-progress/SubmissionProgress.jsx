import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import { Row, Col, Typography, Table, Select, Space, Checkbox } from "antd";
import { api, store } from "../../lib";
import { uiText } from "../../static";
import _ from "lodash";

const { Title } = Typography;
const { Option } = Select;

const SubmissionProgress = () => {
  const { isLoggedIn, language, user, optionValues } = store.useState((s) => s);
  const { active: activeLang } = language;
  const { organisationInSameIsco } = optionValues;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const showOrganisationFilter = user?.role === "secretariat_admin";
  const [orgValue, setOrgValue] = useState(null);
  const [showNonSubmitted, setShowNonSubmitted] = useState(false);

  const [forms, setForms] = useState([]);
  const [formSelected, setFormSelected] = useState(null);

  // const currentYear = new Date().getFullYear();

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const formName = useMemo(() => {
    if (!forms.length || !formSelected) {
      return "questionnaire";
    }
    const form = forms.find((x) => x.value === formSelected);
    return `${form.label} questionnaire`;
  }, [forms, formSelected]);

  const orgName = useMemo(() => {
    if (!organisationInSameIsco.length || !orgValue) {
      return "organisation";
    }
    const org = organisationInSameIsco.find((x) => x.id === orgValue);
    return org.name;
  }, [organisationInSameIsco, orgValue]);

  useEffect(() => {
    if (!forms.length) {
      api
        .get("/form/published")
        .then((res) => {
          const data = res.data.map((x) => ({
            label: x.label,
            value: x.value,
          }));
          setForms(data);
        })
        .catch((e) => console.error(e));
    }
  }, [forms]);

  const columns = () => {
    return [
      {
        title: text.tbColOrganization,
        dataIndex: "organisation",
        key: "organisation",
      },
      {
        title: text.tbColSaved,
        dataIndex: "saved",
        key: "saved",
        align: "center",
      },
      {
        title: text.tbColSubmitted,
        dataIndex: "submitted",
        key: "submitted",
        align: "center",
      },
    ];
    // TODO :: Delete this, related to #466 issue
    // const discoSubmissionCol = [
    //   {
    //     title: text.tbColDISCOSharedMemberSurvey,
    //     children: [
    //       {
    //         title: text.tbColSaved,
    //         dataIndex: "limitedSaved",
    //         key: "limited-saved-count",
    //         align: "center",
    //       },
    //       {
    //         title: text.tbColSubmitted,
    //         dataIndex: "limitedSubmitted",
    //         key: "limited-submitted-count",
    //         align: "center",
    //       },
    //     ],
    //   },
    // ];
    // const cols = [
    //   {
    //     title: text.tbColOrganization,
    //     dataIndex: "organisation",
    //     key: "organisation",
    //   },
    //   {
    //     title: text.tbColMemberQuestionnaire,
    //     children: [
    //       {
    //         title: text.tbColSaved,
    //         dataIndex: "memberSaved",
    //         key: "member-saved-count",
    //         align: "center",
    //       },
    //       {
    //         title: text.tbColSubmitted,
    //         dataIndex: "memberSubmitted",
    //         key: "member-submitted-count",
    //         align: "center",
    //       },
    //     ],
    //   },
    //   {
    //     title: text.tbColProjectQuestionnaire,
    //     children: [
    //       {
    //         title: text.tbColSaved,
    //         dataIndex: "projectSaved",
    //         key: "project-saved-count",
    //         align: "center",
    //       },
    //       {
    //         title: text.tbColSubmitted,
    //         dataIndex: "projectSubmitted",
    //         key: "project-submitted-count",
    //         align: "center",
    //       },
    //     ],
    //   },
    // ];
    // if (currentYear < 2023) {
    //   return [...cols, ...discoSubmissionCol];
    // }
    // return cols;
    // EOL delete
  };

  const handleOrganisationFilter = (org) => {
    setOrgValue(org);
  };

  const handleShowNonSubmittedQuestionnaireCheckbox = (e) => {
    setShowNonSubmitted(e.target.checked);
  };

  const fetchData = (endpoint) => {
    setIsLoading(true);
    api
      .get(endpoint)
      .then((res) => {
        const { data } = res;
        let transformData = data.map((d) => {
          const { organisation, form_type, submitted, count } = d;
          const res = {
            organisation: organisation,
            form_type: form_type,
            saved: submitted ? 0 : count,
            submitted: submitted ? count : 0,
          };
          return res;
          // TODO :: Delete this, related to #466 issue
          // let res = {
          //   organisation: organisation,
          //   form_type: form_type,
          //   memberSaved: 0,
          //   memberSubmitted: 0,
          //   projectSaved: 0,
          //   projectSubmitted: 0,
          //   limitedSaved: 0,
          //   limitedSubmitted: 0,
          // };
          // if (form_type === "member") {
          //   res = {
          //     ...res,
          //     memberSaved: submitted ? 0 : count,
          //     memberSubmitted: submitted ? count : 0,
          //   };
          // }
          // if (form_type === "project") {
          //   res = {
          //     ...res,
          //     projectSaved: submitted ? 0 : count,
          //     projectSubmitted: submitted ? count : 0,
          //   };
          // }
          // if (form_type === "limited") {
          //   res = {
          //     ...res,
          //     limitedSaved: submitted ? 0 : count,
          //     limitedSubmitted: submitted ? count : 0,
          //   };
          // }
          // return res;
          // EOL delete
        });
        transformData = _.chain(transformData)
          .groupBy("organisation")
          .flatMap((value) => {
            const reduce = _.reduce(value, (sum, n) => {
              +n.projectSaved;
              sum["saved"] = sum.saved + n.saved;
              sum["submitted"] = sum.submitted + n.submitted;
              return sum;
              // TODO :: Delete this, related to #466 issue
              // sum["projectSaved"] = sum.projectSaved + n.projectSaved;
              // sum["projectSubmitted"] =
              //   sum.projectSubmitted + n.projectSubmitted;
              // sum["memberSaved"] = sum.memberSaved + n.memberSaved;
              // sum["memberSubmitted"] = sum.memberSubmitted + n.memberSubmitted;
              // sum["limitedSaved"] = sum.limitedSaved + n.limitedSaved;
              // sum["limitedSubmitted"] =
              //   sum.limitedSubmitted + n.limitedSubmitted;
              // return sum;
              // EOL delete
            });
            return reduce;
          })
          .value();
        setData(transformData);
      })
      .catch((e) => {
        console.error(e);
        setData([]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    let endpoint = "/submission/progress";
    if (formSelected) {
      const separator = endpoint?.includes("?") ? "&" : "?";
      endpoint = `${endpoint}${separator}form_id=${formSelected}`;
    }
    if (orgValue) {
      const separator = endpoint?.includes("?") ? "&" : "?";
      endpoint = `${endpoint}${separator}organisation=${orgValue}`;
    }
    if (showNonSubmitted) {
      const separator = endpoint?.includes("?") ? "&" : "?";
      endpoint = `${endpoint}${separator}not_submitted=${showNonSubmitted}`;
    }
    fetchData(endpoint);
  }, [orgValue, formSelected, showNonSubmitted]);

  useEffect(() => {
    const endpoint = "/submission/progress";
    if (isLoggedIn) {
      fetchData(endpoint);
    }
  }, [isLoggedIn]);

  return (
    <div id="submission-progress">
      <Row className="container bg-grey">
        <Col span={24}>
          <Row
            className="page-title-wrapper"
            align="middle"
            justify="space-between"
          >
            <Col span={24} align="start">
              <Title className="page-title" level={3}>
                {text.pageSubmissionProgress}
              </Title>
            </Col>
          </Row>
          <Row
            className="filter-wrapper"
            align="middle"
            justify="space-between"
            gutter={[20, 20]}
          >
            <Col flex={1} align="start">
              <Space wrap align="center">
                <Select
                  style={{ width: "18rem" }}
                  allowClear
                  showSearch
                  placeholder="Questionnaires"
                  optionFilterProp="label"
                  value={formSelected}
                  onChange={setFormSelected}
                  options={forms}
                />
                {showOrganisationFilter && (
                  <Select
                    style={{ width: "18rem" }}
                    allowClear
                    showSearch
                    placeholder="Organization"
                    optionFilterProp="label"
                    value={orgValue}
                    onChange={handleOrganisationFilter}
                  >
                    {organisationInSameIsco.length
                      ? organisationInSameIsco.map((o) => (
                          <Option value={o.id} key={o.id}>
                            {o.name}
                          </Option>
                        ))
                      : []}
                  </Select>
                )}
              </Space>
            </Col>
            <Col align="end">
              <Space align="center">
                <span style={{ fontSize: "14px" }}>
                  Show as {orgName} which has no submitted {formName}
                </span>
                <Checkbox
                  checked={showNonSubmitted}
                  onChange={handleShowNonSubmittedQuestionnaireCheckbox}
                />
              </Space>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                rowKey={(record) =>
                  `${record.organisation}-${record.form_type}`
                }
                className="table-wrapper"
                columns={columns()}
                dataSource={data}
                loading={isLoading}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default SubmissionProgress;
