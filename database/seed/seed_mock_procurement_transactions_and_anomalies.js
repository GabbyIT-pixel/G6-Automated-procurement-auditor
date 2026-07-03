
const { pool } = require('../../backend/src/config/database');

const seedTransactions = async () => {
    try {
        // Grab a test user ID
        let userRes = await pool.query(`SELECT user_id FROM users LIMIT 1`);
        if (userRes.rowCount === 0) {
            userRes = await pool.query(`
                INSERT INTO users (full_name, email, password_hash, role)
                VALUES ('System Auditor', 'audit@kenyahealth.go.ke', 'hashed123', 'auditor')
                RETURNING user_id
            `);
        }
        const userId = userRes.rows[0].user_id;

        // Fetch the dynamic UUIDs for the benchmark items we need
        const masksRes = await pool.query(`SELECT baseline_id FROM market_baselines WHERE item_code = 'KEM-SM-01'`);
        const thermoRes = await pool.query(`SELECT baseline_id FROM market_baselines WHERE item_code = 'KEM-EQ-04'`);
        
        const masksId = masksRes.rows[0].baseline_id;
        const thermoId = thermoRes.rows[0].baseline_id;

        // Insert a NORMAL contract (Near the 500 KES baseline)
        await pool.query(`
            INSERT INTO procurement_contracts 
            (user_id, baseline_id, supplier_name, contract_date, quantity, awarded_unit_price)
            VALUES ($1, $2, 'Afya Supplies Ltd', '2026-07-01', 500, 520.00)
        `, [userId, masksId]);

       
        // We use RETURNING to grab its new ID so we can attach the alert to it
        const fraudRes = await pool.query(`
            INSERT INTO procurement_contracts 
            (user_id, baseline_id, supplier_name, contract_date, quantity, awarded_unit_price)
            VALUES ($1, $2, 'Ghost Medical Corp', '2026-07-02', 200, 4500.00)
            RETURNING contract_id
        `, [userId, thermoId]);

        const badContractId = fraudRes.rows[0].contract_id;

        // Insert the Fraud Alert for the bad contract
        await pool.query(`
            INSERT INTO fraud_alerts 
            (contract_id, risk_level, variance_pct)
            VALUES ($1, 'Critical', 900.00)
        `, [badContractId]);

        console.log("Success: Mock transactions and anomalies seeded.");
    } catch (err) {
        console.error("DB Seed Error:", err.message);
    } finally {
        process.exit();
    }
};

seedTransactions();
