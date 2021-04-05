ALTER TABLE collaborators DROP CONSTRAINT one_collaboration;
DROP TABLE IF EXISTS collaborators CASCADE;
