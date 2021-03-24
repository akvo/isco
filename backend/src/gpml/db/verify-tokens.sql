-- :name all-tokens :? :*
-- :doc Get all tokens
select * from verify_tokens order by id


-- :name token-by-id :? :1
-- :doc Get token by id
select * from verify_tokens where id = :id


-- :name token-by-user :? :*
-- :doc Get token by user id
select * from verify_tokens where user_id = :id


-- :name new-token :!
-- :doc Insert new token
insert into verify_tokens (id, user_id)
values(:id, :user_id)
