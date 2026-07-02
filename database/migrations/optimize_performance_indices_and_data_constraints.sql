-- ================================================================
-- MIGRATION: optimize_performance_indices_and_data_constraints.sql
-- Owner: Gabriel Mugisha (Team Lead)
-- Step 6 of 6 — runs LAST after Philip finishes Steps 3, 4, 5
-- ================================================================

-- ================================================================
-- SECTION 1: PERFORMANCE INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_contracts_created_at
    ON procurement_contracts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contracts_item_name
    ON procurement_contracts(LOWER(item_name));

CREATE INDEX IF NOT EXISTS idx_contracts_county
    ON procurement_contracts(county_name);

CREATE INDEX IF NOT EXISTS idx_contracts_supplier
    ON procurement_contracts(supplier_name);

CREATE INDEX IF NOT EXISTS idx_contracts_contract_date
    ON procurement_contracts(contract_date);

CREATE INDEX IF NOT EXISTS idx_alerts_risk_and_status
    ON anomaly_alerts(risk_level, review_status);

CREATE INDEX IF NOT EXISTS idx_alerts_flagged_at
    ON anomaly_alerts(flagged_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_contract_id
    ON anomaly_alerts(contract_id);

CREATE INDEX IF NOT EXISTS idx_baselines_item_name_fts
    ON market_baselines
    USING GIN (to_tsvector('english', item_name));

-- ================================================================
-- SECTION 2: DATA INTEGRITY CONSTRAINTS
-- ================================================================

ALTER TABLE users
    ADD CONSTRAINT chk_users_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

ALTER TABLE users
    ADD CONSTRAINT chk_users_full_name_not_blank
    CHECK (TRIM(full_name) <> '');

ALTER TABLE market_baselines
    ADD CONSTRAINT chk_baselines_item_not_blank
    CHECK (TRIM(item_name) <> '');

ALTER TABLE market_baselines
    ADD CONSTRAINT chk_baselines_verified_date_not_future
    CHECK (price_verified_date <= CURRENT_DATE);

ALTER TABLE procurement_contracts
    ADD CONSTRAINT chk_contracts_price_positive
    CHECK (contracted_price_kes > 0);

ALTER TABLE procurement_contracts
    ADD CONSTRAINT chk_contracts_quantity_positive
    CHECK (quantity >= 1);

ALTER TABLE procurement_contracts
    ADD CONSTRAINT chk_contracts_date_not_future
    CHECK (contract_date <= CURRENT_DATE);

ALTER TABLE procurement_contracts
    ADD CONSTRAINT chk_contracts_item_not_blank
    CHECK (TRIM(item_name) <> '');

ALTER TABLE procurement_contracts
    ADD CONSTRAINT chk_contracts_supplier_not_blank
    CHECK (TRIM(supplier_name) <> '');

ALTER TABLE anomaly_alerts
    ADD CONSTRAINT chk_alerts_deviation_not_null
    CHECK (deviation_pct IS NOT NULL);

-- ================================================================
-- SECTION 3: FULL AUDIT REPORT VIEW
-- ================================================================

CREATE OR REPLACE VIEW v_full_audit_report AS
SELECT
    aa.alert_id,
    aa.risk_level,
    aa.deviation_pct,
    aa.review_status,
    aa.flagged_at,
    pc.contract_id,
    pc.item_name,
    pc.contracted_price_kes,
    pc.quantity,
    pc.supplier_name,
    pc.county_name,
    pc.facility_name,
    pc.contract_date,
    mb.reference_price_kes,
    mb.unit_of_measure,
    mb.price_source,
    mb.tolerance_pct,
    ROUND(
        (pc.contracted_price_kes - mb.reference_price_kes)
        * pc.quantity, 2
    ) AS estimated_overpayment_kes,
    u.full_name  AS submitted_by,
    u.email      AS submitted_by_email
FROM anomaly_alerts aa
JOIN procurement_contracts pc ON aa.contract_id  = pc.contract_id
JOIN market_baselines      mb ON aa.baseline_id  = mb.baseline_id
JOIN users                  u ON pc.submitted_by = u.user_id
ORDER BY aa.flagged_at DESC;

DO $$
BEGIN
    RAISE NOTICE 'Step 6 complete: indexes, constraints and audit view created.';
    RAISE NOTICE 'Database is fully optimized and ready for the presentation demo.';
END $$;
