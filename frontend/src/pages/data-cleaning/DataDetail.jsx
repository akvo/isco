import React from "react";
import ReactHtmlParser from "react-html-parser";
import "./style.scss";
import { Table, Space } from "antd";
import _ from "lodash";

const DataDetail = ({ record }) => {
  // transform answer to group by question group and repeat index
  const answers = _.chain(
    _.orderBy(
      record.answer,
      ["question_group_order", "question_order"],
      ["asc"]
    )
  )
    .groupBy("question_group")
    .mapValues((value) => _.chain(value).groupBy("repeat_index").value())
    .value();

  const columns = [
    {
      title: "Question",
      dataIndex: "question_name",
      render: (val) => ReactHtmlParser(val),
      width: "50%",
    },
    {
      title: "Answer",
      dataIndex: "value",
      render: (val) => {
        if (!val) {
          return " - ";
        }
        if (typeof val === "object" && !Array.isArray(val)) {
          return Object.values(val).length ? val.join(" | ") : "-";
        }
        if (Array.isArray(val)) {
          return val.length ? val.join(" | ") : "-";
        }
        return val || val === 0 ? val : "-";
      },
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
    const values = _.orderBy(
      Object.values(answers[key]),
      ["question_order"],
      ["asc"]
    );
    const title = ReactHtmlParser(key);

    return values.map((v, vi) => {
      return (
        <Space
          key={`${key}-${ki}-${vi}`}
          className="data-detail-table-wrapper"
          direction="vertical"
        >
          <Table
            rowKey={(answer, ri) => `${record.id}-${answer.question}-${ri}`}
            size="small"
            pagination={false}
            dataSource={v}
            columns={[
              {
                title: length > 1 ? `${title} - ${vi + 1}` : title,
                className: "group-header",
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
