const dashboardService = require('../services/dashboardService');

async function summary(req, res) {
  try {
    const { limit, days, department_id, assigned_to } = req.query;
    const filters = {
      limit: limit || 10,
      days: days != null ? parseInt(days, 10) : undefined,
      department_id: department_id || undefined,
      assigned_to: assigned_to || undefined,
    };
    if (req.user && req.user.id && !filters.assigned_to) {
      // Optionally scope to current user when no filter (e.g. "my" requests)
      // filters.assigned_to = req.user.id;
    }
    const data = await dashboardService.getSummary(filters);
    res.json(data);
  } catch (err) {
    console.error('Dashboard summary error:', err);
    res.status(500).json({ error: 'Failed to load dashboard summary' });
  }
}

module.exports = { summary };
