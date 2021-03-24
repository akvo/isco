 CREATE TABLE users (
   id serial NOT NULL PRIMARY KEY,
   organization_id integer NOT NULL REFERENCES organizations,
   name text NULL,
   email text NULL,
   email_verified_at timestamptz NULL,
   role text NULL,
   questionnaires jsonb DEFAULT '[]'::json,
   created timestamptz NOT NULL DEFAULT now(),
   updated timestamptz NOT NULL DEFAULT now(),
   UNIQUE (email)
 );
-- Sample data
INSERT INTO users (organization_id, name, email, email_verified_at, role)
VALUES (1, 'Juan', 'juan@akvo.org', now(), 'admin'),
       (1, 'Daniel', 'daniel@akvo.org', now(), 'admin'),
       (1, 'Valeria', 'valeria@akvo.org', now(), 'admin'),
       (1, 'Emmanuel', 'emmanuel@akvo.org', now(), 'admin'),
       (2, 'Karl Popper', 'karl@popper.phi', null, 'submitter');
