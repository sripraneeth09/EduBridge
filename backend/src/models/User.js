const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, default: undefined },
  registrationNo: { type: String, unique: true, sparse: true, trim: true, uppercase: true, default: undefined },
  password: { type: String, required: true },
  mustChangePassword: { type: Boolean, default: false },
  role: { type: String, enum: ['admin','teacher','student','parent','maintenance'], default: 'student' },
  phone: { type: String },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ registrationNo: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);