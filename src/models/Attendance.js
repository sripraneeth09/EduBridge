const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present','absent','late'], default: 'present' },
  markedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

attendanceSchema.index({ student:1, date:1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);