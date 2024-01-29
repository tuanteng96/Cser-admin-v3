import axiosClient from "../../../redux/axioClient";

const BONUS_STAFF_URL = "/api/v3/orderbonus?cmd=calc";

const getOrderItem = (data) => {
  return axiosClient.post(`${BONUS_STAFF_URL}`, JSON.stringify(data), {
    headers: {
      Authorization: "Bearer " + window?.top?.token,
    },
  });
};
const postOrderItem = (data) => {
  return axiosClient.post(`${BONUS_STAFF_URL}`, JSON.stringify(data), {
    headers: {
      Authorization: "Bearer " + window?.top?.token,
    },
  });
};

const changeCashOrder = (data) => {
  return axiosClient.post(`/api/v3/SysAdminTools@cash`, JSON.stringify(data), {
    headers: {
      Authorization: "Bearer " + window?.top?.token,
    },
  });
};

const changeCashOrderDs = (data) => {
  return axiosClient.post(
    `/api/v3/SysAdminTools@Orderitemuser`,
    JSON.stringify(data),
    {
      headers: {
        Authorization: "Bearer " + window?.top?.token,
      },
    }
  );
};

const BonusSaleCrud = {
  getOrderItem,
  postOrderItem,
  changeCashOrder,
  changeCashOrderDs,
};
export default BonusSaleCrud;
