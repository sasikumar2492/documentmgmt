const { pool } = require('../db/pool');

/**
 * List users for reviewer/assignee selection. Returns id, username, fullName, role, departmentId, departmentName.
 */
async function list() {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT u.id, u.username, u.full_name, u.role, u.department_id,
              d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       ORDER BY d.name NULLS LAST, u.full_name, u.username`
    );
    return result.rows.map((r) => ({
      id: r.id,
      username: r.username,
      fullName: r.full_name,
      role: r.role,
      departmentId: r.department_id,
      departmentName: r.department_name,
    }));
  } finally {
    client.release();
  }
}

module.exports = { list };
