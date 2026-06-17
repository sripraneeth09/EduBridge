const User = require('../models/User');

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
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};
