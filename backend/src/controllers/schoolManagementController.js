const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const bcrypt = require('bcryptjs');

const normalizeDobString = (value) => {
  if (value === undefined || value === null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const day = `${value.getDate()}`.padStart(2, '0');
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const year = value.getFullYear();
    return `${day}${month}${year}`;
  }
  const raw = value.toString().trim();
  if (!raw || !/^[0-9]+$/.test(raw)) return null;
  const normalized = raw.padStart(8, '0');
  if (!/^\d{8}$/.test(normalized)) return null;
  const day = parseInt(normalized.slice(0, 2), 10);
  const month = parseInt(normalized.slice(2, 4), 10);
  const year = parseInt(normalized.slice(4), 10);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return normalized;
};

// === CLASS MANAGEMENT ===
exports.createClass = async (req, res) => {
  try{
    const { name, grade, section, classTeacher, description } = req.body;
    const cls = await Class.create({ name, grade, section, classTeacher, description });
    res.status(201).json(cls);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listClasses = async (req, res) => {
  try{
    const classes = await Class.find().populate('classTeacher', 'name email');
    res.json(classes);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateClass = async (req, res) => {
  try{
    const cls = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cls);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.deleteClass = async (req, res) => {
  try{
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

// === STUDENT MANAGEMENT ===
exports.createStudent = async (req, res) => {
  try{
    const { name, email, rollNo, class: classId, dateOfBirth, parentName, parentPhone, parentEmail, admissionNo } = req.body;
    if(!name || !rollNo || !classId || !dateOfBirth) {
      return res.status(400).json({ message: 'Name, class, roll number and date of birth are required.' });
    }

    const dobString = normalizeDobString(dateOfBirth);
    if(!dobString) {
      return res.status(400).json({ message: 'Invalid dateOfBirth format. Expected 8 digits DDMMYYYY.' });
    }

    const normalizedEmail = email ? email.toString().trim().toLowerCase() : undefined;
    const classDoc = await Class.findById(classId);
    const classLabel = classDoc ? `${classDoc.name}` : 'STU';
    const registrationNo = admissionNo ? admissionNo : `${classLabel}-${rollNo}`.replace(/\s+/g, '').toUpperCase();
    const password = dobString;
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      registrationNo,
      password: hashedPassword,
      role: 'student'
    };
    if(normalizedEmail) userData.email = normalizedEmail;

    const user = await User.create(userData);

    const student = await Student.create({
      user: user._id,
      rollNo,
      class: classId,
      dateOfBirth,
      registrationNo,
      parentName,
      parentPhone,
      parentEmail,
      admissionNo,
      admissionDate: new Date()
    });

    res.status(201).json({ student, credentials: { registrationNo, password } });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listStudents = async (req, res) => {
  try{
    const { classId, userId, studentId } = req.query;
    const query = {};

    if (classId) {
      const classDoc = await Class.findById(classId).select('name section');
      const classQuery = [{ class: classId }];
      if (classDoc) {
        const classNames = [classDoc.name];
        if (classDoc.section) {
          classNames.push(`${classDoc.name}${classDoc.section}`);
          classNames.push(`${classDoc.name} ${classDoc.section}`);
        }
        classQuery.push({ className: { $in: classNames } });
        if (classDoc.section) {
          classQuery.push({ section: classDoc.section });
        }
      }
      query.$or = classQuery;
    }

    if (studentId) {
      query._id = studentId;
    } else if (userId) {
      query.user = userId;
    }

    const students = await Student.find(query)
      .populate('user', 'name email registrationNo')
      .populate('class', 'name grade section');
    res.json(students);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateStudent = async (req, res) => {
  try{
    const data = req.body;
    if (data.dateOfBirth !== undefined) {
      const dobString = normalizeDobString(data.dateOfBirth);
      if (!dobString) {
        return res.status(400).json({ message: 'Invalid dateOfBirth format. Expected 8 digits DDMMYYYY.' });
      }
      data.dateOfBirth = dobString;
    }

    const student = await Student.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate('user', 'name email')
      .populate('class', 'name');
    res.json(student);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.deleteStudent = async (req, res) => {
  try{
    const student = await Student.findById(req.params.id);
    if(student) await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

// === TEACHER MANAGEMENT ===
exports.createTeacher = async (req, res) => {
  try{
    const { name, email, subject, classes, contactNumber, qualification, designation } = req.body;
    
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'teacher'
    });
    
    const teacher = await Teacher.create({
      user: user._id,
      subject,
      classes,
      contactNumber,
      qualification,
      designation
    });
    
    res.status(201).json({ teacher, credentials: { email, password } });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listTeachers = async (req, res) => {
  try{
    const teachers = await Teacher.find()
      .populate('user', 'name email')
      .populate('classes', 'name grade section');
    res.json(teachers);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateTeacher = async (req, res) => {
  try{
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user', 'name email')
      .populate('classes', 'name');
    res.json(teacher);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.deleteTeacher = async (req, res) => {
  try{
    const teacher = await Teacher.findById(req.params.id);
    if(teacher) await User.findByIdAndDelete(teacher.user);
    await Teacher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};
