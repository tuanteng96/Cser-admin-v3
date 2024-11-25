import { http } from "../helpers";

const AdminAPI = {
  PointsList: ({ data }) =>
    http.post(`/api/v3/MemberPoint27@Get`, JSON.stringify(data), {
      headers: {
        Authorization: `Bearer ${window.top.token}`,
      },
    }),
  PointsDeleteId: ({ data }) =>
    http.post(`/api/v3/MemberPoint27@delete`, JSON.stringify(data), {
      headers: {
        Authorization: `Bearer ${window.top.token}`,
      },
    }),
  PointsEditId: ({ data }) =>
    http.post(`/api/v3/MemberPoint27@edit`, JSON.stringify(data), {
      headers: {
        Authorization: `Bearer ${window.top.token}`,
      },
    }),
  PointsConvert: ({ data }) =>
    http.post(`/api/v3/MemberPoint27@convert`, JSON.stringify(data), {
      headers: {
        Authorization: `Bearer ${window.top.token}`,
      },
    }),
};

export default AdminAPI;
