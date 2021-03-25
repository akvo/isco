-- :name all-users :? :*
-- :doc Get all users
select * from users order by id


-- :name user-by-id :? :1
-- :doc Get user by id
select * from users where id = :id

-- :name user-by-email :? :1
-- :doc Get user by id
select * from users where email = :email

-- :name validate-user :! :1
-- :doc validate user by email
UPDATE users set email_verified_at=now() where email = :email

-- :name patch-user :! :1
-- :doc patch user by id
UPDATE users set name=:name, role=:role, questionnaires=:questionnaires, organization_id=:organization_id, updated=now()
where id = :id;

-- :name new-user :<! :1
-- :doc Insert new user
insert into users (email, organization_id, name, role)
values(:email, :organization_id, :name, 'submitter')
RETURNING *;
