const authService = require('../services/authService');

async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const result = await authService.login(username, password);
    res.json(result);
  } catch (err) {
    if (err.statusCode === 401) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

async function getMe(req, res) {
  try {
    const user = await authService.getMe(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

module.exports = { login, getMe };
