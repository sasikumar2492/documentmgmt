const requestService = require('../services/requestService');

async function list(req, res) {
  try {
    const { department_id, status } = req.query;
    const rows = await requestService.list({ department_id, status });
    res.json(rows);
  } catch (err) {
    console.error('Requests list error:', err);
    res.status(500).json({ error: 'Failed to list requests' });
  }
}

async function getById(req, res) {
  try {
    const request = await requestService.getById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (err) {
    console.error('Request get error:', err);
    res.status(500).json({ error: 'Failed to get request' });
  }
}

async function create(req, res) {
  try {
    const { template_id, title, department_id } = req.body || {};
    if (!template_id) {
      return res.status(400).json({ error: 'template_id required' });
    }
    const result = await requestService.create({
      template_id,
      title,
      department_id,
      created_by: req.user.id,
    });
    res.status(201).json(result);
  } catch (err) {
    console.error('Request create error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
}

async function update(req, res) {
  try {
    const result = await requestService.update(req.params.id, req.body || {});
    if (!result) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    res.json(result);
  } catch (err) {
    console.error('Request patch error:', err);
    const detail = err.message || (err.code ? String(err.code) : '');
    res.status(500).json({
      error: 'Failed to update request',
      ...(detail && { detail }),
    });
  }
}

module.exports = { list, getById, create, update };
