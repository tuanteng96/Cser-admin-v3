import axios from 'axios'
import queryString from 'query-string'

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'content-type': 'text/plain'
  },
  paramsSerializer: params => queryString.stringify(params)
})

export default http
