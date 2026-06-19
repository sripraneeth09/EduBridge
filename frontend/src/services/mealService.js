import api from './api'
export const createMenu = (data) => api.post('/meal/menu', data)
export const rateMeal = (data) => api.post('/meal/rate', data)
export const deleteRating = (mealId) => api.delete(`/meal/rate/${mealId}`)
export const listMeals = () => api.get('/meal')
