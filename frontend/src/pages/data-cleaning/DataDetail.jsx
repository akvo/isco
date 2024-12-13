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
      width: "30%",
    },
    {
      title: "Answer",
      dataIndex: "value",
      render: (val) => {
        if (val && typeof val === "object" && !Array.isArray(val)) {
          return Object.values(val).length ? val.join(" | ") : "-";
        }
        if (val && Array.isArray(val)) {
          return val.length ? val.join(" | ") : "-";
        }
        return val || val === 0 ? val : "-";
      },
      // width: "25%",
    },
    {
      title: "Comment",
      dataIndex: "comment",
      render: (val) => val || "-",
      // width: "25%",
    },
  ];

  const historyColumns = (year) => [
    {
      title: "Answer",
      dataIndex: `value_${year}`,
      render: (val) => {
        if (val && typeof val === "object" && !Array.isArray(val)) {
          return Object.values(val).length ? val.join(" | ") : "-";
        }
        if (val && Array.isArray(val)) {
          return val.length ? val.join(" | ") : "-";
        }
        return val || val === 0 ? val : "-";
      },
      // width: "25%",
    },
    // {
    //   title: "Comment",
    //   dataIndex: `comment_${year}`,
    //   render: (val) => val || "-",
    //   // width: "25%",
    // },
  ];

  if (_.isEmpty(answers)) {
    return (
      <Space
        key={`space-no-data-${record.id}`}
        className="data-detail-table-wrapper"
        direction="vertical"
      >
        <Table
          rowKey={`table-no-data-${record.id}`}
          size="small"
          pagination={false}
          dataSource={[]}
          columns={[]}
        />
      </Space>
    );
  }

  return Object.keys(answers).map((key, ki) => {
    const length = Object.values(answers[key]).length;
    const values = _.orderBy(
      Object.values(answers[key]),
      ["question_order"],
      ["asc"]
    );
    const title = ReactHtmlParser(key);

    // TODO :: Find history
    const history = record?.history;
    const histories = history.map((h) => {
      return {
        title: h.year,
        className: "group-header data-history",
        children: [...historyColumns(h.year)],
      };
    });

    console.log(record);
    return values.map((v, vi) => {
      // find repeat identifier
      const findRepeatIdentifier = v.find((q) => q?.is_repeat_identifier);
      let titleSuffix = length > 1 ? ` - ${vi + 1}` : "";
      if (findRepeatIdentifier) {
        titleSuffix = findRepeatIdentifier?.value?.length
          ? ` - ${findRepeatIdentifier?.value?.join(" ")}`
          : "";
      }

      // TODO :: I think the easiest way to do history repeat is to save the Index of the repeatable in string for each lead question answer
      let dataSource = [];
      record?.history?.forEach((h) => {
        const vHistory = v.map((curr) => {
          let findAnswerHistory = null;
          if (curr?.is_repeat_identifier) {
            findAnswerHistory = h?.answer?.find(
              (x) => x.question === curr.question && x.value === curr.value
            );
            console.log(findAnswerHistory, "==", curr);
          } else {
            findAnswerHistory = h?.answer?.find(
              (x) => x.question === curr.question
            );
          }
          return {
            ...curr,
            [`value_${h.year}`]: findAnswerHistory?.value || "",
            [`comment_${h.year}`]: findAnswerHistory?.comment || "",
          };
        });
        dataSource = [...dataSource, ...vHistory];
      });

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
            dataSource={dataSource}
            columns={[
              {
                title: `${title}${titleSuffix}`,
                className: "group-header",
                children: [...columns],
              },
              ...histories,
            ]}
          />
        </Space>
      );
    });
  });
};

export default DataDetail;
