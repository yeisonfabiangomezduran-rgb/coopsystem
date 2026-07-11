ALTER TABLE savings_accounts
ADD CONSTRAINT uk_savings_account_associate
UNIQUE (associate_id);