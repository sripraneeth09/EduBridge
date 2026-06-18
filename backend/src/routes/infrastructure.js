const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/infrastructureController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.post('/', auth, ctrl.reportIssue);
router.get('/', auth, roles(['admin','teacher','maintenance','student','parent']), ctrl.listIssues);
router.put('/:id', auth, roles(['admin','maintenance']), ctrl.updateIssue);

module.exports = router;