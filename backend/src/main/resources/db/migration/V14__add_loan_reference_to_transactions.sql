ALTER TABLE transactions
    ALTER COLUMN savings_account_id DROP NOT NULL;

ALTER TABLE transactions
    ADD COLUMN loan_id BIGINT;

ALTER TABLE transactions
    ADD CONSTRAINT fk_transactions_loan
    FOREIGN KEY (loan_id)
    REFERENCES loans(id);