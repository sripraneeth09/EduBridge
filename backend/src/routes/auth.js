const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/parent-login', controller.parentLogin);
router.get('/me', auth, controller.me);
router.post('/change-password', auth, controller.changePassword);

module.exports = router;