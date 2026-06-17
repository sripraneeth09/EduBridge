const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  registrationNo: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin','teacher','student','parent','maintenance'], default: 'student' },
  phone: { type: String },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);