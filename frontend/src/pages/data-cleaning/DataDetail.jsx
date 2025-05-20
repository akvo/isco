import React from "react";
import ReactHtmlParser from "react-html-parser";
import "./style.scss";
import { Table, Space } from "antd";
import _ from "lodash";
import { isNumeric } from "../../lib/util";

const formatAnswerValue = (val) => {
  if (_.isObject(val) && !Array.isArray(val)) {
    return Object.values(val).length ? val.join(" | ") : "-";
  }
  if (Array.isArray(val)) {
    return val.length ? val.join(" | ") : "-";
  }
  return val || val === 0 ? val : "-";
};

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
    render: (val) => formatAnswerValue(val),
    width: "8%",
  },
  {
    title: "Comment",
    dataIndex: "comment",
    render: (val) => val || "-",
    width: "5%",
  },
];

const generateHistoryColumns = (year) => [
  {
    title: "Answer",
    dataIndex: `value_${year}`,
    render: (val) => formatAnswerValue(val),
    width: "8%",
  },
  {
    title: "Comment",
    dataIndex: `comment_${year}`,
    render: (val) => val || "-",
    width: "5%",
  },
];

const mergeObjectsByQuestionName = (arr) => {
  // Group the objects by `question_name`
  const grouped = _.groupBy(arr, "question_name");
  // Merge each group of objects
  const merged = _.map(grouped, (group) => {
    return _.mergeWith({}, ...group, (objValue, srcValue, key) => {
      // Custom merge logic for year-specific properties
      if (key.startsWith("value_") || key.startsWith("comment_")) {
        return srcValue; // Use the source value
      }
      // Default merge behavior
      return typeof objValue === "undefined" ? srcValue : objValue;
    });
  });
  return merged;
};

const DataDetail = ({ record }) => {
  // Remap answer and history to provide the repeat_identifier
  const identifierAnswer = record?.answer?.filter(
    (a) => a?.is_repeat_identifier
  );
  const recordAnswer = record?.answer?.map((ra) => {
    if (!isNumeric(ra.repeat_index)) {
      // handle if repeat_index is String
      return {
        ...ra,
        repeat_identifier: ra.repeat_index,
      };
    }
    // handle repeat group index with is_repeat_identifier
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
    // handle repeat group without is_repeat_identifier (table view)
    const findLeadingAnswer = record?.answer?.find(
      (a) => a.question === ra.question_group_leading_question
    );
    if (findLeadingAnswer && findLeadingAnswer?.value?.length) {
      repeat_identifier = findLeadingAnswer.value?.[ra.repeat_index] || null;
    }
    return {
      ...ra,
      repeat_identifier: repeat_identifier,
    };
  });
  record["answer"] = recordAnswer;

  let history = record?.history
    ?.filter((h) => h.id !== record.id) // prevent same data id on history
    ?.map((h) => {
      const identifierAnswer = h?.answer?.filter(
        (a) => a?.is_repeat_identifier
      );
      const historyAnswer = h?.answer?.map((ha) => {
        const findRecordLeadingAnswer = record?.answer?.find(
          (a) => a.question === ha.question_group_leading_question
        );
        const findHistoryLeadingAnswer = h?.answer?.find(
          (a) => a.question === ha.question_group_leading_question
        );
        //
        if (!isNumeric(ha.repeat_index) && findRecordLeadingAnswer) {
          // handle if repeat_index is String
          return {
            ...ha,
            repeat_identifier: ha.repeat_index,
          };
        }
        // handle repeat group index with is_repeat_identifier
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
        // handle repeat group without is_repeat_identifier (table view)
        if (
          findHistoryLeadingAnswer &&
          findHistoryLeadingAnswer?.value?.length &&
          isNumeric(ha.repeat_index)
        ) {
          repeat_identifier =
            findHistoryLeadingAnswer.value?.[ha.repeat_index] || null;
        }
        if (
          findRecordLeadingAnswer &&
          findRecordLeadingAnswer?.value?.length &&
          isNumeric(ha.repeat_index)
        ) {
          repeat_identifier =
            findRecordLeadingAnswer.value?.[ha.repeat_index] || null;
        }
        // handle backward compatibility
        if (
          !findRecordLeadingAnswer &&
          findHistoryLeadingAnswer &&
          findHistoryLeadingAnswer?.value?.length &&
          !isNumeric(ha.repeat_index)
        ) {
          repeat_identifier = findHistoryLeadingAnswer.value.indexOf(
            ha.repeat_index
          );
        }
        return {
          ...ha,
          repeat_identifier: String(repeat_identifier),
        };
      });
      return { ...h, answer: historyAnswer };
    });
  history = _.orderBy(history, "year", "desc");
  // EOL Remap answer and history to provide the repeat_identifier

  // generate history columns
  const allHistoryColumns = history.flatMap((h) => {
    return {
      title: h.year,
      className: "group-header data-history",
      children: [...generateHistoryColumns(h.year)],
    };
  });

  const currentAnswers = record.answer;
  const historyAnswers = history.flatMap((h) => h.answer);
  const mergedAnswers = [...currentAnswers, ...historyAnswers];
  const uniqueByQuestion = _.uniqBy(mergedAnswers, (item) =>
    JSON.stringify([item.question, item.repeat_index, item.repeat_identifier])
  );

  // transform answer to group by question group and repeat index
  const currAndHistoryAnswers = _.chain(
    _.orderBy(
      uniqueByQuestion, // before record.answer
      ["question_group_order", "question_order"],
      ["asc"]
    )
  )
    .groupBy("question_group")
    .mapValues((value) => _.chain(value).groupBy("repeat_index").value())
    .value();

  if (_.isEmpty(currAndHistoryAnswers)) {
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

  return Object.keys(currAndHistoryAnswers).map((key, ki) => {
    const title = ReactHtmlParser(key);
    const length = Object.values(currAndHistoryAnswers[key]).length;
    const values = _.orderBy(
      Object.values(currAndHistoryAnswers[key]),
      ["question_order"],
      ["asc"]
    ).map((v) => {
      // fetch into record answer instead of using the merger answers
      // because this answers Object created from record(current) + history answers
      const currentAnswers = v.map((curr) => {
        const findAnswer = record?.answer?.find(
          (x) =>
            x.question === curr.question &&
            x.repeat_identifier === curr.repeat_identifier
        );
        return {
          ...curr,
          [`value`]: findAnswer?.value || "",
          [`comment`]: findAnswer?.comment || "",
        };
      });
      return currentAnswers;
    });

    return values.map((v, vi) => {
      // find repeat identifier
      const findRepeatIdentifier = v.find((q) => q?.repeat_identifier);
      let titleSuffix = length > 1 ? ` - ${vi + 1}` : "";
      if (
        findRepeatIdentifier &&
        !isNumeric(findRepeatIdentifier?.repeat_identifier)
      ) {
        titleSuffix = findRepeatIdentifier?.value?.length
          ? ` - ${findRepeatIdentifier?.repeat_identifier}`
          : "";
      }
      if (!isNumeric(v?.[0]?.repeat_identifier)) {
        titleSuffix = ` - ${v[0].repeat_identifier}`;
      }

      // Map into the repeat group with repeat_identifier value
      let dataSource = [];
      if (history?.length) {
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
      } else {
        dataSource = [...v];
      }
      dataSource = mergeObjectsByQuestionName(dataSource);

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
