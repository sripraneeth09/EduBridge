const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try{
    const data = req.body;
    if(!data.anonymous) data.createdBy = req.user._id;
    const comp = await Complaint.create(data);
    res.status(201).json(comp);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listComplaints = async (req, res) => {
  try{
    const query = {};
    if (req.user.role === 'student' || req.user.role === 'parent') {
      query.createdBy = req.user._id;
    }
    const list = await Complaint.find(query)
      .populate('createdBy', 'name role')
      .populate('comments.by', 'name role')
      .sort({ createdAt:-1 });
    res.json(list);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.updateStatus = async (req, res) => {
  try{
    const comp = await Complaint.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
      .populate('createdBy', 'name role')
      .populate('comments.by', 'name role');
    res.json(comp);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.addComment = async (req, res) => {
  try{
    const { text } = req.body;
    const comp = await Complaint.findById(req.params.id);
    if (!comp) return res.status(404).json({ message: 'Complaint not found' });
    comp.comments.push({ by: req.user._id, text, createdAt: new Date() });
    await comp.save();
    
    const populated = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name role')
      .populate('comments.by', 'name role');
    res.json(populated);
  }catch(err){ res.status(500).json({ message: err.message }); }
};