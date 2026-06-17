const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/complaintController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.post('/', auth, ctrl.createComplaint);
router.get('/', auth, ctrl.listComplaints);
router.put('/:id/status', auth, roles(['admin','teacher']), ctrl.updateStatus);
router.post('/:id/comment', auth, roles(['admin','teacher']), ctrl.addComment);

module.exports = router;