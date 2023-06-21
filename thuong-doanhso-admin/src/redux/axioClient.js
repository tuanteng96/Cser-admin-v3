import axios from 'axios';
import queryString from 'query-string';
import { isDev } from '../helpers/DevHelpers';


const axiosClient = axios.create({
    baseURL: isDev() ? process.env.REACT_APP_API_URL : "",
    headers: {
        'content-type': 'application/json',
    },
    paramsSerializer: params => queryString.stringify(params),
});

export default axiosClient;