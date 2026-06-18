const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Meal = require('../models/Meal');
const Complaint = require('../models/Complaint');
const Infrastructure = require('../models/InfrastructureIssue');
const LostItem = require('../models/LostItem');

exports.summary = async (req, res) => {
  try{
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate()+1);
    const attendanceToday = await Attendance.countDocuments({ date: { $gte: start, $lt: end }, status: 'present' });
    const mealToday = await Meal.findOne({ date: { $gte:start, $lt:end } });
    const mealsServed = mealToday ? mealToday.numberServed : 0;
    const openComplaints = await Complaint.countDocuments({ status: { $ne: 'resolved' } });
    const openIssues = await Infrastructure.countDocuments({ status: { $ne: 'resolved' } });
    const lostCount = await LostItem.countDocuments();

    // recent students
    const recentStudents = await Student.find().sort({ createdAt: -1 }).limit(5).select('name rollNo admissionNo className createdAt').lean();

    // students per class aggregation
    const studentsPerClass = await Student.aggregate([
      { $project: {
          classSection: {
            $concat: [
              { $ifNull: ['$className', ''] },
              {
                $cond: [
                  { $or: [{ $eq: ['$section', null] }, { $eq: ['$section', ''] }] },
                  '',
                  '$section'
                ]
              }
            ]
          }
        }
      },
      { $group: { _id: '$classSection', count: { $sum: 1 } } },
      { $project: { className: '$_id', count: 1, _id: 0 } },
      { $sort: { count: -1 } }
    ]);

    res.json({ totalUsers, totalStudents, totalTeachers, attendanceToday, mealsServed, openComplaints, openIssues, lostCount, recentStudents, studentsPerClass });
  }catch(err){ res.status(500).json({ message: err.message }); }
};
