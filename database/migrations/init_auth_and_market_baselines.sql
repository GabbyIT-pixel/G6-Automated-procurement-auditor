-- ================================================================
-- MIGRATION: init_auth_and_market_baselines.sql
-- Owner: Gabriel Mugisha (Team Lead)
-- Step 2 of 6 in the execution order
-- ================================================================

-- Safety: drop in reverse order if re-running
DROP TABLE IF EXISTS market_baselines CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLE 1: users
-- ================================================================
CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name       VARCHAR(120)  NOT NULL,
    email           VARCHAR(180)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,
    role            VARCHAR(20)   NOT NULL DEFAULT 'officer'
                    CHECK (role IN ('admin', 'auditor', 'officer')),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ================================================================
-- TABLE 2: market_baselines
-- Verified Kenyan reference prices from KEMSA
-- ================================================================
CREATE TABLE market_baselines (
    baseline_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_name            VARCHAR(250)  NOT NULL,
    item_code            VARCHAR(60)   UNIQUE,
    unit_of_measure      VARCHAR(80)   NOT NULL,
    category             VARCHAR(100)  NOT NULL,
    reference_price_kes  DECIMAL(12,2) NOT NULL
                         CHECK (reference_price_kes > 0),
    price_source         VARCHAR(200)  NOT NULL
                         DEFAULT 'KEMSA Published Price Catalogue',
    price_verified_date  DATE          NOT NULL,
    tolerance_pct        DECIMAL(5,2)  NOT NULL DEFAULT 10.00
                         CHECK (tolerance_pct >= 0 AND tolerance_pct <= 100),
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_baselines_item_name ON market_baselines(LOWER(item_name));
CREATE INDEX idx_baselines_category ON market_baselines(category);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_baselines_updated_at
    BEFORE UPDATE ON market_baselines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DO $$
BEGIN
    RAISE NOTICE 'Step 2 complete: users and market_baselines tables created.';
    RAISE NOTICE 'Philip can now run Step 3.';
END $$;
