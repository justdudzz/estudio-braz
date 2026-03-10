import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});
async function test() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ DATABASE CONNECTED! Current time:', res.rows[0].now);
        process.exit(0);
    }
    catch (err) {
        console.error('❌ DATABASE CONNECTION FAILED:', err);
        process.exit(1);
    }
}
test();
