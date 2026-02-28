const express = require('express');
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

/**
 * GET /api/users
 * List users for reviewer/assignee selection (e.g. Submit for Approval modal).
 * Returns id, username, fullName, role, departmentId, departmentName (no password).
 */
router.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    let result;
    try {
      result = await client.query(
        `SELECT u.id, u.username, u.full_name, u.role, u.department_id,
                d.name AS department_name
         FROM users u
         LEFT JOIN departments d ON u.department_id = d.id
         ORDER BY d.name NULLS LAST, u.full_name, u.username`
      );
    } finally {
      client.release();
    }
    res.json(
      result.rows.map((r) => ({
        id: r.id,
        username: r.username,
        fullName: r.full_name,
        role: r.role,
        departmentId: r.department_id,
        departmentName: r.department_name,
      }))
    );
  } catch (err) {
    console.error('Users list error:', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

module.exports = router;
