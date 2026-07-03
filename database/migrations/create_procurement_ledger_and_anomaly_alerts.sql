 --  Create the Procurement Contracts Ledger
CREATE TABLE procurement_contracts (
    contract_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    contract_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- This links the contract to the specific Auditor/Officer who uploaded it
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(user_id)
        ON DELETE RESTRICT
);
