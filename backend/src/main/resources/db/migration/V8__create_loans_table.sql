CREATE TABLE loans (

    id BIGSERIAL PRIMARY KEY,

    loan_number VARCHAR(20) NOT NULL UNIQUE,

    associate_id BIGINT NOT NULL,

    amount NUMERIC(18,2) NOT NULL,

    interest_rate NUMERIC(5,2) NOT NULL,

    term_months INTEGER NOT NULL,

    status VARCHAR(20) NOT NULL,

    requested_at TIMESTAMP NOT NULL,

    approved_at TIMESTAMP,

    CONSTRAINT fk_loans_associate
        FOREIGN KEY (associate_id)
        REFERENCES associates(id)

);