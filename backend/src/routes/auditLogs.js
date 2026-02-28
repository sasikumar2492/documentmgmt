const express = require('express');
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { entity_type, entity_id, user_id, limit = 100 } = req.query;
    let query = `
      SELECT id, entity_type, entity_id, action, user_id, details, ip_address, created_at
      FROM audit_logs
      WHERE 1=1
    `;
    const params = [];
    let n = 1;
    if (entity_type) {
      query += ` AND entity_type = $${n++}`;
      params.push(entity_type);
    }
    if (entity_id) {
      query += ` AND entity_id = $${n++}`;
      params.push(entity_id);
    }
    if (user_id) {
      query += ` AND user_id = $${n++}`;
      params.push(user_id);
    }
    query += ` ORDER BY created_at DESC LIMIT $${n}`;
    params.push(Math.min(parseInt(limit, 10) || 100, 500));
    const client = await pool.connect();
    let result;
    try {
      result = await client.query(query, params);
    } finally {
      client.release();
    }
    res.json(result.rows.map((r) => ({
      id: r.id,
      entityType: r.entity_type,
      entityId: r.entity_id,
      action: r.action,
      userId: r.user_id,
      details: r.details,
      ipAddress: r.ip_address,
      createdAt: r.created_at,
    })));
  } catch (err) {
    console.error('Audit logs error:', err);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

module.exports = router;
