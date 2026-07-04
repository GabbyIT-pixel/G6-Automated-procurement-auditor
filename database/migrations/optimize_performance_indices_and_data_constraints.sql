-- Step 6: Performance Indexes, Constraints & Audit View
-- Gabriel Mugisha — runs last after all tables and seeds are loaded

-- ── Indexes: procurement_contracts ──────────────────────────
-- speeds up dashboard queries and filters
CREATE INDEX IF NOT EXISTS idx_contracts_created_at
    ON procurement_contracts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contracts_supplier
    ON procurement_contracts(supplier_name);

CREATE INDEX IF NOT EXISTS idx_contracts_contract_date
    ON procurement_contracts(contract_date);

CREATE INDEX IF NOT EXISTS idx_contracts_baseline
    ON procurement_contracts(baseline_id);

-- ── Indexes: fraud_alerts ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alerts_risk_level
    ON fraud_alerts(risk_level);

CREATE INDEX IF NOT EXISTS idx_alerts_flagged_at
    ON fraud_alerts(flagged_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_contract_id
    ON fraud_alerts(contract_id);

-- ── Indexes: market_baselines ────────────────────────────────
-- lets auditors search items by name quickly
CREATE INDEX IF NOT EXISTS idx_baselines_item_name_fts
    ON market_baselines
    USING GIN (to_tsvector('english', item_name));

-- ── Constraints: users ───────────────────────────────────────
-- reject bad email formats and blank names
ALTER TABLE users
    ADD CONSTRAINT chk_users_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users
    ADD CONSTRAINT chk_users_full_name_not_blank
    CHECK (TRIM(full_name) <> '');

-- ── Constraints: market_baselines ───────────────────────────
ALTER TABLE market_baselines
    ADD CONSTRAINT chk_baselines_item_not_blank
    CHECK (TRIM(item_name) <> '');

ALTER TABLE market_baselines
    ADD CONSTRAINT chk_baselines_verified_date_not_future
    CHECK (price_verified_date <= CURRENT_DATE);

-- ── Audit View ───────────────────────────────────────────────
-- joins all 4 tables into one flat view for the dashboard
-- and PDF report export
CREATE OR REPLACE VIEW v_full_audit_report AS
SELECT
    fa.alert_id,
    fa.risk_level,
    fa.variance_pct,
    fa.flagged_at,
    pc.contract_id,
    pc.supplier_name,
    pc.contract_date,
    pc.quantity,
    pc.awarded_unit_price,
    mb.item_name,
    mb.reference_price_kes,
    mb.unit_of_measure,
    mb.price_source,
    ROUND(
        (pc.awarded_unit_price - mb.reference_price_kes)
        * pc.quantity, 2
    ) AS estimated_overpayment_kes,
    u.full_name AS submitted_by,
    u.email     AS submitted_by_email
FROM fraud_alerts fa
JOIN procurement_contracts pc ON fa.contract_id = pc.contract_id
JOIN market_baselines      mb ON pc.baseline_id = mb.baseline_id
JOIN users                  u ON pc.user_id     = u.user_id
ORDER BY fa.flagged_at DESC;

DO $$
BEGIN
    RAISE NOTICE 'Step 6 done — indexes, constraints and audit view ready.';
END $$;
