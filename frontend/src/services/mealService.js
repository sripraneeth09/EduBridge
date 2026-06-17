import api from './api'
export const createMenu = (data) => api.post('/meal/menu', data)
export const updateCount = (data) => api.post('/meal/count', data)
export const rateMeal = (data) => api.post('/meal/rate', data)
export const listMeals = () => api.get('/meal')
export const createStock = (data) => api.post('/meal/stock', data)
export const updateStock = (id, data) => api.put(`/meal/stock/${id}`, data)
export const listStock = () => api.get('/meal/stock')
export const deleteStock = (id) => api.delete(`/meal/stock/${id}`)
