const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.get('/', auth, roles(['admin']), ctrl.listUsers);
router.get('/:id', auth, roles(['admin']), ctrl.getUser);
router.put('/:id', auth, roles(['admin']), ctrl.updateUser);
router.delete('/:id', auth, roles(['admin']), ctrl.deleteUser);

module.exports = router;
