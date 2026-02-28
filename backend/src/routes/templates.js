const express = require('express');
const path = require('path');
const Busboy = require('busboy');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const fileStorage = require('../services/fileStorage');

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    let file = null;
    let fileDone = Promise.resolve();
    const busboy = Busboy({ headers: req.headers });
    busboy.on('field', (name, value) => { fields[name] = value; });
    busboy.on('file', (name, stream, info) => {
      if (name !== 'file') { stream.resume(); return; }
      const chunks = [];
      fileDone = new Promise((res, rej) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => {
          file = { buffer: Buffer.concat(chunks), originalname: info.filename, mimetype: info.mimeType };
          res();
        });
        stream.on('error', rej);
      });
    });
    busboy.on('finish', () => fileDone.then(() => resolve({ file, fields })).catch(reject));
    busboy.on('error', reject);
    req.pipe(busboy);
  });
}

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { department_id, status } = req.query;
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
    let result;
    try {
      result = await client.query(query, params);
    } finally {
      client.release();
    }
    const rows = result.rows.map((r) => ({
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
    }));
    res.json(rows);
  } catch (err) {
    console.error('Templates list error:', err);
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

// Serve template file for preview (Original Doc / Syncfusion) – must be before GET /:id
router.get('/:id/file', async (req, res) => {
  try {
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query('SELECT file_path, file_name FROM templates WHERE id = $1', [req.params.id]);
      row = q.rows[0];
    } finally {
      client.release();
    }
    if (!row) {
      return res.status(404).json({ error: 'Template not found' });
    }
    const absolutePath = fileStorage.getAbsolutePath(row.file_path);
    if (!fileStorage.fileExists(row.file_path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    const ext = path.extname(row.file_name).toLowerCase();
    const mime = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.doc': 'application/msword',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xls': 'application/vnd.ms-excel',
    };
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${row.file_name}"`);
    res.sendFile(absolutePath);
  } catch (err) {
    console.error('Template file error:', err);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await pool.connect();
    let r;
    try {
      const q = await client.query(
        `SELECT t.id, t.file_name, t.file_path, t.file_size, t.department_id, t.status,
                t.parsed_sections, t.uploaded_by, t.created_at, t.updated_at,
                d.name AS department_name
         FROM templates t
         LEFT JOIN departments d ON t.department_id = d.id
         WHERE t.id = $1`,
        [req.params.id]
      );
      r = q.rows[0];
    } finally {
      client.release();
    }
    if (!r) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({
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
    });
  } catch (err) {
    console.error('Template get error:', err);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

router.post('/', async (req, res) => {
  try {
    console.log('[Templates] POST / upload received, Content-Type:', req.headers['content-type']);
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Expected multipart/form-data' });
    }
    const { file, fields } = await parseMultipart(req);
    if (!file || !file.buffer || !file.originalname) {
      console.log('[Templates] No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const department_id = fields.department_id || null;
    console.log('[Templates] File received:', file.originalname, file.buffer.length, 'bytes');
    const ext = path.extname(file.originalname) || '';
    const filename = `${uuidv4()}${ext}`;
    fileStorage.saveFile('templates', filename, file.buffer);
    const relativePath = path.join('templates', filename);
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query(
        `INSERT INTO templates (file_name, file_path, file_size, department_id, status, uploaded_by)
         VALUES ($1, $2, $3, $4, 'draft', $5)
         RETURNING id, file_name, file_path, file_size, department_id, status, created_at, updated_at`,
        [file.originalname, relativePath, file.buffer.length, department_id, req.user.id]
      );
      row = q.rows[0];
    } finally {
      client.release();
    }
    res.status(201).json({
      id: row.id,
      fileName: row.file_name,
      filePath: row.file_path,
      fileSize: String(row.file_size),
      department: row.department_id,
      status: row.status,
      uploadDate: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Template upload error:', err);
    res.status(500).json({ error: 'Failed to upload template' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { file_name, department_id, status, parsed_sections } = req.body || {};
    const updates = [];
    const values = [];
    let n = 1;
    if (file_name !== undefined) {
      updates.push(`file_name = $${n++}`);
      values.push(file_name);
    }
    if (department_id !== undefined) {
      updates.push(`department_id = $${n++}`);
      values.push(department_id);
    }
    if (status !== undefined) {
      updates.push(`status = $${n++}`);
      values.push(status);
    }
    if (parsed_sections !== undefined) {
      updates.push(`parsed_sections = $${n++}`);
      values.push(JSON.stringify(parsed_sections));
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
        `UPDATE templates SET ${updates.join(', ')} WHERE id = $${n} RETURNING *`,
        values
      );
      row = q.rows[0];
    } finally {
      client.release();
    }
    if (!row) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({
      id: row.id,
      fileName: row.file_name,
      filePath: row.file_path,
      fileSize: String(row.file_size),
      department: row.department_id,
      status: row.status,
      parsedSections: row.parsed_sections,
      uploadDate: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Template patch error:', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

module.exports = router;
