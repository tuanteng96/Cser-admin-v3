import { isDevCode } from "../../../../helpers/DevHelpers";
import axiosClient from "../../../../redux/axioClient";

const GET_MEMBERS_STAFF_URL = "/api/gl/select2";
const GET_ROOT_SERVICES_URL = "/api/v3/mbook";
const POST_BOOKING_URL = "/api/v3/mbookadmin?cmd=AdminBooking";

const getMembers = (key, CurrentStockID, member = "") => {
  return axiosClient.get(
    `${GET_MEMBERS_STAFF_URL}?cmd=member&q=${key}&CurrentStockID=${
      isDevCode() ? "8975" : CurrentStockID
    }&member=${member}`
  );
};
const getStaffs = ({ StockID, key = "", All }) => {
  return axiosClient.get(
    `${GET_MEMBERS_STAFF_URL}?cmd=user&roles=DV&crstockid=${StockID}&q=${key}${
      All ? "&all=1" : ""
    }`
  );
};
const getRootServices = ({ MemberID, StockID, Key }) => {
  return axiosClient.get(
    `${GET_ROOT_SERVICES_URL}?cmd=getroot&memberid=${MemberID}&ps=15&pi=1&key=${Key}&stockid=${StockID}`
  );
};
const postBooking = (data, { CurrentStockID, u_id_z4aDf2 }) => {
  return axiosClient.post(
    `${POST_BOOKING_URL}&CurrentStockID=${CurrentStockID}&u_id_z4aDf2=${u_id_z4aDf2}`,
    JSON.stringify(data)
  );
};

const deleteBooking = (data, { CurrentStockID, u_id_z4aDf2 }) => {
  return axiosClient.post(
    `${POST_BOOKING_URL}&CurrentStockID=${CurrentStockID}&u_id_z4aDf2=${u_id_z4aDf2}`,
    JSON.stringify(data)
  );
};

const getProcesingBook = () => axiosClient.get(`/api/v3/UnDone@get`);

const updateProcesingBook = (data) =>
  axiosClient.post(`/api/v3/UnDone@update`, JSON.stringify(data));

const getBooking = ({
  MemberID,
  From,
  To,
  StockID,
  Status,
  UserServiceIDs,
  StatusMember,
  StatusBook,
  StatusAtHome,
}) => {
  return axiosClient.get(
    `/api/v3/mbookadmin?cmd=getbooks&memberid=${MemberID}&from=${From}&to=${To}&stockid=${StockID}&status=${Status}&UserServiceIDs=${UserServiceIDs}&StatusMember=${StatusMember}&StatusBook=${StatusBook}&StatusAtHome=${StatusAtHome}`
  );
};

const createMember = (data) => {
  return axiosClient.post("/api/v3/member23?cmd=add", JSON.stringify(data));
};
const checkinMember = (data) => {
  return axiosClient.post("/services/preview.aspx?cmd=checkin", data);
};

const getConfigName = (name) => {
  return axiosClient.get(
    `/api/v3/config?cmd=getnames&names=${name}&ignore_root=1`
  );
};

const saveConfigName = (name, data) => {
  return axiosClient.post(
    `/api/v3/ConfigJson@save?name=${name}`,
    JSON.stringify(data)
  );
};

const editTagsMember = (data) => {
  return axiosClient.post(
    "/api/v3/pagetele24@savemember",
    JSON.stringify(data)
  );
};

const updateRoom = (data) => {
  return axiosClient.post(
    `/api/v3/MBookAdmin?cmd=UpdateRoom`,
    JSON.stringify(data)
  );
};

const CalendarCrud = {
  getMembers,
  getStaffs,
  getRootServices,
  postBooking,
  deleteBooking,
  getBooking,
  createMember,
  checkinMember,
  getConfigName,
  saveConfigName,
  editTagsMember,
  updateRoom,
  getProcesingBook,
  updateProcesingBook,
};
export default CalendarCrud;
