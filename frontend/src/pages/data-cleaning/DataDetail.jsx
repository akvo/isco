import React from "react";
import ReactHtmlParser from "react-html-parser";
import "./style.scss";
import { Table, Space } from "antd";
import _ from "lodash";

const columns = [
  {
    title: "Question",
    dataIndex: "question_name",
    render: (val) => ReactHtmlParser(val),
    width: "25%",
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
    width: "10%",
  },
  {
    title: "Comment",
    dataIndex: "comment",
    render: (val) => val || "-",
    width: "10%",
  },
];

const generateHistoryColumns = (year) => [
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
    width: "10%",
  },
];

const DataDetail = ({ record }) => {
  // Remap answer and history to provide the repeat_identifier
  const identifierAnswer = record?.answer?.filter(
    (a) => a?.is_repeat_identifier
  );
  const recordAnswer = record?.answer?.map((ra) => {
    const findIdentifier = identifierAnswer.find(
      (x) =>
        x.question_group === ra.question_group &&
        x.repeat_index === ra.repeat_index
    );
    let repeat_identifier = ra.repeat_index;
    if (findIdentifier && findIdentifier?.value) {
      repeat_identifier = findIdentifier.value;
      if (Array.isArray(findIdentifier.value)) {
        repeat_identifier = findIdentifier?.value?.[0] || null;
      }
    }
    return {
      ...ra,
      repeat_identifier: repeat_identifier,
    };
  });
  record["answer"] = recordAnswer;

  const history = record?.history?.map((h) => {
    const identifierAnswer = h?.answer?.filter((a) => a?.is_repeat_identifier);
    const historyAnswer = h?.answer?.map((ha) => {
      const findIdentifier = identifierAnswer.find(
        (x) =>
          x.question_group === ha.question_group &&
          x.repeat_index === ha.repeat_index
      );
      let repeat_identifier = ha.repeat_index;
      if (findIdentifier && findIdentifier?.value) {
        repeat_identifier = findIdentifier.value;
        if (Array.isArray(findIdentifier.value)) {
          repeat_identifier = findIdentifier?.value?.[0] || null;
        }
      }
      return {
        ...ha,
        repeat_identifier: repeat_identifier,
      };
    });
    return { ...h, answer: historyAnswer };
  });
  // EOL Remap answer and history to provide the repeat_identifier

  // generate history columns
  const allHistoryColumns = history.map((h) => {
    return {
      title: h.year,
      className: "group-header data-history",
      children: [...generateHistoryColumns(h.year)],
    };
  });

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

    return values.map((v, vi) => {
      // find repeat identifier
      const findRepeatIdentifier = v.find((q) => q?.is_repeat_identifier);
      let titleSuffix = length > 1 ? ` - ${vi + 1}` : "";
      if (findRepeatIdentifier) {
        titleSuffix = findRepeatIdentifier?.value?.length
          ? ` - ${findRepeatIdentifier?.value?.join(" ")}`
          : "";
      }

      // Map into the repeat group with repeat_identifier value
      let dataSource = [];
      history?.forEach((h) => {
        const vHistory = v.map((curr) => {
          const findAnswerHistory = h?.answer?.find(
            (x) =>
              x.question === curr.question &&
              x.repeat_identifier === curr.repeat_identifier
          );
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
              ...allHistoryColumns,
            ]}
          />
        </Space>
      );
    });
  });
};

export default DataDetail;
