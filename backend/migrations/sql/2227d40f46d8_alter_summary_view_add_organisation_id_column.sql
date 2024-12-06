SELECT
  row_number() over (
    order by
      d.id,
      qg.order,
      a.repeat_index,
      q.order
  ) AS id,
  f.id AS fid,
  qg.id AS gid,
  q.id AS qid,
  qg."order" AS go,
  q."order" AS qo,
  a.repeat_index,
  qg.name AS question_group,
  qg.repeat,
  q.name AS question,
  q.member_type,
  q.isco_type,
  d.id AS data_id,
  d.submitted,
  org.id AS organisation_id,
  org.name AS organisation,
  org.members,
  array_to_string(
    CASE
        WHEN a.text IS NOT NULL THEN ARRAY[a.text]
        WHEN a.options IS NOT NULL THEN a.options :: text[]
        WHEN a.value IS NOT NULL THEN ARRAY[a.value :: text]
        ELSE NULL :: text[]
    END, '|'
  ) AS answer,
  a.comment
FROM
  question_group qg
  LEFT JOIN form f ON qg.form = f.id
  LEFT JOIN (
    SELECT
      qs.id,
      qs.form,
      qs.name,
      qs."order",
      qs.question_group,
      array_agg(
        DISTINCT COALESCE(qia.isco_type, qgia.isco_type)
      ) AS isco_type,
      array_agg(
        DISTINCT COALESCE(
          qma.member_type, qgma.member_type
        )
      ) AS member_type
    FROM
      question qs
      LEFT JOIN question_isco_access qia ON qs.id = qia.question
      LEFT JOIN question_member_access qma ON qs.id = qma.question
      LEFT JOIN question_group_isco_access qgia ON qs.question_group = qgia.question_group
      LEFT JOIN question_group_member_access qgma ON qs.question_group = qgma.question_group
    GROUP BY
      qs.id
  ) q ON q.question_group = qg.id
  LEFT JOIN data d ON d.form = f.id
  LEFT JOIN (
    SELECT
      o.id,
      o.name,
      array_to_string(
        array_agg(mt.name),
        ', '
      ) as members
    FROM
      organisation o
      LEFT JOIN organisation_member om ON om.organisation = o.id
      LEFT JOIN member_type mt ON mt.id = om.member_type
    GROUP BY
      o.id
  ) org ON d.organisation = org.id
  LEFT JOIN answer a ON a.data = d.id
  AND a.question = q.id
WHERE
  d.submitted IS NOT NULL
ORDER BY
  f.id,
  d.id,
  qg.order,
  a.repeat_index,
  q.order;
