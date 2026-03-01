const requestService = require('../services/requestService');
const auditLogService = require('../services/auditLogService');
const requestWorkflowService = require('../services/requestWorkflowService');

async function list(req, res) {
  try {
    const {
      department_id,
      status,
      q,
      assigned_to,
      from_date,
      to_date,
      sortBy,
      sortOrder,
      page,
      pageSize,
    } = req.query;
    const result = await requestService.list({
      department_id,
      status,
      q,
      assigned_to,
      from_date,
      to_date,
      sortBy,
      sortOrder,
      page,
      pageSize,
    });
    res.json(result);
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
    if (result) {
      await auditLogService.insert({
        entity_type: 'request',
        entity_id: result.id,
        action: 'request_created',
        user_id: req.user.id,
        details: { requestId: result.requestId, title: result.title },
      });
    }
    res.status(201).json(result);
  } catch (err) {
    console.error('Request create error:', err);
    res.status(500).json({ error: 'Failed to create request' });
  }
}

async function update(req, res) {
  try {
    const previous = await requestService.getById(req.params.id);
    const result = await requestService.update(req.params.id, req.body || {});
    if (!result) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    if (req.body && req.body.status !== undefined && previous && previous.status !== req.body.status) {
      await auditLogService.insert({
        entity_type: 'request',
        entity_id: req.params.id,
        action: 'status_changed',
        user_id: req.user.id,
        details: { from: previous.status, to: req.body.status, requestId: result.requestId },
      });
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

async function getActivity(req, res) {
  try {
    const request = await requestService.getById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    const logs = await auditLogService.list({
      entity_type: 'request',
      entity_id: req.params.id,
      limit: req.query.limit || 100,
    });
    res.json(logs);
  } catch (err) {
    console.error('Request activity error:', err);
    res.status(500).json({ error: 'Failed to get request activity' });
  }
}

async function getWorkflow(req, res) {
  try {
    const request = await requestService.getById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const workflow = await requestWorkflowService.getByRequestId(req.params.id);
    res.json(workflow || { requestId: req.params.id, workflowId: null, steps: [] });
  } catch (err) {
    console.error('Request workflow get error:', err);
    res.status(500).json({ error: 'Failed to get request workflow' });
  }
}

async function workflowAction(req, res) {
  try {
    const request = await requestService.getById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const { action, workflow_id, ai_generated_definition } = req.body || {};
    if (action === 'init' || action === 'set_workflow') {
      const updated = await requestWorkflowService.createOrUpdateInstance(req.params.id, {
        workflow_id,
        ai_generated_definition,
      });
      return res.json(updated);
    }
    if (['approve', 'reject', 'request_revision'].includes(action)) {
      const updated = await requestWorkflowService.performAction(
        req.params.id,
        action,
        req.user?.id,
        req.body?.comment
      );
      return res.json(updated);
    }
    res.status(400).json({ error: 'Invalid action. Use init, set_workflow, approve, reject, or request_revision.' });
  } catch (err) {
    console.error('Request workflow action error:', err);
    res.status(500).json({ error: 'Failed to perform workflow action' });
  }
}

module.exports = { list, getById, create, update, getActivity, getWorkflow, workflowAction };
