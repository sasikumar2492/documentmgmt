const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const requestController = require('../controllers/requestController');

const router = express.Router();
router.use(authMiddleware);

router.get('/', requestController.list);
router.get('/:id', requestController.getById);
router.post('/', requestController.create);
router.patch('/:id', requestController.update);

module.exports = router;
