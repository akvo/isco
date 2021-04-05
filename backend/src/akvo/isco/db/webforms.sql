-- :name all-webforms :? :*
-- :doc Get all webforms
select * from webforms order by id


-- :name all-not-submitted-webforms :? :*
-- :doc Get all not-submitted webforms
 select webforms.id as web_form_id, email as submitter, form_instance_url, organizations.name as "org_name",
 webforms.organization_id as "org_id", webforms.created as "date", webforms.form_id from webforms
 left join organizations ON organizations.id=webforms.organization_id
 left join users ON users.id=webforms.user_id
 where webforms.submitted='f'
 order by webforms.id


-- :name webform-by-id :? :1
-- :doc Get webform by id
select * from webforms where id = :id

-- :name new-webform :<! :1
-- :doc Insert new webform
insert into webforms (user_id, organization_id, form_id, form_instance_id, form_instance_url, display_name, uuid, submitted)
values(:user_id, :organization_id, :form_id, :form_instance_id, :form_instance_url, :display_name, :uuid, :submitted)
RETURNING *;
