import http from "../utils/http";

const MembersAPI = {
  list: (StockID = 0) =>
    http.get(`/api/gl/select2?cmd=member&CurrentStockID=${StockID || 0}`),
  listReportKG: (body) =>
    http.post(`/api/v3/membernote24@get`, JSON.stringify(body)),
};

export default MembersAPI;
