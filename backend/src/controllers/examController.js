const Exam = require('../models/Exam');
const Student = require('../models/Student');

exports.listByClass = async (req, res) => {
  try{
    const { classId } = req.params;
    const exams = await Exam.find({ classId }).sort({ date: 1 });
    res.json(exams);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.upcomingForStudent = async (req, res) => {
  try{
    let studentId = req.user && req.user.role === 'parent' ? req.user.studentId : req.query.studentId;
    if(!studentId) return res.status(400).json({ message: 'studentId required' });
    const student = await Student.findById(studentId).select('class');
    if(!student) return res.status(404).json({ message: 'Student not found' });
    const now = new Date();
    const exams = await Exam.find({ classId: student.class, date: { $gte: now } }).sort({ date: 1 }).limit(50);
    res.json(exams);
  }catch(err){ res.status(500).json({ message: err.message }); }
};
