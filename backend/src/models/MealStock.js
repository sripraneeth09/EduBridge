const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stockSchema = new Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  unit: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('MealStock', stockSchema);