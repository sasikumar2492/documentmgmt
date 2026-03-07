/**
 * Updates existing users in the users table with policy-compliant passwords
 * (Password Length 8+ chars, Password Complexity: Alpha Numeric + Special Char).
 * Run from backend: node src/db/scripts/update_user_passwords.js
 */
const bcrypt = require('bcrypt');
const { pool } = require('../pool');

const ADMIN_PASSWORD = 'Admin@123';
const OTHER_PASSWORD = 'User@123';

async function updatePasswords() {
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const otherHash = await bcrypt.hash(OTHER_PASSWORD, 10);

  const client = await pool.connect();
  try {
    const adminResult = await client.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE username = 'admin' RETURNING id, username`,
      [adminHash]
    );
    const otherResult = await client.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE username != 'admin' RETURNING id, username`,
      [otherHash]
    );

    console.log('Updated passwords (policy: 8+ chars, alphanumeric + special char):');
    if (adminResult.rowCount > 0) {
      console.log('  admin / Admin@123');
    }
    otherResult.rows.forEach((r) => console.log(`  ${r.username} / User@123`));
    console.log(`Total: ${(adminResult.rowCount || 0) + (otherResult.rowCount || 0)} user(s) updated.`);
  } finally {
    client.release();
    await pool.end();
  }
}

updatePasswords().catch((err) => {
  console.error(err);
  process.exit(1);
});
