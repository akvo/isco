-- :name all-users :? :*
-- :doc Get all users
select * from users order by id


-- :name user-by-id :? :1
-- :doc Get user by id
select * from users where id = :id

-- :name new-user :!
-- :doc Insert new user
insert into users (email, organization_id, name, role)
values(:email, :organization_id, :name, 'submitter')
