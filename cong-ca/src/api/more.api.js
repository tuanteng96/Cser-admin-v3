import http from './configs/http'

const moreApi = {
  getProduct: key => {
    return http.get(`/api/gl/select2?cmd=prod&cate_name=&ignore_all=1&q=${key}`)
  },
  getProductService: key => {
    return http.get(
      `/api/gl/select2?cmd=prod&cate_name=san_pham,dich_vu&ignore_all=1&q=${key}`
    )
  },
  getAllStaffs: key => {
    return http.get(`/api/gl/select2?cmd=user&q=${key}`)
  },
  getStaffs: ({ StockID, key, All }) => {
    return http.get(
      `/api/gl/select2?cmd=user&roles=DV&crstockid=${StockID}&q=${key}${
        All ? '&all=1' : ''
      }`
    )
  },
  getRootServices: ({ MemberID, StockID, Key }) => {
    return http.get(
      `/api/v3/mbook?cmd=getroot&memberid=${MemberID}&ps=15&pi=1&key=${Key}=&stockid=${StockID}`
    )
  },
  getNameConfig: name => {
    return http.get(`/api/v3/config?cmd=getnames&names=${name}&ignore_root=1`)
  },
  uploadFile: (data, name) => {
    return http.post(`/api/v3/file?cmd=upload&rawName=${name || ''}`, data)
  }
}
export default moreApi
