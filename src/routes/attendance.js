const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.post('/mark', auth, roles(['teacher','admin']), ctrl.markAttendance);
router.get('/student/:studentId', auth, roles(['teacher','admin','parent','student']), ctrl.getAttendanceByStudent);
router.get('/report/monthly', auth, ctrl.monthlyReport);

module.exports = router;