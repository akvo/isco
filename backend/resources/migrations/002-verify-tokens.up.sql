 CREATE TABLE verify_tokens (
   id text PRIMARY KEY,
   user_id integer NOT NULL REFERENCES users,
   created timestamptz NOT NULL DEFAULT now()
 );
-- Sample data
INSERT INTO verify_tokens (id, user_id)
VALUES ('3aa6f8a2_0c52_4cdc_ae30_46753bb18194', 1),
       ('c1b66a61_a09f_4c59_878b_25d73b514718', 5);
