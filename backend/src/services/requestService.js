const { pool } = require('../db/pool');

function nextRequestId() {
  const y = new Date().getFullYear();
  const r = Math.floor(10000 + Math.random() * 90000);
  return `REQ-${y}-${r}`;
}

function mapRow(row) {
  return {
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
  };
}

async function list(filters = {}) {
  const { department_id, status } = filters;
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
  try {
    const result = await client.query(query, params);
    return result.rows.map(mapRow);
  } finally {
    client.release();
  }
}

async function getById(id) {
  const client = await pool.connect();
  try {
    const q = await client.query(
      `SELECT r.*, t.file_name AS template_file_name, t.file_size AS template_file_size,
              d.name AS department_name, u.full_name AS assigned_to_name
       FROM requests r
       LEFT JOIN templates t ON r.template_id = t.id
       LEFT JOIN departments d ON r.department_id = d.id
       LEFT JOIN users u ON r.assigned_to = u.id
       WHERE r.id = $1`,
      [id]
    );
    const row = q.rows[0];
    return row ? mapRow(row) : null;
  } finally {
    client.release();
  }
}

async function create(data) {
  const { template_id, title, department_id, created_by } = data;
  const request_id = nextRequestId();
  const client = await pool.connect();
  try {
    const q = await client.query(
      `INSERT INTO requests (template_id, request_id, title, department_id, status, created_by)
       VALUES ($1, $2, $3, $4, 'draft', $5)
       RETURNING *`,
      [template_id, request_id, title || null, department_id || null, created_by]
    );
    const row = q.rows[0];
    return {
      id: row.id,
      templateId: row.template_id,
      requestId: row.request_id,
      title: row.title,
      departmentId: row.department_id,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } finally {
    client.release();
  }
}

async function update(id, body) {
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
  if (updates.length === 0) return null;
  updates.push(`updated_at = NOW()`);
  values.push(id);

  const client = await pool.connect();
  try {
    let row;
    try {
      const q = await client.query(
        `UPDATE requests SET ${updates.join(', ')} WHERE id = $${n} RETURNING *`,
        values
      );
      row = q.rows[0];
    } catch (queryErr) {
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
          throw queryErr;
        }
        coreUpdates.push(`updated_at = NOW()`);
        coreValues.push(id);
        const q2 = await client.query(
          `UPDATE requests SET ${coreUpdates.join(', ')} WHERE id = $${n2} RETURNING *`,
          coreValues
        );
        row = q2.rows[0];
      } else {
        throw queryErr;
      }
    }
    if (!row) return null;
    return {
      id: row.id,
      requestId: row.request_id,
      title: row.title,
      status: row.status,
      assignedTo: row.assigned_to,
      reviewSequence: row.review_sequence ?? null,
      priority: row.priority ?? null,
      submissionComments: row.submission_comments ?? null,
      updatedAt: row.updated_at,
    };
  } finally {
    client.release();
  }
}

module.exports = { list, getById, create, update, nextRequestId };
