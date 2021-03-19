 CREATE TABLE organizations (
   id serial NOT NULL PRIMARY KEY,
   parent_id integer NULL REFERENCES organizations,
   name text NULL,
   code text NULL,
   level integer NOT NULL DEFAULT 0,
   active boolean NOT NULL DEFAULT true,
   created timestamptz NOT NULL DEFAULT now(),
   updated timestamptz NOT NULL DEFAULT now()
 );
-- Sample data
INSERT INTO organizations (parent_id, name, code, active)
VALUES (NULL, 'org 1', 'code1', true),
       (1, 'org 2', 'code2', true),
       (1, 'org 3', 'code3', true);
