const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
  name: { type: String, required: true }, // 10A, 9B, etc.
  grade: { type: Number, required: true }, // 10, 9, 8, etc.
  section: { type: String }, // A, B, C, etc.
  classTeacher: { type: Schema.Types.ObjectId, ref: 'User' },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
