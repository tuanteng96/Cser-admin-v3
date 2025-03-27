import { isDevCode } from "../../../../helpers/DevHelpers";
import axiosClient from "../../../../redux/axioClient";

const GET_MEMBERS_STAFF_URL = "/api/gl/select2";
const GET_ROOT_SERVICES_URL = "/api/v3/mbook";
const POST_BOOKING_URL = "/api/v3/mbookadmin?cmd=AdminBooking";

const getListStaff = (stockid) => {
  return axiosClient.get(
    `/api/gl/select2?cmd=user&includeRoles=1&includeSource=1&crstockid=${stockid}&roles=DV`
  );
};

const getMembers = (key, CurrentStockID, member = "") => {
  return axiosClient.get(
    `${GET_MEMBERS_STAFF_URL}?cmd=member&q=${key}&CurrentStockID=${
      isDevCode() ? "8975" : CurrentStockID
    }&member=${member}`
  );
};
const getMembersByStocks = (key) => {
  return axiosClient.get(
    `/services/preview.aspx?cmd=search_member&key=${encodeURIComponent(
      key
    )}&typeSearch=sell&ps=50&pi=1&searchId=2&select=ID%2CFullName%2CMobilePhone%2CHomeAddress%2CByStockID%2CPresent%2CSource%2CAppInfo%2CBirthDate%2CTeleNote%2CJobs%2CReceiveInformation%2CPresent%2CPhoto&includes=GroupNames&isAdmin=true&__MemberCheckin=&__MemberMoney=0&__MyNoti=0&__AllNoti=0&__Birth=0&__MBirth=0&__Cate=false&__HasOrderService=0&__MemberGroups=false&__StaffID=0&__StockID=0&__Source=&__Tags=&from=top&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBdXRoMlR5cGUiOiJVc2VyRW50IiwiSUQiOiIxIiwiVG9rZW5JZCI6IjEwNjEzMzEwNjU0MiIsIm5iZiI6MTcyOTI0MzI2NSwiZXhwIjoxODE1NjQzMjY1LCJpYXQiOjE3MjkyNDMyNjV9.L6nsnpdEByLxQdkr77lmE4K_i__8K88Mnu8ViKnQ3UY`
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
  Tags = "",
}) => {
  return axiosClient.get(
    `/api/v3/mbookadmin?cmd=getbooks&memberid=${MemberID}&from=${From}&to=${To}&stockid=${StockID}&status=${Status}&UserServiceIDs=${UserServiceIDs}&StatusMember=${StatusMember}&StatusBook=${StatusBook}&StatusAtHome=${StatusAtHome}&Tags=${Tags}`
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

const getListBookConfig = (data) => {
  return axiosClient.post(`/api/v3/MemberBookConfig@get`, JSON.stringify(data));
};

const addEditBookConfig = (data) => {
  return axiosClient.post(
    `/api/v3/memberbookconfig@edit`,
    JSON.stringify(data)
  );
};

const deleteBookConfig = (data) => {
  return axiosClient.post(
    `/api/v3/memberbookconfig@delete`,
    JSON.stringify(data)
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
  getMembersByStocks,
  getListBookConfig,
  addEditBookConfig,
  deleteBookConfig,
  getListStaff,
};
export default CalendarCrud;
