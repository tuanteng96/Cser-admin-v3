import axios from 'axios'

class Http {
    constructor() {
        this.instance = axios.create({
            baseURL: import.meta.env.MODE === 'development' ?
                import.meta.env.VITE_HOST : window.location.origin,
            timeout: 50000,
            headers: {
                'content-type': 'text/plain'
            },
            withCredentials: true
        })
        this.instance.interceptors.request.use(
                (config) => {
                    return config
                },
                (error) => {
                    return Promise.reject(error)
                }
            )
            // Add response interceptor
        this.instance.interceptors.response.use(
            ({ data }) => {
                return {
                    data
                }
            },
            (error) => {
                return Promise.reject(error)
            }
        )
    }
}

const http = new Http().instance
export default http