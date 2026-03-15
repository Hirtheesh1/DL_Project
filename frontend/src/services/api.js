import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 30000 })

export const fetchHealth      = ()        => api.get('/health')
export const fetchModelInfo   = ()        => api.get('/model-info')
export const fetchStats       = ()        => api.get('/stats')
export const fetchSample      = ()        => api.get('/sample')
export const predict          = (features)=> api.post('/predict',       { features })
export const batchPredict     = (samples) => api.post('/batch-predict',  { samples })

export const uploadCSV = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/upload-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
