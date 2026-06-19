const mongoose = require('mongoose');
const Meal = require('./src/models/Meal');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/edubridge';

async function resetRatings() {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const res = await Meal.updateMany({}, { $set: { ratings: [] } });
    console.log('Meals updated:', res.modifiedCount || res.nModified || 0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

resetRatings();
