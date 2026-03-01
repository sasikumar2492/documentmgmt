const userService = require('../services/userService');

async function list(req, res) {
  try {
    const rows = await userService.list();
    res.json(rows);
  } catch (err) {
    console.error('Users list error:', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
}

module.exports = { list };
