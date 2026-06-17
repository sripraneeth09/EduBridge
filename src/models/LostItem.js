const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lostSchema = new Schema({
  itemName: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  date: { type: Date, default: Date.now },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['lost','claimed','returned'], default: 'lost' }
}, { timestamps: true });

module.exports = mongoose.model('LostItem', lostSchema);