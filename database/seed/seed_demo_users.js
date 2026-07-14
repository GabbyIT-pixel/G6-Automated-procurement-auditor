const path = require('path');
// Load bcryptjs from backend node_modules
const bcrypt = require(path.resolve(__dirname, '../../backend/node_modules/bcryptjs'));
const { pool } = require('../../backend/src/config/database');

const SALT_ROUNDS = 10;

const seedDemoUsers = async () => {
    try {
        // Demo users with real bcrypt-hashed passwords
        const demoUsers = [
            {
                full_name: 'Jane Auditor',
                email: 'jane.auditor@health.go.ke',
                password: 'password123',
                role: 'auditor',
            },
            {
                full_name: 'John Officer',
                email: 'john.officer@health.go.ke',
                password: 'password123',
                role: 'officer',
            },
            {
                full_name: 'Admin User',
                email: 'admin@health.go.ke',
                password: 'password123',
                role: 'admin',
            },
        ];

        for (const user of demoUsers) {
            // Hash the password
            const password_hash = await bcrypt.hash(user.password, SALT_ROUNDS);

            // Insert or update the user
            await pool.query(
                `INSERT INTO users (full_name, email, password_hash, role)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (email) DO UPDATE SET password_hash = $3
                 RETURNING user_id, email, role`,
                [user.full_name, user.email, password_hash, user.role]
            );

            console.log(`✓ Seeded user: ${user.email} (${user.role})`);
        }

        console.log('\n✓ Demo users seeded successfully');
    } catch (err) {
        console.error('❌ Seed Error:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
        process.exit(0);
    }
};

seedDemoUsers();
