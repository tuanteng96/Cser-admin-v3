import http from './configs/http'

const worksheetApi = {
  getAllWorkSheet: data => {
    return http.post('/api/v3/userwork23@workList', JSON.stringify(data))
  },
  checkinWorkSheet: data => {
    return http.post('/api/v3/userwork23@sysCheckin', JSON.stringify(data))
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
    return http.post('/api/v3/userwork23@workoffs-delete', JSON.stringify(data))
  },
  getAllSalaryApproval: data => {
    return http.post('/api/v3/userwork23@UserMonthList', JSON.stringify(data))
  },
  addSalaryApproval: data => {
    return http.post('/api/v3/userwork23@UserMonth', JSON.stringify(data))
  }
}
export default worksheetApi
