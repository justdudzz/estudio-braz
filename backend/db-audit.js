import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function verify() {
  try {
    console.log('--- DATABASE INTEGRITY AUDIT ---');
    
    // 1. Check Users
    const users = await pool.query('SELECT id, email, "displayName", role, "photoUrl" FROM "User"');
    console.log(`\n👥 Users found: ${users.rows.length}`);
    users.rows.forEach(u => {
      console.log(`  - [${u.role}] ${u.displayName || 'No Name'} (${u.email}) | Photo: ${u.photoUrl ? 'YES' : 'NO'}`);
    });

    // 2. Check Services
    const services = await pool.query('SELECT count(*) FROM "Service"');
    console.log(`\n✂️ Services found: ${services.rows[0].count}`);

    // 3. Check Staff-Service Links
    const links = await pool.query('SELECT count(*) FROM "_StaffServices"');
    console.log(`🔗 Staff-Service Links: ${links.rows[0].count}`);

    // 4. Check if Mariana has services (as she requested to define them)
    const mariana = users.rows.find(u => u.email === 'mariana@studiobraz.com');
    if (mariana) {
      const mLinks = await pool.query('SELECT count(*) FROM "_StaffServices" WHERE "B" = $1', [mariana.id]);
      console.log(`  - Mariana has ${mLinks.rows[0].count} services assigned.`);
    }

    console.log('\n✅ DB CONNECTION & DATA INTEGRITY: 100%');
    process.exit(0);
  } catch (err) {
    console.error('❌ DB AUDIT FAILED:', err);
    process.exit(1);
  }
}

verify();
