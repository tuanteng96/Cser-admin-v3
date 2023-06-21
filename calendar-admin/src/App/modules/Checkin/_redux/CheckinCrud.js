import axiosClient from "../../../../redux/axioClient";

const getListCheckIn = (StockID) => {
    return axiosClient.get(`/services/preview.aspx?cmd=search_member&key=&typeSearch=sell&ps=100&pi=1&searchId=4&__MemberCheckin=${StockID}&__MemberMoney=0&__MyNoti=0&__AllNoti=0&__Birth=0&__MBirth=0&__Cate=false&__HasOrderService=0&__MemberGroups=false&__StaffID=0&__StockID=0&__Source=&__Tags=`)
}

const CheckinCrud = {
    getListCheckIn,
};
export default CheckinCrud;