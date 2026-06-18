const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');

exports.listUsers = async (req, res) => {
  try{
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.getUser = async (req, res) => {
  try{
    const user = await User.findById(req.params.id).select('-password');
    if(!user) return res.status(404).json({ message: 'Not found' });
    res.json(user);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateUser = async (req, res) => {
  try{
    const updates = req.body;
    delete updates.password; // password change not supported here
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    res.json(user);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try{
    const user = await User.findByIdAndDelete(req.params.id);
    if(user && user.role === 'student'){
      await Student.findOneAndDelete({ user: user._id });
    }
    res.json({ message: 'Deleted' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

// Admin resets a user's password and returns a temporary password
exports.resetPassword = async (req, res) => {
  try{
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user) return res.status(404).json({ message: 'User not found' });

    // generate a temporary password
    const temp = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4);
    const hashed = await bcrypt.hash(temp, 10);
    user.password = hashed;
    user.mustChangePassword = true;
    await user.save();

    // return temporary password to caller (admin) so they can communicate it
    return res.json({ message: 'Password reset', temporaryPassword: temp });
  }catch(err){ res.status(500).json({ message: err.message }); }
};
