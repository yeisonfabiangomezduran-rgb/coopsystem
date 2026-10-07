CREATE TABLE savings_fund_monthly (
    id BIGSERIAL PRIMARY KEY,

    year INTEGER NOT NULL,
    month INTEGER NOT NULL,

    total_savings_deposits NUMERIC(19, 2) NOT NULL DEFAULT 0,

    loan_percentage NUMERIC(5, 2) NOT NULL,
    returns_percentage NUMERIC(5, 2) NOT NULL,

    loan_fund_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,
    returns_reserve_amount NUMERIC(19, 2) NOT NULL DEFAULT 0,

    loan_disbursements NUMERIC(19, 2) NOT NULL DEFAULT 0,
    loan_fund_available NUMERIC(19, 2) NOT NULL DEFAULT 0,

    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    closed_at TIMESTAMP NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_savings_fund_month
        UNIQUE (year, month),

    CONSTRAINT chk_savings_fund_month
        CHECK (month BETWEEN 1 AND 12),

    CONSTRAINT chk_savings_fund_percentages
        CHECK (
            loan_percentage >= 0
            AND returns_percentage >= 0
            AND loan_percentage + returns_percentage = 100
        ),

    CONSTRAINT chk_savings_fund_status
        CHECK (status IN ('OPEN', 'CLOSED'))
);