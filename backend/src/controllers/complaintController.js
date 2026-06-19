const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try{
    const data = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      anonymous: req.body.anonymous === 'true' || req.body.anonymous === true,
      photos: []
    };

    if (!data.anonymous) {
      data.createdBy = req.user._id;
    } else if (req.user && req.user._id) {
      data.createdBy = req.user._id;
    }

    if (req.files && req.files.length) {
      data.photos = req.files.map(file => `/uploads/${file.filename}`);
    }

    const comp = await Complaint.create(data);
    res.status(201).json(comp);
  }catch(err){ res.status(500).json({ message: err.message }); }
};

exports.listComplaints = async (req, res) => {
  try{
    const query = { status: { $ne: 'resolved' } };
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

exports.deleteComplaint = async (req, res) => {
  try{
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const ownerId = complaint.createdBy?.toString();
    const userId = req.user._id.toString();
    const isOwner = ownerId === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to delete this complaint' });
    }

    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ message: 'Complaint deleted' });
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