const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.get('/summary', auth, roles(['admin']), ctrl.summary);

module.exports = router;
