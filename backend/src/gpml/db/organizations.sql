-- :name all-orgs :? :*
-- :doc Get all orgs
select * from organizations order by id


-- :name org-by-id :? :1
-- :doc Get org by id
select * from organizations where id = :id
