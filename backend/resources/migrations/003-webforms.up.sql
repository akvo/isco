 CREATE TABLE webforms (
   id serial NOT NULL PRIMARY KEY,
   user_id integer NOT NULL REFERENCES users,
   organization_id integer NOT NULL REFERENCES organizations,
   form_id integer NOT NULL,
   form_instance_id text NOT NULL,
   form_instance_url text NOT NULL,
   display_name text NULL,
   uuid text NULL,
   submitted boolean NOT NULL DEFAULT false,
   created timestamptz NOT NULL DEFAULT now(),
   updated timestamptz NOT NULL DEFAULT now(),
   CONSTRAINT one_submission UNIQUE (user_id, organization_id, form_id)
 );
