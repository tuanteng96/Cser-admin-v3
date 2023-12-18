import http from "../utils/http";

const MembersAPI = {
  list: (StockID = 0, key) =>
    http.get(`/api/gl/select2?cmd=member&CurrentStockID=${StockID || 0}&q=${key}`),
  listReportKG: (body) =>
    http.post(`/api/v3/membernote24@get`, JSON.stringify(body)),
  saveNoteKg: (data) =>
    http.post(`/api/v3/membernote@edit`, JSON.stringify(data)),
  saveNoteKgDate: (data) =>
    http.post(`/api/v3/membernote@editDate`, JSON.stringify(data)),
};

export default MembersAPI;
