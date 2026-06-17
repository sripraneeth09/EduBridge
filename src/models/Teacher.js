const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String },
  classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }],
  contactNumber: { type: String },
  qualification: { type: String },
  designation: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
