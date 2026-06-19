const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const ctrl = require('../controllers/mealController');
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

router.post('/menu', auth, roles(['admin','teacher']), ctrl.createMenu);
router.post('/count', auth, roles(['admin','teacher']), ctrl.updateCount);
router.post('/rate', auth, roles(['student','parent','teacher','admin']), upload.array('photos', 5), ctrl.rateMeal);
router.delete('/rate/:mealId', auth, roles(['student','parent','teacher','admin']), ctrl.deleteRating);
router.get('/', auth, ctrl.listMeals);

module.exports = router;