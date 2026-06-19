const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

exports.reportLost = async (req, res) => {
  try{
    const data = { ...req.body, reportedBy: req.user._id };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    const item = await LostItem.create(data);
    res.status(201).json(item);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.reportFound = async (req, res) => {
  try{
    const data = { ...req.body, reportedBy: req.user._id };
    if (req.file) {
      data.image = `/uploads/${req.file.filename}`;
    }
    const item = await FoundItem.create(data);
    res.status(201).json(item);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.searchFound = async (req, res) => {
  try{
    const q = req.query.q || '';
    const items = await FoundItem.find({ itemName: new RegExp(q,'i') }).populate('reportedBy', 'name role').limit(50);
    res.json(items);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.claimItem = async (req, res) => {
  try{
    const item = await FoundItem.findByIdAndUpdate(req.params.id, { status: 'claimed' }, { new: true }).populate('reportedBy', 'name role');
    res.json(item);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listLost = async (req, res) => {
  try{
    const items = await LostItem.find().populate('reportedBy', 'name role').sort({ date: -1 });
    res.json(items);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listFound = async (req, res) => {
  try{
    const items = await FoundItem.find().populate('reportedBy', 'name role').sort({ date: -1 });
    res.json(items);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateLostStatus = async (req, res) => {
  try{
    const item = await LostItem.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('reportedBy', 'name role');
    res.json(item);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateFoundStatus = async (req, res) => {
  try{
    const item = await FoundItem.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).populate('reportedBy', 'name role');
    res.json(item);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.deleteLost = async (req, res) => {
  try{
    await LostItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lost item deleted' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.deleteFound = async (req, res) => {
  try{
    await FoundItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Found item deleted' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};