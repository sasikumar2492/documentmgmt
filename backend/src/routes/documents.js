const express = require('express');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db/pool');
const { authMiddleware } = require('../middleware/auth');
const { documentsUpload } = require('../middleware/upload');
const fileStorage = require('../services/fileStorage');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { request_id, status } = req.query;
    let query = `
      SELECT doc.id, doc.request_id, doc.file_name, doc.file_path, doc.file_type, doc.version, doc.status,
             doc.created_by, doc.created_at, doc.updated_at
      FROM documents doc
      WHERE 1=1
    `;
    const params = [];
    let n = 1;
    if (request_id) {
      query += ` AND doc.request_id = $${n++}`;
      params.push(request_id);
    }
    if (status) {
      query += ` AND doc.status = $${n++}`;
      params.push(status);
    }
    query += ` ORDER BY doc.created_at DESC`;
    const client = await pool.connect();
    let result;
    try {
      result = await client.query(query, params);
    } finally {
      client.release();
    }
    res.json(result.rows.map((r) => ({
      id: r.id,
      requestId: r.request_id,
      fileName: r.file_name,
      filePath: r.file_path,
      fileType: r.file_type,
      version: r.version,
      status: r.status,
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })));
  } catch (err) {
    console.error('Documents list error:', err);
    res.status(500).json({ error: 'Failed to list documents' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
      row = q.rows[0];
    } finally {
      client.release();
    }
    if (!row) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({
      id: row.id,
      requestId: row.request_id,
      fileName: row.file_name,
      filePath: row.file_path,
      fileType: row.file_type,
      version: row.version,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Document get error:', err);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

router.get('/:id/file', async (req, res) => {
  try {
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query('SELECT file_path, file_name, file_type FROM documents WHERE id = $1', [req.params.id]);
      row = q.rows[0];
    } finally {
      client.release();
    }
    if (!row) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const absolutePath = fileStorage.getAbsolutePath(row.file_path);
    if (!fileStorage.fileExists(row.file_path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    const ext = path.extname(row.file_name).toLowerCase();
    const mime = { '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${row.file_name}"`);
    res.sendFile(absolutePath);
  } catch (err) {
    console.error('Document file error:', err);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

router.post('/', documentsUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { request_id } = req.body || {};
    const ext = path.extname(req.file.originalname).toLowerCase().slice(1);
    if (!['pdf', 'docx', 'xlsx'].includes(ext)) {
      return res.status(400).json({ error: 'Allowed types: pdf, docx, xlsx' });
    }
    const relativePath = path.relative(fileStorage.basePath, req.file.path);
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query(
        `INSERT INTO documents (request_id, file_name, file_path, file_type, version, status, created_by)
         VALUES ($1, $2, $3, $4, 1, 'draft', $5)
         RETURNING *`,
        [request_id || null, req.file.originalname, relativePath, ext, req.user.id]
      );
      row = q.rows[0];
    } finally {
      client.release();
    }
    res.status(201).json({
      id: row.id,
      requestId: row.request_id,
      fileName: row.file_name,
      filePath: row.file_path,
      fileType: row.file_type,
      version: row.version,
      status: row.status,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body || {};
    if (status === undefined) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const client = await pool.connect();
    let row;
    try {
      const q = await client.query(
        'UPDATE documents SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, req.params.id]
      );
      row = q.rows[0];
    } finally {
      client.release();
    }
    if (!row) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({
      id: row.id,
      status: row.status,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Document patch error:', err);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

module.exports = router;
