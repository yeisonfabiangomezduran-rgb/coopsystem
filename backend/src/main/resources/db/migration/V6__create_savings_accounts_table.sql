-- ==========================================
-- Tabla de cuentas de ahorro
-- ==========================================

CREATE TABLE savings_accounts (

    id BIGSERIAL PRIMARY KEY,

    account_number VARCHAR(20) NOT NULL UNIQUE,

    balance NUMERIC(18,2) NOT NULL DEFAULT 0.00,

    status VARCHAR(20) NOT NULL,

    opened_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    associate_id BIGINT NOT NULL,

    CONSTRAINT fk_savings_accounts_associate
        FOREIGN KEY (associate_id)
        REFERENCES associates(id)
        ON DELETE RESTRICT

);