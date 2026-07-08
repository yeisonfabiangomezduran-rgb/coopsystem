ALTER TABLE users
ADD COLUMN role_id BIGINT;

UPDATE users
SET role_id = (
    SELECT id
    FROM roles
    WHERE name = 'ROLE_ADMIN'
);

ALTER TABLE users
ALTER COLUMN role_id SET NOT NULL;

ALTER TABLE users
ADD CONSTRAINT fk_users_roles
FOREIGN KEY (role_id)
REFERENCES roles(id);