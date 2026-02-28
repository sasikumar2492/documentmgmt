const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');
const config = require('../config');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const client = await pool.connect();
    let user;
    try {
      const r = await client.query(
        `SELECT id, username, password_hash, role, department_id, full_name
         FROM users WHERE username = $1`,
        [username]
      );
      user = r.rows[0];
    } finally {
      client.release();
    }
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        departmentId: user.department_id,
        fullName: user.full_name,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const client = await pool.connect();
    let user;
    try {
      const r = await client.query(
        `SELECT id, username, role, department_id, full_name FROM users WHERE id = $1`,
        [req.user.id]
      );
      user = r.rows[0];
    } finally {
      client.release();
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      departmentId: user.department_id,
      fullName: user.full_name,
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
