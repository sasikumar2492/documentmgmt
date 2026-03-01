const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
