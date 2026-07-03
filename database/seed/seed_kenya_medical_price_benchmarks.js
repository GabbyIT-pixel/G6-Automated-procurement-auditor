const { pool } = require('../../backend/src/config/database');

const seedBaselines = async () => {
    const query = `
        INSERT INTO market_baselines 
        (item_name, item_code, unit_of_measure, category, reference_price_kes, price_verified_date, tolerance_pct)
        VALUES 
        ('Surgical Masks', 'KEM-SM-01', 'Box of 50', 'Consumables', 500.00, '2026-06-01', 10.00),
        ('Examination Gloves', 'KEM-GL-02', 'Box of 100', 'Consumables', 850.00, '2026-06-01', 15.00),
        ('Paracetamol 500mg', 'KEM-RX-03', '1000 Tabs', 'Medication', 1500.00, '2026-06-01', 5.00),
        ('Digital Thermometer', 'KEM-EQ-04', 'Piece', 'Equipment', 450.00, '2026-06-01', 10.00),
        ('IV Fluids Normal Saline', 'KEM-IV-05', '500ml', 'Consumables', 120.00, '2026-06-01', 5.00)
        ON CONFLICT (item_code) DO NOTHING;
    `;

    try {
        await pool.query(query);
        console.log("Seeded Kenyan market_baselines successfully.");
    } catch (err) {
        console.error("Failed to seed baselines:", err.message);
    } finally {
        process.exit();
    }
};

seedBaselines();
