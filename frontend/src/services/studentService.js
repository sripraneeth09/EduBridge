import api from './api'

export default {
  list(params){ return api.get('/students', { params }) },
  create(data){ return api.post('/students', data) },
  get(id){ return api.get('/students/' + id) },
  update(id, data){ return api.put('/students/' + id, data) },
  remove(id){ return api.delete('/students/' + id) },
  // Let the browser set multipart boundaries; do not set Content-Type manually
  import(formData){ return api.post('/students/import', formData) },
  export(){ return api.get('/students/export', { responseType: 'blob' }) },
  template(){ return api.get('/students/template', { responseType: 'blob' }) }
}
