const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rollNo: { type: Number },
  class: { type: Schema.Types.ObjectId, ref: 'Class' },
  dateOfBirth: { type: Date, required: true },
  registrationNo: { type: String, unique: true, sparse: true },
  parentName: { type: String },
  parentPhone: { type: String },
  parentEmail: { type: String },
  admissionNo: { type: String },
  admissionDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
