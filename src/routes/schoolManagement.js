const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/schoolManagementController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const adminOnly = [auth, roles(['admin'])];

// CLASS ROUTES
router.post('/classes', ...adminOnly, ctrl.createClass);
router.get('/classes', auth, ctrl.listClasses);
router.put('/classes/:id', ...adminOnly, ctrl.updateClass);
router.delete('/classes/:id', ...adminOnly, ctrl.deleteClass);

// STUDENT ROUTES
router.post('/students', ...adminOnly, ctrl.createStudent);
router.get('/students', auth, ctrl.listStudents);
router.put('/students/:id', ...adminOnly, ctrl.updateStudent);
router.delete('/students/:id', ...adminOnly, ctrl.deleteStudent);

// TEACHER ROUTES
router.post('/teachers', ...adminOnly, ctrl.createTeacher);
router.get('/teachers', auth, ctrl.listTeachers);
router.put('/teachers/:id', ...adminOnly, ctrl.updateTeacher);
router.delete('/teachers/:id', ...adminOnly, ctrl.deleteTeacher);

module.exports = router;
