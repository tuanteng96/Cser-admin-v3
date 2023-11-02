import axiosClient from "../../../redux/axioClient";

const BONUS_STAFF_URL = "/api/v3/orderbonus?cmd=calc";
const fakeToken =
  window?.top?.token ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwMzExNDEwNTA2NCIsIm5iZiI6MTY5ODg4Nzg0NywiZXhwIjoxNzg1Mjg3ODQ3LCJpYXQiOjE2OTg4ODc4NDd9.z8z8VCaiYt85anOLETd13G_afsg2vlBGodcBNbv13kM';
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
