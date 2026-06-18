const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/school', require('./routes/school'));
app.use('/api/school-management', require('./routes/schoolManagement'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/meal', require('./routes/meal'));
app.use('/api/complaints', require('./routes/complaint'));
app.use('/api/infrastructure', require('./routes/infrastructure'));
app.use('/api/lostfound', require('./routes/lostfound'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/students', require('./routes/students'));

app.get('/', (req, res) => res.send({ status: 'ok', app: 'EduBridge Portal API' }));

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
