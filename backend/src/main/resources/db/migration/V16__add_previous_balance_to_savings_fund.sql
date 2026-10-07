ALTER TABLE savings_fund_monthly
ADD COLUMN previous_month_balance NUMERIC(19, 2) NOT NULL DEFAULT 0;