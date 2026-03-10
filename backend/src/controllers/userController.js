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

async function getById(req, res) {
  try {
    const user = await userService.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('User get error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

module.exports = { list, getById };
