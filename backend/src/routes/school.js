const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/schoolController');
const examCtrl = require('../controllers/examController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.get('/notices', ctrl.listNotices);
router.get('/notices/:id', ctrl.getNotice);
// Exams
router.get('/exams/class/:classId', examCtrl.listByClass);
router.get('/exams/upcoming', examCtrl.upcomingForStudent);
router.post('/notices', auth, roles(['admin','teacher']), ctrl.createNotice);
router.put('/notices/:id', auth, roles(['admin','teacher']), ctrl.updateNotice);
router.delete('/notices/:id', auth, roles(['admin']), ctrl.deleteNotice);

module.exports = router;