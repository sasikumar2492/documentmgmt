const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/pool');
const fileStorage = require('./fileStorage');

function mapRow(r) {
  return {
    id: r.id,
    fileName: r.file_name,
    filePath: r.file_path,
    fileSize: String(r.file_size || 0),
    department: r.department_id,
    departmentName: r.department_name,
    status: r.status,
    parsedSections: r.parsed_sections,
    uploadedBy: r.uploaded_by,
    uploadDate: r.created_at,
    updatedAt: r.updated_at,
  };
}

async function list(filters = {}) {
  const { department_id, status } = filters;
  let query = `
    SELECT t.id, t.file_name, t.file_path, t.file_size, t.department_id, t.status,
           t.parsed_sections, t.uploaded_by, t.created_at, t.updated_at,
           d.name AS department_name
    FROM templates t
    LEFT JOIN departments d ON t.department_id = d.id
    WHERE 1=1
  `;
  const params = [];
  let n = 1;
  if (department_id) {
    query += ` AND t.department_id = $${n++}`;
    params.push(department_id);
  }
  if (status) {
    query += ` AND t.status = $${n++}`;
    params.push(status);
  }
  query += ` ORDER BY t.created_at DESC`;
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
      `SELECT t.id, t.file_name, t.file_path, t.file_size, t.department_id, t.status,
              t.parsed_sections, t.uploaded_by, t.created_at, t.updated_at,
              d.name AS department_name
       FROM templates t
       LEFT JOIN departments d ON t.department_id = d.id
       WHERE t.id = $1`,
      [id]
    );
    const r = q.rows[0];
    return r ? mapRow(r) : null;
  } finally {
    client.release();
  }
}

async function getFileInfo(id) {
  const client = await pool.connect();
  try {
    const q = await client.query('SELECT file_path, file_name FROM templates WHERE id = $1', [id]);
    return q.rows[0] || null;
  } finally {
    client.release();
  }
}

/**
 * Upload a new template. file = { buffer, originalname, mimetype }, fields = { department_id? }, userId from JWT.
 * Returns created template record (no parsedSections in response for upload).
 */
async function upload(file, fields, userId) {
  const department_id = fields.department_id || null;
  const ext = path.extname(file.originalname) || '';
  const filename = `${uuidv4()}${ext}`;
  fileStorage.saveFile('templates', filename, file.buffer);
  const relativePath = path.join('templates', filename);
  const client = await pool.connect();
  try {
    const q = await client.query(
      `INSERT INTO templates (file_name, file_path, file_size, department_id, status, uploaded_by)
       VALUES ($1, $2, $3, $4, 'draft', $5)
       RETURNING id, file_name, file_path, file_size, department_id, status, created_at, updated_at`,
      [file.originalname, relativePath, file.buffer.length, department_id, userId]
    );
    const row = q.rows[0];
    return {
      id: row.id,
      fileName: row.file_name,
      filePath: row.file_path,
      fileSize: String(row.file_size),
      department: row.department_id,
      status: row.status,
      uploadDate: row.created_at,
      updatedAt: row.updated_at,
    };
  } finally {
    client.release();
  }
}

async function update(id, updates) {
  const { file_name, department_id, status, parsed_sections } = updates;
  const updateList = [];
  const values = [];
  let n = 1;
  if (file_name !== undefined) {
    updateList.push(`file_name = $${n++}`);
    values.push(file_name);
  }
  if (department_id !== undefined) {
    updateList.push(`department_id = $${n++}`);
    values.push(department_id);
  }
  if (status !== undefined) {
    updateList.push(`status = $${n++}`);
    values.push(status);
  }
  if (parsed_sections !== undefined) {
    updateList.push(`parsed_sections = $${n++}`);
    values.push(JSON.stringify(parsed_sections));
  }
  if (updateList.length === 0) return null;
  updateList.push(`updated_at = NOW()`);
  values.push(id);
  const client = await pool.connect();
  try {
    const q = await client.query(
      `UPDATE templates SET ${updateList.join(', ')} WHERE id = $${n} RETURNING *`,
      values
    );
    const row = q.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      fileName: row.file_name,
      filePath: row.file_path,
      fileSize: String(row.file_size),
      department: row.department_id,
      status: row.status,
      parsedSections: row.parsed_sections,
      uploadDate: row.created_at,
      updatedAt: row.updated_at,
    };
  } finally {
    client.release();
  }
}

module.exports = { list, getById, getFileInfo, upload, update, mapRow };
