const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.markAttendance = async (req, res) => {
  try{
    const { studentId, date, status } = req.body;
    const att = await Attendance.findOneAndUpdate(
      { student: studentId, date },
      { status, markedBy: req.user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(att);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.getAttendanceByStudent = async (req, res) => {
  try{
    const val = req.params.studentId;
    let studentId;

    if (mongoose.Types.ObjectId.isValid(val)) {
      const studentDoc = await Student.findOne({ $or: [{ _id: val }, { user: val }] });
      if (studentDoc) {
        studentId = studentDoc._id;
      }
    }

    if (!studentId) {
      const studentDoc = await Student.findOne({ registrationNo: { $regex: `^${val}$`, $options: 'i' } });
      if (studentDoc) {
        studentId = studentDoc._id;
      } else {
        const userDoc = await User.findOne({ registrationNo: { $regex: `^${val}$`, $options: 'i' } });
        if (userDoc) {
          const sDoc = await Student.findOne({ user: userDoc._id });
          if (sDoc) studentId = sDoc._id;
        }
      }
    }

    if (!studentId) {
      return res.json([]);
    }

    const records = await Attendance.find({ student: studentId }).sort({ date: -1 });
    res.json(records);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.monthlyReport = async (req, res) => {
  try{
    const { month, year, studentId } = req.query;
    let searchStudentId = studentId;
    
    if (req.user.role === 'student') {
      const studentDoc = await Student.findOne({ user: req.user._id });
      if (!studentDoc) return res.status(404).json({ message: 'Student profile not found' });
      searchStudentId = studentDoc._id;
    } else if (req.user.role === 'parent') {
      if (!searchStudentId) return res.status(400).json({ message: 'studentId is required for parents' });
    }

    if (searchStudentId) {
      let resolvedId;
      if (mongoose.Types.ObjectId.isValid(searchStudentId)) {
        const studentDoc = await Student.findOne({ $or: [{ _id: searchStudentId }, { user: searchStudentId }] });
        if (studentDoc) resolvedId = studentDoc._id;
      }
      if (!resolvedId) {
        const studentDoc = await Student.findOne({ registrationNo: { $regex: `^${searchStudentId}$`, $options: 'i' } });
        if (studentDoc) {
          resolvedId = studentDoc._id;
        } else {
          const userDoc = await User.findOne({ registrationNo: { $regex: `^${searchStudentId}$`, $options: 'i' } });
          if (userDoc) {
            const sDoc = await Student.findOne({ user: userDoc._id });
            if (sDoc) resolvedId = sDoc._id;
          }
        }
      }
      searchStudentId = resolvedId || searchStudentId;
    }

    const start = new Date(year, month-1, 1);
    const end = new Date(year, month, 1);
    const query = { date: { $gte: start, $lt: end } };
    if (searchStudentId) {
      query.student = searchStudentId;
    }
    const records = await Attendance.find(query)
      .populate({ path: 'student', populate: { path: 'user', select: 'name registrationNo' } })
      .sort({ date: 1 });
    res.json(records);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.getClassAttendance = async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query; // Expecting YYYY-MM-DD
    if (!date) {
      return res.status(400).json({ message: 'Date query parameter is required.' });
    }

    const queryDate = new Date(date);
    // Get all students of this class
    const students = await Student.find({ class: classId }).select('_id');
    const studentIds = students.map(s => s._id);

    // Find attendance records for these students on this day
    const records = await Attendance.find({
      student: { $in: studentIds },
      date: queryDate
    });

    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};