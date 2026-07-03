CREATE TABLE procurement_contracts (
    contract_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id),
    supplier_name VARCHAR(150) NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    contract_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fraud_alerts (
    alert_id SERIAL PRIMARY KEY,
    contract_id INT NOT NULL REFERENCES procurement_contracts(contract_id) ON DELETE CASCADE,
    risk_level VARCHAR(20) NOT NULL,
    variance_pct DECIMAL(5,2) NOT NULL,
    alert_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
