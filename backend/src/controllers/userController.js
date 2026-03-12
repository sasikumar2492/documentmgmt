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

async function create(req, res) {
  try {
    const { username, password, full_name, email, role, department_id } = req.body || {};
    const user = await userService.create({
      username,
      password,
      full_name,
      email,
      role,
      department_id,
    });
    res.status(201).json(user);
  } catch (err) {
    if (err.statusCode === 400) {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error('User create error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

module.exports = { list, getById, create };
