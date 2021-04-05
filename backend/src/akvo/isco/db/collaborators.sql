-- :name all-collaborators :? :*
-- :doc Get all collaborators
select * from collaborators order by id


-- :name all-collaborators-by-webform :? :*
-- :doc Get all collaborators by webform
select collaborators.id, organizations.name as "organization_name", collaborators.organization_id  from collaborators
left join organizations ON organizations.id=collaborators.organization_id
where webform_id=:webform_id order by collaborators.id


-- :name new-collaborator :<! :1
-- :doc Insert new collaborator
insert into collaborators (webform_id, organization_id)
values(:webform_id, :organization_id)
RETURNING *;

-- :name delete-collaborator :! :n
-- :doc delete collaborator
delete from collaborators where webform_id=:webform_id and organization_id=:organization_id
