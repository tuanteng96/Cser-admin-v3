import http from './configs/http'

const authApi = {
  login: data => {
    return http.post('/products', data)
  }
}

export default authApi
