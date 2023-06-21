export default function setupAxios(axios, store) {

    // Request interceptor for API calls
    axios.interceptors.request.use(
        config => {
            const {
                auth: { authToken }
            } = store.getState();

            if (authToken) {
                config.headers.Authorization = `Bearer ${authToken}`;
            }

            return config;
        },
        err => Promise.reject(err)
    );

    // Response interceptor for API calls
    axios.interceptors.response.use((response) => {

        // const { status, auto } = response.data;
        // //const token = await getToken();

        // if (status === 401) {
        //     if (auto === 'yes') {
        //         const config = response.config;
        //         //config.headers.Authorization = `Bearer ${token}`;
        //         return response.data;
        //     }
        // }

        if (response && response.data) {
            if (response.config.responseType && response.config.responseType === "blob") {
                return {
                    data: response.data,
                    headers: response.headers
                }
            }
            return response.data;
        }

        return response;
    }, (error) => {
        // Check Error Token
        return Promise.reject(error);
    });
}