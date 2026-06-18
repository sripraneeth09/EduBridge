const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

const getPasswordFromDob = (dob) => {
  if(!dob) return null;
  const date = new Date(dob);
  if(Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}${month}${day}`;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

const createStudentUser = async ({ name, email, registrationNo, dateOfBirth }) => {
  const normalizedEmail = email ? email.toString().trim().toLowerCase() : undefined;
  const reg = registrationNo ? registrationNo.toString().trim().toUpperCase() : undefined;
  let user = null;
  if(normalizedEmail){
    user = await User.findOne({ email: normalizedEmail });
  }
  if(!user && reg){
    user = await User.findOne({ registrationNo: { $regex: `^${escapeRegex(reg)}$`, $options: 'i' } });
  }
  if(user) return { user, rawPassword: null };

  const rawPassword = getPasswordFromDob(dateOfBirth) || Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(rawPassword, 10);
  const createData = { name, password: hashed, role: 'student' };
  if(reg) createData.registrationNo = reg;
  if(normalizedEmail) createData.email = normalizedEmail;

  try {
    const newUser = await User.create(createData);
    return { user: newUser, rawPassword };
  } catch (err) {
    if (err.code === 11000) {
      const existingByEmail = normalizedEmail
        ? await User.findOne({ email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' } })
        : null;
      if (existingByEmail) return { user: existingByEmail, rawPassword: null };

      if (reg) {
        const existingByReg = await User.findOne({ registrationNo: { $regex: `^${escapeRegex(reg)}$`, $options: 'i' } });
        if (existingByReg) return { user: existingByReg, rawPassword: null };
      }
    }
    throw err;
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const data = req.body;
    if(!data.name || !data.rollNo || !data.admissionNo) return res.status(400).json({ message: 'name, rollNo and admissionNo are required' });

    const dupRoll = await Student.findOne({ rollNo: data.rollNo });
    if(dupRoll) return res.status(409).json({ message: 'Duplicate roll number' });
    const dupAdm = await Student.findOne({ admissionNo: data.admissionNo });
    if(dupAdm) return res.status(409).json({ message: 'Duplicate admission number' });

    const userObj = await createStudentUser({
      name: data.name,
      email: data.email,
      registrationNo: data.admissionNo,
      dateOfBirth: data.dateOfBirth
    });

    const st = await Student.create({
      user: userObj.user._id,
      name: data.name,
      rollNo: data.rollNo,
      admissionNo: data.admissionNo,
      registrationNo: data.admissionNo,
      className: data.className || data.class || '',
      section: data.section || '',
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      address: data.address
    });

    return res.status(201).json({
      student: st,
      credentials: userObj.rawPassword ? { registrationNo: data.admissionNo, password: userObj.rawPassword } : { registrationNo: data.admissionNo }
    });
  } catch (err) {
    if(err.code === 11000){
      return res.status(409).json({ message: 'Duplicate key', detail: err.keyValue });
    }
    next(err);
  }
};

// List students with pagination/search/filters
exports.listStudents = async (req, res, next) => {
  try{
    const { page = 1, limit = 20, q, rollNo, className, section } = req.query;
    const filter = {};
    if(q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { rollNo: { $regex: q, $options: 'i' } },
        { admissionNo: { $regex: q, $options: 'i' } }
      ];
    }
    if(rollNo) filter.rollNo = rollNo;
    if(className) filter.className = className;
    if(section) filter.section = section;

    const skip = (parseInt(page)-1)*parseInt(limit);
    const [total, students] = await Promise.all([
      Student.countDocuments(filter),
      Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean()
    ]);

    return res.json({ total, page: parseInt(page), limit: parseInt(limit), students });
  }catch(err){ next(err); }
};

exports.getStudent = async (req, res, next) => {
  try{
    const s = await Student.findById(req.params.id).lean();
    if(!s) return res.status(404).json({ message: 'Not found' });
    res.json(s);
  }catch(err){ next(err); }
};

exports.updateStudent = async (req, res, next) => {
  try{
    const data = req.body;
    const id = req.params.id;
    // Prevent duplicating roll/admission on update
    if(data.rollNo){
      const dup = await Student.findOne({ rollNo: data.rollNo, _id: { $ne: id } });
      if(dup) return res.status(409).json({ message: 'Duplicate roll number' });
    }
    if(data.admissionNo){
      const dup = await Student.findOne({ admissionNo: data.admissionNo, _id: { $ne: id } });
      if(dup) return res.status(409).json({ message: 'Duplicate admission number' });
    }

    const updated = await Student.findByIdAndUpdate(id, data, { new: true });
    if(!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  }catch(err){ next(err); }
};

exports.deleteStudent = async (req, res, next) => {
  try{
    const id = req.params.id;
    const del = await Student.findByIdAndDelete(id);
    if(!del) return res.status(404).json({ message: 'Not found' });
    if(del.user){
      await User.findByIdAndDelete(del.user);
    }
    res.json({ message: 'Deleted' });
  }catch(err){ next(err); }
};

// Import students from uploaded Excel/CSV file
exports.importStudents = async (req, res, next) => {
  try{
    if(!req.file) return res.status(400).json({ message: 'No file uploaded' });
    // enable cellDates so Excel date cells are parsed as JS Dates when possible
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    let total = json.length, imported = 0, skipped = 0;
    const errors = [];
    const createdUsers = [];

    for(let i=0;i<json.length;i++){
      const row = json[i];
      const name = (row['Name'] || row['name'] || '').toString().trim();
      const rollNo = (row['Roll No'] || row['rollNo'] || '').toString().trim();
      const admissionNo = (row['Admission No'] || row['admissionNo'] || '').toString().trim();
      const className = (row['Class'] || row['class'] || '').toString().trim();
      const section = (row['Section'] || row['section'] || '').toString().trim();
      const gender = (row['Gender'] || row['gender'] || '').toString().trim();
      const dobValue = row['Date Of Birth'] || row['dateOfBirth'] || row['DOB'];
      const parentName = (row['Parent Name'] || row['parentName'] || '').toString().trim();
      const parentPhone = (row['Parent Phone'] || row['parentPhone'] || '').toString().trim();
      const address = (row['Address'] || row['address'] || '').toString().trim();
      let dateOfBirth;
      if(dobValue) {
        const parsed = new Date(dobValue);
        dateOfBirth = Number.isNaN(parsed.getTime()) ? undefined : parsed;
      }

      if(!name || !rollNo || !admissionNo){
        skipped++; errors.push({ row: i+2, reason: 'Missing required fields (Name/Roll/Admission)' });
        continue;
      }

      const exists = await Student.findOne({ $or: [{ rollNo }, { admissionNo }] });
      if(exists){ skipped++; errors.push({ row: i+2, reason: 'Duplicate roll/admission' }); continue; }

      const userResult = await createStudentUser({
        name,
        email: (row['Email'] || row['email'] || '').toString().trim(),
        registrationNo: admissionNo,
        dateOfBirth
      });

      const st = {
        user: userResult.user._id,
        name,
        rollNo,
        admissionNo,
        registrationNo: admissionNo,
        className,
        section,
        gender: gender.toLowerCase(),
        dateOfBirth,
        parentName,
        parentPhone,
        address
      };

      try{
        await Student.create(st);
        if(userResult.rawPassword){
          createdUsers.push({ admissionNo, password: userResult.rawPassword });
        }
        imported++;
      }catch(e){ skipped++; errors.push({ row: i+2, reason: e.message }); }
    }

    return res.json({ total, imported, skipped, errors, createdUsers, note: 'Students created with registrationNo login. Password is DOB (YYYYMMDD) when DOB exists.' });
  }catch(err){ next(err); }
};

// Export all students as Excel
exports.exportStudents = async (req, res, next) => {
  try{
    const students = await Student.find().lean();
    const rows = students.map(s => ({
      Name: s.name,
      'Roll No': s.rollNo,
      'Admission No': s.admissionNo,
      Class: s.className,
      Section: s.section,
      Gender: s.gender,
      'Date Of Birth': s.dateOfBirth ? s.dateOfBirth.toISOString().split('T')[0] : '',
      'Parent Name': s.parentName,
      'Parent Phone': s.parentPhone,
      Address: s.address
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  }catch(err){ next(err); }
};

// Download template
exports.downloadTemplate = async (req, res, next) => {
  try{
    const headers = [{
      Name: '', 'Roll No': '', 'Admission No': '', Class: '', Section: '', Gender: '', 'Date Of Birth': '', 'Parent Name': '', 'Parent Phone': '', Address: ''
    }];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=students-template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  }catch(err){ next(err); }
};
