const express = require('express');
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (_req, res) => {
  try {
    const client = await pool.connect();
    let result;
    try {
      result = await client.query('SELECT id, name, code FROM departments ORDER BY name');
    } finally {
      client.release();
    }
    res.json(result.rows.map((r) => ({ id: r.id, name: r.name, code: r.code })));
  } catch (err) {
    console.error('Departments list error:', err);
    res.status(500).json({ error: 'Failed to list departments' });
  }
});

module.exports = router;
