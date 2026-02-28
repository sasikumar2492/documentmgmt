const express = require('express');
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/:id/form-data', async (req, res) => {
  try {
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query(
        'SELECT data, form_sections_snapshot, updated_at FROM form_data WHERE request_id = $1',
        [req.params.id]
      );
      row = q.rows[0];
    } finally {
      client.release();
    }
    if (!row) {
      return res.json({ data: {}, formSectionsSnapshot: null, updatedAt: null });
    }
    res.json({
      data: row.data || {},
      formSectionsSnapshot: row.form_sections_snapshot,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Form data get error:', err);
    res.status(500).json({ error: 'Failed to get form data' });
  }
});

router.put('/:id/form-data', async (req, res) => {
  try {
    const { data, formSectionsSnapshot } = req.body || {};
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query(
        `INSERT INTO form_data (request_id, data, form_sections_snapshot)
         VALUES ($1, $2, $3)
         ON CONFLICT (request_id) DO UPDATE SET
           data = EXCLUDED.data,
           form_sections_snapshot = EXCLUDED.form_sections_snapshot,
           updated_at = NOW()
         RETURNING data, form_sections_snapshot, updated_at`,
        [req.params.id, JSON.stringify(data || {}), JSON.stringify(formSectionsSnapshot || null)]
      );
      row = q.rows[0];
    } finally {
      client.release();
    }
    res.json({
      data: row.data || {},
      formSectionsSnapshot: row.form_sections_snapshot,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Form data put error:', err);
    res.status(500).json({ error: 'Failed to save form data' });
  }
});

module.exports = router;
