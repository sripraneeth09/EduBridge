const Issue = require('../models/InfrastructureIssue');

exports.reportIssue = async (req, res) => {
  try{
    const data = {
      ...req.body,
      reportedBy: req.user._id,
      photos: []
    };
    if (req.files && req.files.length) {
      data.photos = req.files.map(file => `/uploads/${file.filename}`);
    }
    const issue = await Issue.create(data);
    res.status(201).json(issue);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listIssues = async (req, res) => {
  try{
    const issues = await Issue.find()
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role')
      .sort({ createdAt:-1 });
    res.json(issues);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateIssue = async (req, res) => {
  try{
    const issue = await Issue.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('reportedBy', 'name role')
      .populate('assignedTo', 'name role');
    res.json(issue);
  }catch(err){ res.status(500).json({ message: err.message }); }
};