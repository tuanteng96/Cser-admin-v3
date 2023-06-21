import http from './configs/http'

const producsApi = {
  getAllProduct: () => {
    return http.get('/products')
  }
}
export default producsApi
