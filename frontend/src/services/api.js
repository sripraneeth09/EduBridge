import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
})

// Attach token when available
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if(token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export const getUploadUrl = (filePath) => {
  if (!filePath) return filePath
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath
  let apiHost = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '')
  apiHost = apiHost.replace(/\/api$/, '')
  return `${apiHost}${filePath.startsWith('/') ? '' : '/'}${filePath}`
}

export default api
