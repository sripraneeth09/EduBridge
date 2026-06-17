import api from './api'
export const markAttendance = (data) => api.post('/attendance/mark', data)
export const getAttendanceByStudent = (studentId) => api.get(`/attendance/student/${studentId}`)
export const monthlyReport = (month, year, studentId) => api.get(`/attendance/report/monthly?month=${month}&year=${year}${studentId ? '&studentId=' + studentId : ''}`)
