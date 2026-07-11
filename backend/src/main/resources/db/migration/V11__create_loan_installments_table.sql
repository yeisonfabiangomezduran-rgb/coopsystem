CREATE TABLE loan_installments (

    id BIGSERIAL PRIMARY KEY,

    loan_id BIGINT NOT NULL,

    installment_number INTEGER NOT NULL,

    due_date DATE NOT NULL,

    principal NUMERIC(18,2) NOT NULL,

    interest NUMERIC(18,2) NOT NULL,

    total_payment NUMERIC(18,2) NOT NULL,

    remaining_balance NUMERIC(18,2) NOT NULL,

    status VARCHAR(20) NOT NULL,

    paid_at TIMESTAMP,

    CONSTRAINT fk_loan_installment_loan
        FOREIGN KEY (loan_id)
        REFERENCES loans(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_loan_installment_loan
    ON loan_installments(loan_id);

CREATE INDEX idx_loan_installment_status
    ON loan_installments(status);

CREATE UNIQUE INDEX uk_loan_installment_number
    ON loan_installments(loan_id, installment_number);