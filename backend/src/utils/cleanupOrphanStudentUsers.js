const User = require('../models/User');
const Student = require('../models/Student');

/**
 * Remove User documents with role 'student' that are not linked to any Student document.
 * This keeps only student users that still have a matching entry in the students collection.
 */
const cleanupOrphanStudentUsers = async () => {
  const studentUserIds = await Student.distinct('user', { user: { $exists: true, $ne: null } });
  const deleteFilter = {
    role: 'student',
    _id: { $nin: studentUserIds }
  };
  const result = await User.deleteMany(deleteFilter);
  return result.deletedCount || 0;
};

module.exports = cleanupOrphanStudentUsers;
