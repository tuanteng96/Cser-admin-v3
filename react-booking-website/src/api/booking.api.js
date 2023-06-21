import http from './configs/http'

const bookingApi = {
  getStock: () => {
    return http.get('/api/v3/web?cmd=getStock')
  },
  getService: ({ StockID = '', MemberID = '', Ps = 10, Pi = 1, Key = '' }) => {
    return http.get(
      `/api/v3/mbook?cmd=getroot&memberid=${MemberID}&ps=${Ps}&pi=${Pi}&key=${Key}&stockid=${StockID}`
    )
  },
  getListStaff: stockid => {
    return http.get(
      `/api/gl/select2?cmd=user&includeRoles=1&includeSource=1&crstockid=${stockid}&roles=DV`
    )
  },
  postBooking: data => {
    return http.post(`/api/v3/mbook?cmd=booking`, JSON.stringify(data))
  },
  getConfigName: name => {
    return http.get(`/api/v3/config?cmd=getnames&names=${name}&ignore_root=1`)
  }
}

export default bookingApi
