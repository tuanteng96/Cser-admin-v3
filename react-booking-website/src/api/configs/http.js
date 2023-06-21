import axios from 'axios'
import queryString from 'query-string'
import { DevHelpers } from 'src/helpers/DevHelpers'

const http = axios.create({
  baseURL: DevHelpers.isDevelopment()
    ? process.env.REACT_APP_API_URL
    : window.API || '',
  headers: {
    'content-type': 'text/plain'
  },
  paramsSerializer: params => queryString.stringify(params)
})

export default http
