import axiosClient from "../../../redux/axioClient";

const BONUS_STAFF_URL = "/api/v3/orderbonus?cmd=calc";
const fakeToken =
  window?.top?.token ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMzExNDEwMzY0MSIsIm5iZiI6MTY4ODM1ODQwMiwiZXhwIjoxNjg4OTYzMjAyLCJpYXQiOjE2ODgzNTg0MDJ9.4pTIFJzVivYma4YqbI0AEL7zXxgALLsqIMpDJndLFik";
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
