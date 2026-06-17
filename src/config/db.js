const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

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