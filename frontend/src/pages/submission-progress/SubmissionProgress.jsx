import React, { useState, useEffect } from "react";
import "./style.scss";
import { Row, Col, Typography, Table } from "antd";
import { api, store } from "../../lib";
import _ from "lodash";

const { Title } = Typography;

const SubmissionProgress = () => {
  const isLoggedIn = store.useState((s) => s.isLoggedIn);

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const columns = [
    {
      title: "Organisation",
      dataIndex: "organisation",
      key: "organisation",
    },
    {
      title: "Member Questionnaire",
      children: [
        {
          title: "Saved",
          dataIndex: "memberSaved",
          key: "member-saved-count",
          align: "center",
        },
        {
          title: "Submitted",
          dataIndex: "memberSubmitted",
          key: "member-submitted-count",
          align: "center",
        },
      ],
    },
    {
      title: "Project Questionnaire",
      children: [
        {
          title: "Saved",
          dataIndex: "projectSaved",
          key: "project-saved-count",
          align: "center",
        },
        {
          title: "Submitted",
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
                Submission Progress
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
