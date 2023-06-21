import axiosClient from "../../../../redux/axioClient";

const JSON_CONFIG_URL = '/brand/global/Global.json'

const getJsonConfig = () => {
    return axiosClient.get(`${JSON_CONFIG_URL}?${new Date().valueOf()}`);
};

const AuthCrud = {
    getJsonConfig
};
export default AuthCrud;