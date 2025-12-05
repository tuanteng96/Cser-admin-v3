import http from './configs/http'

const worksheetApi = {
  getAllWorkSheet: data => {
    return http.post('/api/v3/userwork23@workList', JSON.stringify(data))
  },
  checkinWorkSheet: data => {
    return http.post('/api/v3/worktrack@adminedit', JSON.stringify(data))
  },
  deleteWorkSheet: data => {
    return http.post(
      '/api/v3/userwork23@sysCheckinDelete',
      JSON.stringify(data)
    )
  },
  addWorkOff: data => {
    return http.post('/api/v3/userwork23@workoffs', JSON.stringify(data))
  },
  deleteWorkOff: data => {
    return http.post('/api/v3/userwork23@workoffEdit', JSON.stringify(data))
  },
  getAllSalaryApproval: data => {
    return http.post('/api/v3/userwork23@UserMonthList', JSON.stringify(data))
  },
  addSalaryApproval: data => {
    return http.post('/api/v3/userwork23@UserMonth', JSON.stringify(data))
  },
  saveMachineCode: data => {
    return http.post('/api/v3/user24@devices', JSON.stringify(data))
  },
  saveTypeShift: data => {
    return http.post('/api/v3/user24@WorkTimeSetting', JSON.stringify(data))
  },
  listWorkOff: data => {
    return http.post(
      `/api/v3/userwork23@workoffList?stockid=${data.filter.StockID}`,
      JSON.stringify(data)
    )
  },
  listUserSalary: data => {
    return http.post(`/api/v3/UserSalary24@get`, JSON.stringify(data))
  },
  getCalendarWork: data =>
    http.post('/api/v3/WorkTrack@UserDaily', JSON.stringify(data)),
  getStocks: () => http.get(`/api/v3/web?cmd=getStock`),
  updateLatLng: body =>
    http.post(`/api/v3/cate25@UpdateLatLng`, JSON.stringify(body)),
  resetPwd: body => http.post(`/api/v3/User24@ResetPwd`, JSON.stringify(body)),
  getRoster: body => http.post(`/api/v4/roster@get`, JSON.stringify(body))
}
export default worksheetApi
