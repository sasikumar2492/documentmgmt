const path = require('path');
const fileStorage = require('../services/fileStorage');
const documentService = require('../services/documentService');

async function list(req, res) {
  try {
    const { request_id, status, department_id } = req.query;
    const rows = await documentService.list({ request_id, status, department_id });
    res.json(rows);
  } catch (err) {
    console.error('Documents list error:', err);
    res.status(500).json({ error: 'Failed to list documents' });
  }
}

async function getById(req, res) {
  try {
    const doc = await documentService.getById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(doc);
  } catch (err) {
    console.error('Document get error:', err);
    res.status(500).json({ error: 'Failed to get document' });
  }
}

async function getFile(req, res) {
  try {
    const fileInfo = await documentService.getFileInfo(req.params.id);
    if (!fileInfo) {
      return res.status(404).json({ error: 'Document not found' });
    }
    if (!fileStorage.fileExists(fileInfo.file_path)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }
    const absolutePath = fileStorage.getAbsolutePath(fileInfo.file_path);
    const ext = path.extname(fileInfo.file_name).toLowerCase();
    const mime = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${fileInfo.file_name}"`);
    res.sendFile(absolutePath);
  } catch (err) {
    console.error('Document file error:', err);
    res.status(500).json({ error: 'Failed to serve file' });
  }
}

async function upload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const { request_id } = req.body || {};
    const result = await documentService.create(req.file, request_id, req.user.id);
    res.status(201).json(result);
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Document upload error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
}

async function update(req, res) {
  try {
    const { status } = req.body || {};
    if (status === undefined) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    const result = await documentService.updateStatus(req.params.id, status);
    if (!result) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(result);
  } catch (err) {
    console.error('Document patch error:', err);
    res.status(500).json({ error: 'Failed to update document' });
  }
}

module.exports = { list, getById, getFile, upload, update };
