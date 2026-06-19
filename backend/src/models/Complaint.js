const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const complaintSchema = new Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['teacher','meal','cleanliness','infrastructure','other'] , default: 'other'},
  description: { type: String },
  anonymous: { type: Boolean, default: false },
  photos: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','under review','in progress','resolved'], default: 'pending' },
  comments: [{ by: { type: Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: Date }]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);