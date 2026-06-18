const Notice = require('../models/Notice');

exports.createNotice = async (req, res) => {
  try{
    const { title, description, date } = req.body;
    const notice = await Notice.create({ title, description, date, createdBy: req.user._id });
    res.status(201).json(notice);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listNotices = async (req, res) => {
  try{
    const notices = await Notice.find().sort({ date:-1 }).limit(50);
    res.json(notices);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.getNotice = async (req, res) => {
  try{
    const notice = await Notice.findById(req.params.id);
    if(!notice) return res.status(404).json({ message: 'Not found' });
    res.json(notice);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateNotice = async (req, res) => {
  try{
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(notice);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.deleteNotice = async (req, res) => {
  try{
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  }catch(err){ res.status(500).json({ message: err.message }); }
};