const express = require('express');
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
router.use(authMiddleware);

function nextRequestId() {
  const y = new Date().getFullYear();
  const r = Math.floor(10000 + Math.random() * 90000);
  return `REQ-${y}-${r}`;
}

router.get('/', async (req, res) => {
  try {
    const { department_id, status } = req.query;
    let query = `
      SELECT r.id, r.template_id, r.request_id, r.title, r.department_id, r.status,
             r.created_by, r.assigned_to, r.review_sequence, r.priority, r.submission_comments,
             r.created_at, r.updated_at,
             t.file_name AS template_file_name, t.file_size AS template_file_size,
             d.name AS department_name,
             u.full_name AS assigned_to_name
      FROM requests r
      LEFT JOIN templates t ON r.template_id = t.id
      LEFT JOIN departments d ON r.department_id = d.id
      LEFT JOIN users u ON r.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];
    let n = 1;
    if (department_id) {
      query += ` AND r.department_id = $${n++}`;
      params.push(department_id);
    }
    if (status) {
      query += ` AND r.status = $${n++}`;
      params.push(status);
    }
    query += ` ORDER BY r.created_at DESC`;
    const client = await pool.connect();
    let result;
    try {
      result = await client.query(query, params);
    } finally {
      client.release();
    }
    const rows = result.rows.map((row) => ({
      id: row.id,
      templateId: row.template_id,
      requestId: row.request_id,
      title: row.title,
      departmentId: row.department_id,
      departmentName: row.department_name,
      status: row.status,
      createdBy: row.created_by,
      assignedTo: row.assigned_to,
      assignedToName: row.assigned_to_name || null,
      reviewSequence: row.review_sequence,
      priority: row.priority,
      submissionComments: row.submission_comments,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      templateFileName: row.template_file_name,
      fileSize: row.template_file_size != null ? String(row.template_file_size) : null,
    }));
    res.json(rows);
  } catch (err) {
    console.error('Requests list error:', err);
    res.status(500).json({ error: 'Failed to list requests' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query(
        `SELECT r.*, t.file_name AS template_file_name, t.file_size AS template_file_size,
                d.name AS department_name, u.full_name AS assigned_to_name
         FROM requests r
         LEFT JOIN templates t ON r.template_id = t.id
         LEFT JOIN departments d ON r.department_id = d.id
         LEFT JOIN users u ON r.assigned_to = u.id
         WHERE r.id = $1`,
        [req.params.id]
      );
      row = q.rows[0];
    } finally {
      client.release();
    }
    if (!row) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({
      id: row.id,
      templateId: row.template_id,
      requestId: row.request_id,
      title: row.title,
      departmentId: row.department_id,
      departmentName: row.department_name,
      status: row.status,
      createdBy: row.created_by,
      assignedTo: row.assigned_to,
      assignedToName: row.assigned_to_name || null,
      reviewSequence: row.review_sequence,
      priority: row.priority,
      submissionComments: row.submission_comments,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      templateFileName: row.template_file_name,
      fileSize: row.template_file_size != null ? String(row.template_file_size) : null,
    });
  } catch (err) {
    console.error('Request get error:', err);
    res.status(500).json({ error: 'Failed to get request' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { template_id, title, department_id } = req.body || {};
    if (!template_id) {
      return res.status(400).json({ error: 'template_id required' });
    }
    const request_id = nextRequestId();
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query(
        `INSERT INTO requests (template_id, request_id, title, department_id, status, created_by)
         VALUES ($1, $2, $3, $4, 'draft', $5)
         RETURNING *`,
        [template_id, request_id, title || null, department_id || null, req.user.id]
      );
      row = q.rows[0];
    } finally {
      client.release();
    }
    res.status(201).json({
      id: row.id,
      templateId: row.template_id,
      requestId: row.request_id,
      title: row.title,
      departmentId: row.department_id,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Request create error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const body = req.body || {};
    // Support both snake_case (API) and camelCase (some clients)
    const title = body.title;
    const status = body.status;
    const assigned_to = body.assigned_to ?? body.assignedTo;
    const review_sequence = body.review_sequence ?? body.reviewSequence;
    const priority = body.priority;
    const submission_comments = body.submission_comments ?? body.submissionComments;

    const updates = [];
    const values = [];
    let n = 1;
    if (title !== undefined) {
      updates.push(`title = $${n++}`);
      values.push(title);
    }
    if (status !== undefined) {
      updates.push(`status = $${n++}`);
      values.push(status);
    }
    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${n++}`);
      values.push(assigned_to);
    }
    if (review_sequence !== undefined) {
      updates.push(`review_sequence = $${n++}::jsonb`);
      // JSONB expects a JSON string; node-pg serializes JS arrays as PG arrays, so never pass raw array
      const reviewSeqJson =
        review_sequence == null
          ? null
          : typeof review_sequence === 'string'
            ? review_sequence
            : Array.isArray(review_sequence)
              ? JSON.stringify(review_sequence)
              : null;
      values.push(reviewSeqJson);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${n++}`);
      values.push(priority);
    }
    if (submission_comments !== undefined) {
      updates.push(`submission_comments = $${n++}`);
      values.push(submission_comments);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    updates.push(`updated_at = NOW()`);
    values.push(req.params.id);
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query(
        `UPDATE requests SET ${updates.join(', ')} WHERE id = $${n} RETURNING *`,
        values
      );
      row = q.rows[0];
    } catch (queryErr) {
      // If new columns don't exist (migration not run), retry with core fields only
      const msg = (queryErr && queryErr.message) ? String(queryErr.message) : '';
      if (msg.includes('column') && msg.includes('does not exist')) {
        const coreUpdates = [];
        const coreValues = [];
        let n2 = 1;
        if (title !== undefined) {
          coreUpdates.push(`title = $${n2++}`);
          coreValues.push(title);
        }
        if (status !== undefined) {
          coreUpdates.push(`status = $${n2++}`);
          coreValues.push(status);
        }
        if (assigned_to !== undefined) {
          coreUpdates.push(`assigned_to = $${n2++}`);
          coreValues.push(assigned_to);
        }
        if (coreUpdates.length === 0) {
          client.release();
          console.error('Request patch error:', queryErr);
          return res.status(500).json({
            error: 'Failed to update request',
            detail: 'Run database migrations: node src/db/runMigrations.js',
          });
        }
        coreUpdates.push(`updated_at = NOW()`);
        coreValues.push(req.params.id);
        const q2 = await client.query(
          `UPDATE requests SET ${coreUpdates.join(', ')} WHERE id = $${n2} RETURNING *`,
          coreValues
        );
        row = q2.rows[0];
      } else {
        throw queryErr;
      }
    } finally {
      client.release();
    }
    if (!row) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({
      id: row.id,
      requestId: row.request_id,
      title: row.title,
      status: row.status,
      assignedTo: row.assigned_to,
      reviewSequence: row.review_sequence ?? null,
      priority: row.priority ?? null,
      submissionComments: row.submission_comments ?? null,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Request patch error:', err);
    const detail = err.message || (err.code ? String(err.code) : '');
    res.status(500).json({
      error: 'Failed to update request',
      ...(detail && { detail }),
    });
  }
});

module.exports = router;
