import { orderBy, chain, groupBy } from "lodash";
import { Excel } from "antd-table-saveas-excel";
import moment from "moment";

const DownloadAnswerAsExcel = ({
  question_group: questionGroup,
  answers,
  horizontal = true,
  filename = null,
}) => {
  let columns = [];
  if (horizontal) {
    columns = orderBy(questionGroup, "order").map((qg) => {
      const childrens = qg?.question
        ? orderBy(qg.question, "order").map((q) => {
            return {
              title: q.name,
              dataIndex: q.id,
              key: q.id,
            };
          })
        : [];
      return {
        title: qg.name,
        children: childrens,
      };
    });
  }
  if (!horizontal) {
    columns = [
      {
        title: "Question",
        dataIndex: "question",
        key: "question",
        render: (text, row) => {
          if (row?.isGroup) {
            return {
              children: text,
              props: {
                colSpan: 3,
              },
            };
          }
          return text;
        },
      },
      {
        title: "Repeat Index",
        dataIndex: "repeatIndex",
        key: "repeatIndex",
      },
      {
        title: "Answer",
        dataIndex: "answer",
        key: "answer",
      },
    ];
  }

  let questions = [];
  if (horizontal) {
    questions = questionGroup.flatMap((qg) => {
      const qs = qg.question.map((q) => ({
        ...q,
        repeatable: qg.repeatable || false,
      }));
      return qs;
    });
  }
  if (!horizontal) {
    orderBy(questionGroup, "order").forEach((qg) => {
      questions.push({
        id: qg.id,
        name: qg.name,
        isGroup: true,
      });
      orderBy(qg.question, "order").forEach((q) => {
        questions.push({ ...q, repeatable: qg.repeatable || false });
      });
    });
  }

  const metadata = [];
  const transformAnswers = Object.keys(answers).map((key) => {
    const q = questions.find((q) => q.id === parseInt(key));
    let val = answers?.[key];
    let qid = q.id;
    let repeatIndex = 0;
    if (q.repeatable) {
      const splitted = key.split("-");
      if (splitted.length === 2) {
        qid = parseInt(splitted[0]);
        repeatIndex = parseInt(splitted[1]);
      }
    }
    if (["input", "text"].includes(q.type)) {
      val = val ? val.trim() : val;
    }
    if (q.type === "geo") {
      if (val?.lat && val?.lng) {
        val = `${val.lat} | ${val.lng}`;
      } else {
        val = null;
      }
    }
    if (q.type === "date" && val) {
      val = val.format("DD/MM/YYYY");
    }
    if (
      ["option", "multiple_option", "cascade"].includes(q.type) &&
      Array.isArray(val)
    ) {
      val = val.join(" | ");
    }
    if (q.type === "tree" && Array.isArray(val)) {
      val = val.join(" - ");
    }
    if (q.type === "number") {
      val = Number(val);
    }
    if (q.type === "autofield") {
      val = val !== 0 ? val : "";
    }
    if (q?.meta) {
      metadata.push(val);
    }
    return {
      id: qid,
      repeatIndex: repeatIndex,
      value: val || "",
    };
  });

  let dataSource = [];
  if (horizontal) {
    dataSource = chain(groupBy(transformAnswers, "repeatIndex"))
      .map((value) =>
        value.reduce(
          (prev, curr) => ({
            ...prev,
            [curr.id]: curr.value,
          }),
          {}
        )
      )
      .value();
  }
  if (!horizontal) {
    dataSource = questions.flatMap((q) => {
      const answer = transformAnswers.filter((a) => a.id === q.id);
      const res = {
        question: q.name,
        isGroup: q?.isGroup || false,
      };
      if (answer.length) {
        return answer.map((a) => ({
          ...res,
          repeatIndex: a.repeatIndex,
          answer: a.value,
        }));
      }
      return res;
    });
  }

  let saveAsFilename = `data-${moment().format("DD-MM-YYYY")}`;
  if (!filename && metadata.length) {
    saveAsFilename = metadata.map((md) => String(md).trim()).join("-");
  }
  if (filename) {
    saveAsFilename = filename;
  }
  saveAsFilename = `${saveAsFilename}.xlsx`;

  const excel = new Excel();
  excel
    .addSheet("data")
    .addColumns(columns)
    .addDataSource(dataSource)
    .saveAs(saveAsFilename);
};

const extras = {
  DownloadAnswerAsExcel: DownloadAnswerAsExcel,
};

export default extras;
