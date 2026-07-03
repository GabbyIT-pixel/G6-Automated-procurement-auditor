const pool = require('../../backend/src/config/database');

const seedBenchmarks = async () => {
    // Standard market averages in KES (Kenyan Shillings)
    const query = `
        INSERT INTO benchmark_prices (item_name, category, baseline_price)
        VALUES 
            ('Surgical Masks (Box of 50)', 'Consumables', 500.00),
            ('Latex Examination Gloves (Box of 100)', 'Consumables', 850.00),
            ('Paracetamol 500mg (1000 tabs)', 'Medication', 1500.00),
            ('Digital Thermometer', 'Equipment', 450.00),
            ('IV Fluids - Normal Saline 500ml', 'Consumables', 120.00),
            ('Maternity Delivery Kit', 'Kits', 2500.00),
            ('Amoxicillin 250mg (1000 caps)', 'Medication', 2200.00)
    `;

    try {
        await pool.query(query);
        console.log("Success: Kenya benchmark prices loaded.");
    } catch (err) {
        console.error("DB Seed Error:", err);
    } else {
        process.exit();
    }
};

seedBenchmarks();
