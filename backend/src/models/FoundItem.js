const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foundSchema = new Schema({
  itemName: { type: String, required: true },
  description: { type: String },
  locationFound: { type: String },
  image: { type: String },
  date: { type: Date, default: Date.now },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['found','claimed','returned'], default: 'found' }
}, { timestamps: true });

module.exports = mongoose.model('FoundItem', foundSchema);