import api from './api'

export const register = (data) => api.post('/auth/register', data)
export const login = (data) => api.post('/auth/login', data)
export const me = () => api.get('/auth/me')
export const changePassword = (data) => api.post('/auth/change-password', data)
