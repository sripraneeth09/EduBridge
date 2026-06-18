const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const multer = require('multer');

// use memory storage so we can parse buffer directly
const upload = multer({ storage: multer.memoryStorage(), fileFilter: (req, file, cb) => {
  const allowed = ['.csv','.xlsx','.xls'];
  const fn = file.originalname.toLowerCase();
  if(allowed.some(ext => fn.endsWith(ext))) cb(null, true); else cb(new Error('Invalid file type'), false);
} });

router.post('/', auth, roles(['admin']), ctrl.createStudent);
router.get('/', auth, roles(['admin']), ctrl.listStudents);
router.get('/export', auth, roles(['admin']), ctrl.exportStudents);
router.get('/template', auth, roles(['admin']), ctrl.downloadTemplate);
router.post('/import', auth, roles(['admin']), upload.single('file'), ctrl.importStudents);
router.get('/:id', auth, roles(['admin']), ctrl.getStudent);
router.put('/:id', auth, roles(['admin']), ctrl.updateStudent);
router.delete('/:id', auth, roles(['admin']), ctrl.deleteStudent);

module.exports = router;
