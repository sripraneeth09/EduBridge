const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mealController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.post('/menu', auth, roles(['admin','teacher']), ctrl.createMenu);
router.post('/count', auth, roles(['admin','teacher']), ctrl.updateCount);
router.post('/rate', auth, roles(['student','parent','teacher','admin']), ctrl.rateMeal);
router.get('/', auth, ctrl.listMeals);

router.get('/stock', auth, ctrl.listStock);
router.post('/stock', auth, roles(['admin','teacher']), ctrl.createStock);
router.put('/stock/:id', auth, roles(['admin','teacher']), ctrl.updateStock);
router.delete('/stock/:id', auth, roles(['admin']), ctrl.deleteStock);

module.exports = router;