CREATE TABLE treasury (

    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,

    balance NUMERIC(18,2) NOT NULL,

    created_at TIMESTAMP NOT NULL

);

INSERT INTO treasury (
    name,
    balance,
    created_at
)
VALUES (
    'Caja General',
    0,
    CURRENT_TIMESTAMP
);