import axiosClient from "../../../redux/axioClient";

const BONUS_STAFF_URL = "/api/v3/orderbonus?cmd=calc";
const fakeToken =
  window?.top?.token ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMzExNDEwMzQ2OCIsIm5iZiI6MTY4Njc5NTMyOCwiZXhwIjoxNjg3NDAwMTI4LCJpYXQiOjE2ODY3OTUzMjh9.6qk1nZn5LOWrYfNl3lY6lwuvoD6Yf9qYyFa4Ja4YcJU";
const ConfigGlobal = {
  headers: {
    Authorization: "Bearer " + fakeToken,
  },
};
const getOrderItem = (data) => {
  return axiosClient.post(
    `${BONUS_STAFF_URL}`,
    JSON.stringify(data),
    ConfigGlobal
  );
};
const postOrderItem = (data) => {
  return axiosClient.post(
    `${BONUS_STAFF_URL}`,
    JSON.stringify(data),
    ConfigGlobal
  );
};

const BonusSaleCrud = {
  getOrderItem,
  postOrderItem,
};
export default BonusSaleCrud;
