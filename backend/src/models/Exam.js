const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const examSchema = new Schema({
  classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
