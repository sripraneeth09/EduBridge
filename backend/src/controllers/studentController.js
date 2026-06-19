const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

// Preserve DOB exactly as DDMMYYYY string. Do not convert to ISO dates for storage.
// Numeric Excel values without a leading zero are normalized to 8 digits.
const normalizeDobString = (value) => {
  if (value === undefined || value === null) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const day = `${value.getDate()}`.padStart(2, '0');
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const year = value.getFullYear();
    return `${day}${month}${year}`;
  }

  const raw = value.toString().trim();
  if (!raw || !/^[0-9]+$/.test(raw)) return null;
  const normalized = raw.padStart(8, '0');
  if (!/^\d{8}$/.test(normalized)) return null;
  const day = parseInt(normalized.slice(0, 2), 10);
  const month = parseInt(normalized.slice(2, 4), 10);
  const year = parseInt(normalized.slice(4), 10);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return normalized;
};

const normalizeGender = (value) => {
  if (value === undefined || value === null) return undefined;
  const raw = value.toString().trim().toLowerCase();
  if (!raw) return undefined;
  const map = {
    'm': 'male',
    'male': 'male',
    'f': 'female',
    'female': 'female',
    'o': 'other',
    'other': 'other'
  };
  return map[raw];
};

const getPasswordFromDob = (dob) => {
  return normalizeDobString(dob);
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');

const createStudentUser = async ({ name, email, registrationNo, dateOfBirth }, session = null) => {
  const normalizedEmail = email ? email.toString().trim().toLowerCase() : undefined;
  const reg = registrationNo ? registrationNo.toString().trim().toUpperCase() : undefined;
  const findUser = (query) => session ? User.findOne(query).session(session) : User.findOne(query);

  console.log('createStudentUser start', { name, normalizedEmail, registrationNo: reg, dateOfBirth, hasSession: !!session });

  let user = null;
  if (normalizedEmail) {
    user = await findUser({ email: normalizedEmail });
    console.log('createStudentUser found by email', { userId: user?._id });
  }
  if (!user && reg) {
    user = await findUser({ registrationNo: { $regex: `^${escapeRegex(reg)}$`, $options: 'i' } });
    console.log('createStudentUser found by registrationNo', { userId: user?._id });
  }
  if (user) {
    console.log('createStudentUser existing user reused', { userId: user._id });
    return { user, rawPassword: null };
  }

  const rawPassword = getPasswordFromDob(dateOfBirth) || Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(rawPassword, 10);
  const createData = { name, password: hashed, role: 'student' };
  if (reg) createData.registrationNo = reg;
  if (normalizedEmail) createData.email = normalizedEmail;

  try {
    let newUser;
    if (session) {
      newUser = new User(createData);
      await newUser.save({ session });
    } else {
      newUser = await User.create(createData);
    }
    console.log('createStudentUser created', { userId: newUser._id, rawPassword: rawPassword ? 'yes' : 'no' });
    return { user: newUser, rawPassword };
  } catch (err) {
    console.error('createStudentUser error', err.message, err.code, err.keyValue);
    if (err.code === 11000) {
      const existingByEmail = normalizedEmail ? await findUser({ email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' } }) : null;
      if (existingByEmail) {
        console.log('createStudentUser duplicate email race, reused existing user', { userId: existingByEmail._id });
        return { user: existingByEmail, rawPassword: null };
      }
      if (reg) {
        const existingByReg = await findUser({ registrationNo: { $regex: `^${escapeRegex(reg)}$`, $options: 'i' } });
        if (existingByReg) {
          console.log('createStudentUser duplicate reg race, reused existing user', { userId: existingByReg._id });
          return { user: existingByReg, rawPassword: null };
        }
      }
    }
    throw err;
  }
};

exports.createStudent = async (req, res, next) => {
  let session = null;
  let useTransaction = false;
  let createdUserId = null;
  try {
    const data = req.body;
    if (!data.name || !data.rollNo || !data.admissionNo) return res.status(400).json({ message: 'name, rollNo and admissionNo are required' });

    const dateOfBirth = normalizeDobString(data.dateOfBirth);
    if (!dateOfBirth) {
      return res.status(400).json({ message: 'Invalid dateOfBirth format. Expected 8 digits DDMMYYYY.' });
    }

    const dupRoll = await Student.findOne({ rollNo: data.rollNo });
    if (dupRoll) return res.status(409).json({ message: 'Duplicate roll number' });
    const dupAdm = await Student.findOne({ admissionNo: data.admissionNo });
    if (dupAdm) return res.status(409).json({ message: 'Duplicate admission number' });

    session = await Student.startSession();
    try {
      session.startTransaction();
      useTransaction = true;
    } catch (_) {
      // If transactions are unavailable on this MongoDB deployment, continue with best-effort cleanup.
    }

    const userObj = await createStudentUser({
      name: data.name,
      email: data.email,
      registrationNo: data.admissionNo,
      dateOfBirth
    }, session);
    createdUserId = userObj.rawPassword ? userObj.user._id : null;

    const student = new Student({
      user: userObj.user._id,
      name: data.name,
      rollNo: data.rollNo,
      admissionNo: data.admissionNo,
      registrationNo: data.admissionNo,
      className: data.className || data.class || '',
      section: data.section || '',
      gender: normalizeGender(data.gender),
      dateOfBirth,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      address: data.address
    });
    await student.save(session ? { session } : {});

    if (useTransaction) await session.commitTransaction();

    return res.status(201).json({
      student,
      credentials: userObj.rawPassword ? { registrationNo: data.admissionNo, password: userObj.rawPassword } : { registrationNo: data.admissionNo }
    });
  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction();
    } else if (createdUserId) {
      await User.findByIdAndDelete(createdUserId);
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate key', detail: err.keyValue });
    }
    next(err);
  } finally {
    if (session) session.endSession();
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
    if(data.dateOfBirth !== undefined){
      const dateOfBirth = normalizeDobString(data.dateOfBirth);
      if (!dateOfBirth) {
        return res.status(400).json({ message: 'Invalid dateOfBirth format. Expected 8 digits DDMMYYYY.' });
      }
      data.dateOfBirth = dateOfBirth;
    }
    if(data.gender !== undefined){
      data.gender = normalizeGender(data.gender);
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
  console.log('importStudents received');
  try{
    if(!req.file) {
      console.log('importStudents missing file');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('importStudents file metadata', { originalname: req.file.originalname, size: req.file.size, mimetype: req.file.mimetype });
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    console.log('importStudents sheetName', sheetName);
    const worksheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    console.log('importStudents parsed rows', json.length);

    let total = json.length, imported = 0, skipped = 0;
    const errors = [];
    const createdUsers = [];

    for(let i=0;i<json.length;i++){
      const row = json[i];
      const rowIndex = i + 2;
      console.log('importStudents row start', { rowIndex, row });
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
      const dateOfBirth = normalizeDobString(dobValue);
      console.log('importStudents normalized row', { rowIndex, name, rollNo, admissionNo, dateOfBirth, dobValue });

      if(!name || !rollNo || !admissionNo){
        skipped++; errors.push({ row: rowIndex, reason: 'Missing required fields (Name/Roll/Admission)' });
        console.log('importStudents skipped row missing required fields', { rowIndex });
        continue;
      }

      if(!dateOfBirth){
        skipped++; errors.push({ row: rowIndex, reason: 'Invalid or missing DOB. Expected DDMMYYYY string.' });
        console.log('importStudents skipped row invalid dob', { rowIndex, dobValue });
        continue;
      }

      const exists = await Student.findOne({ $or: [{ rollNo }, { admissionNo }] });
      if(exists){ skipped++; errors.push({ row: rowIndex, reason: 'Duplicate roll/admission' }); console.log('importStudents skipped row duplicate', { rowIndex, rollNo, admissionNo }); continue; }

      const session = await Student.startSession();
      let useTransaction = false;
      let createdUserId = null;
      try {
        try {
          session.startTransaction();
          useTransaction = true;
          console.log('importStudents row transaction started', { rowIndex });
        } catch (_) {
          console.log('importStudents row transaction unavailable', { rowIndex });
        }

        const userResult = await createStudentUser({
          name,
          email: (row['Email'] || row['email'] || '').toString().trim(),
          registrationNo: admissionNo,
          dateOfBirth
        }, session);
        createdUserId = userResult.rawPassword ? userResult.user._id : null;
        console.log('importStudents created/reused user', { rowIndex, userId: userResult.user._id, rawPassword: !!userResult.rawPassword });

        const student = new Student({
          user: userResult.user._id,
          name,
          rollNo,
          admissionNo,
          registrationNo: admissionNo,
          className,
          section,
          gender: normalizeGender(gender),
          dateOfBirth,
          parentName,
          parentPhone,
          address
        });
        await student.save(session ? { session } : {});
        console.log('importStudents created student', { rowIndex, studentId: student._id });

        if(useTransaction) {
          await session.commitTransaction();
          console.log('importStudents row transaction committed', { rowIndex });
        }

        if(userResult.rawPassword){
          createdUsers.push({ admissionNo, password: userResult.rawPassword });
        }
        imported++;
      } catch(e) {
        console.error('importStudents row error', { rowIndex, error: e.message, code: e.code });
        if(useTransaction) {
          await session.abortTransaction();
          console.log('importStudents row transaction aborted', { rowIndex });
        } else if(createdUserId) {
          await User.findByIdAndDelete(createdUserId);
          console.log('importStudents row cleanup deleted orphan user', { rowIndex, userId: createdUserId });
        }
        skipped++; errors.push({ row: rowIndex, reason: e.message });
      } finally {
        session.endSession();
        console.log('importStudents row session ended', { rowIndex });
      }
    }

    console.log('importStudents completed', { total, imported, skipped, createdUsers: createdUsers.length, errors: errors.length });
    return res.json({ total, imported, skipped, errors, createdUsers, note: 'Students created with registrationNo login. Password is DOB (DDMMYYYY) when DOB exists.' });
  }catch(err){
    console.error('importStudents fatal error', err);
    next(err);
  }
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
      'Date Of Birth': s.dateOfBirth || '',
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
