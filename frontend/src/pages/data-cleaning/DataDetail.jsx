import React from "react";
import "./style.scss";
import { Table, Space } from "antd";
import _ from "lodash";

const DataDetail = ({ record }) => {
  // transform answer to group by question group and repeat index
  const answers = _.chain(record.answer)
    .groupBy("question_group")
    .mapValues((value) => _.chain(value).groupBy("repeat_index").value())
    .value();

  const columns = [
    {
      title: "Question",
      dataIndex: "question_name",
      width: "50%",
    },
    {
      title: "Answer",
      dataIndex: "value",
      render: (val) => val || "-",
      width: "25%",
    },
    {
      title: "Comment",
      dataIndex: "comment",
      render: (val) => val || "-",
      width: "25%",
    },
  ];

  return Object.keys(answers).map((key, ki) => {
    const length = Object.values(answers[key]).length;
    const values = Object.values(answers[key]);
    return values.map((v, vi) => {
      return (
        <Space
          key={`${key}-${ki}-${vi}`}
          direction="vertical"
          style={{ width: "100%" }}
        >
          <Table
            rowKey={(answer, ri) => `${record.id}-${answer.question}-${ri}`}
            size="small"
            pagination={false}
            dataSource={v}
            columns={[
              {
                title: length > 1 ? `${key} - ${vi + 1}` : key,
                children: [...columns],
              },
            ]}
          />
        </Space>
      );
    });
  });
};

export default DataDetail;
