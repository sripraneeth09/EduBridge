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
    const identifier = email.trim();
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { registrationNo: { $regex: `^${identifier}$`, $options: 'i' } }
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
        registrationNo: user.registrationNo
      }
    });
  }catch(err){
    res.status(500).json({ message: err.message });
  }
};

exports.me = async (req, res) => {
  if(!req.user) return res.status(401).json({ message: 'Not authenticated' });
  res.json({ user: req.user });
};