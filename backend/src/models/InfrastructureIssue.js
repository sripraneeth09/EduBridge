const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issueSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  priority: { type: String, enum: ['low','medium','high','critical'], default: 'low' },
  photos: [{ type: String }],
  image: { type: String },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open','assigned','in progress','resolved'], default: 'open' }
}, { timestamps: true });

module.exports = mongoose.model('InfrastructureIssue', issueSchema);