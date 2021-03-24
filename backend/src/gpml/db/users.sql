-- :name all-users :? :*
-- :doc Get all users
select * from users order by id


-- :name user-by-id :? :1
-- :doc Get user by id
select * from users where id = :id

-- :name user-by-email :? :1
-- :doc Get user by id
select * from users where email = :email


-- :name new-user :<! :1
-- :doc Insert new user
insert into users (email, organization_id, name, role)
values(:email, :organization_id, :name, 'submitter')
RETURNING *;
