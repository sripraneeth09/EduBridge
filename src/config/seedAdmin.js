const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = async function seedAdmin(){
  try{
    const exists = await User.findOne({ email: 'admin@school.local' });
    if(exists) return;
    const pwd = await bcrypt.hash('Admin@123', 10);
    await User.create({ name: 'Headmaster', email: 'admin@school.local', password: pwd, role: 'admin' });
    console.log('Default admin user created: admin@school.local / Admin@123');
  }catch(err){ console.error('Seed admin error', err.message); }
};
