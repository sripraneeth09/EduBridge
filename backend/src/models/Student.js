const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  // Optional link to a User account
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  class: { type: Schema.Types.ObjectId, ref: 'Class' },
  name: { type: String, required: true },
  rollNo: { type: String, required: true, unique: true },
  admissionNo: { type: String, required: true, unique: true },
  className: { type: String },
  section: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dateOfBirth: { type: Date },
  parentName: { type: String },
  parentPhone: { type: String },
  address: { type: String },
  // preserve older fields for compatibility
  registrationNo: { type: String, unique: true, sparse: true },
}, { timestamps: true });

// Indexes for uniqueness enforcement (sparse to allow missing values)
studentSchema.index({ rollNo: 1 }, { unique: true, sparse: true });
studentSchema.index({ admissionNo: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Student', studentSchema);
