const express = require('express');
const { register, login, me, logout } = require('../controllers/authController');
const { ensureAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', ensureAuthenticated, me);
router.post('/logout', ensureAuthenticated, logout);

module.exports = router;
