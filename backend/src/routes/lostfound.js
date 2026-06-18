const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lostFoundController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

router.post('/lost', auth, ctrl.reportLost);
router.post('/found', auth, ctrl.reportFound);
router.get('/found/search', auth, ctrl.searchFound);
router.post('/found/:id/claim', auth, ctrl.claimItem);

router.get('/lost', auth, ctrl.listLost);
router.get('/found', auth, ctrl.listFound);
router.put('/lost/:id/status', auth, roles(['admin','maintenance']), ctrl.updateLostStatus);
router.put('/found/:id/status', auth, roles(['admin','maintenance']), ctrl.updateFoundStatus);
router.delete('/lost/:id', auth, roles(['admin']), ctrl.deleteLost);
router.delete('/found/:id', auth, roles(['admin']), ctrl.deleteFound);

module.exports = router;