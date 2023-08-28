export default function setupAxios(axios, store) {
  // Request interceptor for API calls
  axios.interceptors.request.use(
    config => {
      const {
        auth: { Token }
      } = store.getState()

      if (Token) {
        config.headers.Authorization = `Bearer ${Token}`
      }

      return config
    },
    err => Promise.reject(err)
  )

  // Response interceptor for API calls
  axios.interceptors.response.use(
    response => {
      const result = {
        data: response.data,
        status: response.status
      }
      return result
    },
    error => {
      return Promise.reject(error)
    }
  )
}
