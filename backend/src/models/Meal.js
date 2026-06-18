const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mealSchema = new Schema({
  date: { type: Date, required: true },
  menuName: { type: String },
  description: { type: String },
  numberServed: { type: Number, default: 0 },
  ratings: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

mealSchema.index({ date:1 }, { unique: true });

module.exports = mongoose.model('Meal', mealSchema);