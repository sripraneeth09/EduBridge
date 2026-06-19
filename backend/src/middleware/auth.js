const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

module.exports = async function (req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try{
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Support regular users (admin/teacher/student) and parent tokens
    if (payload && payload.role === 'parent' && payload.studentId) {
      const student = await Student.findById(payload.studentId).select('-__v');
      if(!student) return res.status(401).json({ message: 'Invalid token' });
      // Attach a minimal user-like object for parent
      req.user = {
        role: 'parent',
        studentId: student._id,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        studentName: student.name,
        registrationNo: student.registrationNo,
        student
      };
    } else {
      const user = await User.findById(payload.id).select('-password');
      if(!user) return res.status(401).json({ message: 'Invalid token' });
      req.user = user;
    }
    next();
  }catch(err){
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};