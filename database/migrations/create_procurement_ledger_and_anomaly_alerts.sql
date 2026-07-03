DROP TABLE IF EXISTS fraud_alerts CASCADE;
DROP TABLE IF EXISTS procurement_contracts CASCADE;

CREATE TABLE procurement_contracts (
    contract_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    baseline_id UUID NOT NULL REFERENCES market_baselines(baseline_id),
    supplier_name VARCHAR(150) NOT NULL,
    contract_date DATE NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    awarded_unit_price DECIMAL(12,2) NOT NULL CHECK (awarded_unit_price > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE fraud_alerts (
    alert_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES procurement_contracts(contract_id) ON DELETE CASCADE,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    variance_pct DECIMAL(6,2) NOT NULL,
    flagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
