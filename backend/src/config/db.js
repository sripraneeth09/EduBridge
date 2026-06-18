const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Ensure indexes are created by default during development. In production you may
// want to manage indexes via migrations and set autoIndex=false for performance.
mongoose.set('autoIndex', process.env.NODE_ENV !== 'production');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edubridge';

module.exports = async function connectDB(){
  try{
    await mongoose.connect(MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true });
    console.log('MongoDB connected');
    // Seed default admin if not present
    try{ const seed = require('./seedAdmin'); seed(); }catch(e){ /* ignore */ }
  }catch(err){
    console.error('MongoDB connection error', err.message);
    process.exit(1);
  }
};