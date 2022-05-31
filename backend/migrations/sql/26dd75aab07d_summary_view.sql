SELECT f.id AS fid,
         qg.id AS gid,
         q.id AS qid,
         qg.order AS go,
         q.order AS qo,
         qg.name AS question_group,
         qg.repeat AS repeat,
         q.name AS question,
         q.member_type,
         q.isco_type,
         d.id AS data_id,
         u.name AS submitter,
         u.email AS email,
         d.submitted,
         array_to_string(CASE
    WHEN a.text IS NOT NULL THEN
    array[a.text]
    WHEN a.options IS NOT NULL THEN
    a.options :: text[]
    WHEN a.value IS NOT NULL THEN
    array[a.value :: text]
    ELSE NULL end, '|',',') AS answer
FROM form f
RIGHT JOIN question_group qg
    ON qg.form = f.id RIGHT JOIN
    (SELECT qs.id,
         qs.form,
         qs.name,
         qs.order,
         qs.question_group,
         Array_agg(DISTINCT( Coalesce(qia.isco_type,
         qgia.isco_type))) AS isco_type,
         Array_agg(DISTINCT( Coalesce(qma.member_type,
         qgma.member_type) )) AS member_type
    FROM question qs
    LEFT JOIN question_isco_access qia
        ON qs.id = qia.question
    LEFT JOIN question_member_access qma
        ON qs.id = qma.question
    LEFT JOIN question_group_isco_access qgia
        ON qs.question_group = qgia.question_group
    LEFT JOIN question_group_member_access qgma
        ON qs.question_group = qgma.question_group
    GROUP BY  qs.id ) q
    ON q.form = f.id
RIGHT JOIN data d
    ON d.form = f.id
LEFT JOIN answer a
    ON a.data = d.id
        AND a.question = q.id
LEFT JOIN "user" u
    ON u.id = d.submitted_by
WHERE d.submitted is NOT NULL
ORDER BY  f.id, d.id, qg.order, q.order;
