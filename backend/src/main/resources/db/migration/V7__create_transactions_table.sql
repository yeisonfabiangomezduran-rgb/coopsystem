CREATE TABLE transactions (

    id BIGSERIAL PRIMARY KEY,

    transaction_type VARCHAR(20) NOT NULL,

    amount NUMERIC(18,2) NOT NULL,

    previous_balance NUMERIC(18,2) NOT NULL,

    current_balance NUMERIC(18,2) NOT NULL,

    transaction_date TIMESTAMP NOT NULL,

    savings_account_id BIGINT NOT NULL,

    CONSTRAINT fk_transaction_account
        FOREIGN KEY (savings_account_id)
        REFERENCES savings_accounts(id)

);