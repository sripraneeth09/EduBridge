const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  res.status(403).json({ message: 'Self-registration is disabled. Admin must create student and parent accounts.' });
};

exports.login = async (req, res) => {
  try{
    const { email, password } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Email or registration number is required' });
    }
    const identifier = email.toString().trim();
    // Try exact email or registration number, both case-insensitive when possible.
    const regexIdentifier = { $regex: `^${identifier.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, $options: 'i' };
    const user = await User.findOne({
      $or: [
        { email: regexIdentifier },
        { registrationNo: regexIdentifier }
      ]
    });
    if(!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registrationNo: user.registrationNo,
        mustChangePassword: !!user.mustChangePassword
      }
    });
  }catch(err){
    res.status(500).json({ message: err.message });
  }
};

// Allow authenticated user to change their password (requires old password)
exports.changePassword = async (req, res) => {
  try{
    const userId = req.user && req.user._id;
    if(!userId) return res.status(401).json({ message: 'Not authenticated' });
    const { oldPassword, newPassword } = req.body;
    if(!oldPassword || !newPassword) return res.status(400).json({ message: 'oldPassword and newPassword are required' });
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(oldPassword, user.password);
    if(!ok) return res.status(400).json({ message: 'Invalid old password' });
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.mustChangePassword = false;
    await user.save();
    res.json({ message: 'Password changed' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.me = async (req, res) => {
  if(!req.user) return res.status(401).json({ message: 'Not authenticated' });
  res.json({ user: req.user });
};

// Parent login using parent's mobile (parentPhone) and child's DOB as password
exports.parentLogin = async (req, res) => {
  try{
    const { mobile, password } = req.body;
    if(!mobile || !password) return res.status(400).json({ message: 'mobile and password are required' });
    const Student = require('../models/Student');
    const student = await Student.findOne({ parentPhone: { $regex: `^${mobile.toString().trim()}$`, $options: 'i' } });
    if(!student) return res.status(400).json({ message: 'Invalid credentials' });

    // Normalize DOB to compare. Expecting parent to enter DOB as DD/MM/YYYY (common format).
    const parseDob = (s) => {
      if(!s) return null;
      const parts = s.toString().trim().split(/[^0-9]+/).filter(Boolean);
      if(parts.length !== 3) return null;
      // assume DD/MM/YYYY
      const [d, m, y] = parts.map(p => parseInt(p,10));
      if(!d || !m || !y) return null;
      return new Date(y, m-1, d);
    }

    const provided = parseDob(password);
    const dob = student.dateOfBirth ? new Date(student.dateOfBirth) : null;
    if(!dob || !provided || dob.setHours(0,0,0,0) !== provided.setHours(0,0,0,0)){
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ role: 'parent', studentId: student._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: {
        role: 'parent',
        name: student.parentName || student.name || 'Parent',
        studentId: student._id,
        studentName: student.name,
        registrationNo: student.registrationNo,
        parentName: student.parentName,
        parentPhone: student.parentPhone
      }
    });
  }catch(err){ res.status(500).json({ message: err.message }); }
};