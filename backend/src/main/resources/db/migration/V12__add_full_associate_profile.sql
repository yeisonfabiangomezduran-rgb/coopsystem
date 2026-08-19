ALTER TABLE associates
    ADD COLUMN code VARCHAR(20),
    ADD COLUMN document_type VARCHAR(20),
    ADD COLUMN document_number VARCHAR(50),
    ADD COLUMN birth_date DATE,
    ADD COLUMN gender VARCHAR(30),
    ADD COLUMN cellphone VARCHAR(30),
    ADD COLUMN phone VARCHAR(30),
    ADD COLUMN address VARCHAR(255),
    ADD COLUMN city VARCHAR(100),
    ADD COLUMN department VARCHAR(100),
    ADD COLUMN entry_date DATE,
    ADD COLUMN type VARCHAR(50),
    ADD COLUMN status VARCHAR(30),
    ADD COLUMN observations TEXT;

ALTER TABLE associates
    ADD CONSTRAINT uq_associates_code UNIQUE (code),
    ADD CONSTRAINT uq_associates_document_number UNIQUE (document_number);
