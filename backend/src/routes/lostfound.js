const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const ctrl = require('../controllers/lostFoundController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG and WEBP images are allowed'));
    }
  }
});

router.post('/lost', auth, upload.single('image'), ctrl.reportLost);
router.post('/found', auth, upload.single('image'), ctrl.reportFound);
router.get('/found/search', auth, ctrl.searchFound);
router.post('/found/:id/claim', auth, ctrl.claimItem);

router.get('/lost', auth, ctrl.listLost);
router.get('/found', auth, ctrl.listFound);
router.put('/lost/:id/status', auth, roles(['admin','maintenance']), ctrl.updateLostStatus);
router.put('/found/:id/status', auth, roles(['admin','maintenance']), ctrl.updateFoundStatus);
router.delete('/lost/:id', auth, roles(['admin']), ctrl.deleteLost);
router.delete('/found/:id', auth, roles(['admin']), ctrl.deleteFound);

module.exports = router;