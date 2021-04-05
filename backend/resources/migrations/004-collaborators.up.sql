 CREATE TABLE collaborators (
   id serial NOT NULL PRIMARY KEY,
   webform_id integer NOT NULL REFERENCES webforms,
   organization_id integer NOT NULL REFERENCES organizations,
   created timestamptz NOT NULL DEFAULT now(),
   updated timestamptz NOT NULL DEFAULT now(),
   CONSTRAINT one_collaboration UNIQUE (webform_id, organization_id)
 );
