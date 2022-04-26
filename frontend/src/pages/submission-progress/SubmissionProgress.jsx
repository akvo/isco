import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import { Row, Col, Typography, Table } from "antd";
import { api, store } from "../../lib";
import { uiText } from "../../static";
import _ from "lodash";

const { Title } = Typography;

const SubmissionProgress = () => {
  const { isLoggedIn, language } = store.useState((s) => s);
  const { active: activeLang } = language;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const text = useMemo(() => {
    return uiText[activeLang];
  }, [activeLang]);

  const columns = [
    {
      title: text.tbColOrganization,
      dataIndex: "organisation",
      key: "organisation",
    },
    {
      title: text.tbColMemberQuestionnaire,
      children: [
        {
          title: text.tbColSaved,
          dataIndex: "memberSaved",
          key: "member-saved-count",
          align: "center",
        },
        {
          title: text.tbColSubmitted,
          dataIndex: "memberSubmitted",
          key: "member-submitted-count",
          align: "center",
        },
      ],
    },
    {
      title: text.tbColProjectQuestionnaire,
      children: [
        {
          title: text.tbColSaved,
          dataIndex: "projectSaved",
          key: "project-saved-count",
          align: "center",
        },
        {
          title: text.tbColSubmitted,
          dataIndex: "projectSubmitted",
          key: "project-submitted-count",
          align: "center",
        },
      ],
    },
  ];

  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      api
        .get("/submission/progress")
        .then((res) => {
          const { data } = res;
          let transformData = data.map((d) => {
            const { organisation, form_type, submitted, count } = d;
            let res = {
              organisation: organisation,
              form_type: form_type,
              memberSaved: 0,
              memberSubmitted: 0,
              projectSaved: 0,
              projectSubmitted: 0,
            };
            if (form_type === "member") {
              res = {
                ...res,
                memberSaved: submitted ? 0 : count,
                memberSubmitted: submitted ? count : 0,
              };
            }
            if (form_type === "project") {
              res = {
                ...res,
                projectSaved: submitted ? 0 : count,
                projectSubmitted: submitted ? count : 0,
              };
            }
            return res;
          });
          transformData = _.chain(transformData)
            .groupBy("organisation")
            .flatMap((value) => {
              const reduce = _.reduce(value, (sum, n) => {
                sum["projectSaved"] = sum.projectSaved + n.projectSaved;
                sum["projectSubmitted"] =
                  sum.projectSubmitted + n.projectSubmitted;
                sum["memberSaved"] = sum.memberSaved + n.memberSaved;
                sum["memberSubmitted"] =
                  sum.memberSubmitted + n.memberSubmitted;
                return sum;
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
        .finally(() => {
          setIsLoading(false);
        });
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
          <Row>
            <Col span={24}>
              <Table
                rowKey={(record) =>
                  `${record.organisation}-${record.form_type}`
                }
                className="table-wrapper"
                columns={columns}
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
