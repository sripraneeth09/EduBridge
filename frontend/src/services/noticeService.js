import api from './api'
export const listNotices = () => api.get('/school/notices')
export const getNotice = (id) => api.get(`/school/notices/${id}`)
export const createNotice = (data) => api.post('/school/notices', data)
export const updateNotice = (id, data) => api.put(`/school/notices/${id}`, data)
export const deleteNotice = (id) => api.delete(`/school/notices/${id}`)
