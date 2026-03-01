const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/pool');
const config = require('../config');

/**
 * Authenticate user by username and password. Returns { token, user } or throws.
 */
async function login(username, password) {
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
    const err = new Error('Invalid username or password');
    err.statusCode = 401;
    throw err;
  }
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      departmentId: user.department_id,
      fullName: user.full_name,
    },
  };
}

/**
 * Get user profile by user id (from JWT). Returns user object or null if not found.
 */
async function getMe(userId) {
  const client = await pool.connect();
  let user;
  try {
    const r = await client.query(
      `SELECT id, username, role, department_id, full_name FROM users WHERE id = $1`,
      [userId]
    );
    user = r.rows[0];
  } finally {
    client.release();
  }
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    departmentId: user.department_id,
    fullName: user.full_name,
  };
}

module.exports = { login, getMe };
