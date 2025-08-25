import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useInfiniteQuery, useQuery } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import moment from "moment";
import vi from "date-fns/locale/vi";
import { PriceHelper } from "../../../../helpers/PriceHelper";
import Table, { AutoResizer } from "react-base-table";
import ExcelHepers from "../../../../helpers/ExcelHepers";
import { Form, Formik } from "formik";
import { v4 as uuidv4 } from "uuid";

var loading = (text, callback) => {
  callback && callback();
};

let formatArray = {
  useInfiniteQuery: (page, key = "data") => {
    let newPages = [];
    if (!page || !page[0]) return newPages;
    for (let items of page) {
      for (let x of items[key]) {
        newPages.push(x);
      }
    }
    return newPages;
  },
};

// const getDateToFrom = ({ checkout_time, CrDate }) => {
//   let isSkips = false;

//   let DateStart = null;
//   let DateEnd = null;

//   if (checkout_time) {
//     if (moment(CrDate).diff(moment(), "days") < 0) {
//       DateStart = moment(CrDate)
//         .set({
//           hours: checkout_time.split(";")[1].split(":")[0],
//           minute: checkout_time.split(";")[1].split(":")[1],
//           second: "00",
//         })
//         .format("DD/MM/YYYY HH:mm:ss");
//       DateEnd = moment(CrDate)
//         .add(1, "days")
//         .set({
//           hours: checkout_time.split(";")[1].split(":")[0],
//           minute: checkout_time.split(";")[1].split(":")[1],
//           second: "00",
//         })
//         .format("DD/MM/YYYY HH:mm:ss");
//     } else {
//       let CrIn = moment()
//         .subtract(1, "days")
//         .set({
//           hours: checkout_time.split(";")[0].split(":")[0],
//           minute: checkout_time.split(";")[0].split(":")[1],
//         });
//       let CrInEnd = moment()
//         .subtract(1, "days")
//         .set({
//           hours: "23",
//           minute: "59",
//         });
//       let CrOut = moment().set({
//         hours: "00",
//         minute: "00",
//       });
//       let CrOutEnd = moment().set({
//         hours: checkout_time.split(";")[1].split(":")[0],
//         minute: checkout_time.split(";")[1].split(":")[1],
//       });

//       let now = moment();

//       if (now.isBetween(CrIn, CrInEnd, null, "[]")) {
//         DateEnd = moment(CrDate)
//           .add(1, "days")
//           .set({
//             hours: checkout_time.split(";")[1].split(":")[0],
//             minute: checkout_time.split(";")[1].split(":")[1],
//             second: "00",
//           })
//           .format("DD/MM/YYYY HH:mm:ss");
//       } else if (now.isBetween(CrOut, CrOutEnd, null, "[]")) {
//         isSkips = true;
//         DateStart = moment(CrDate)
//           .subtract(1, "days")
//           .set({
//             hours: checkout_time.split(";")[1].split(":")[0],
//             minute: checkout_time.split(";")[1].split(":")[1],
//             second: "00",
//           })
//           .format("DD/MM/YYYY HH:mm:ss");
//         DateEnd = moment(CrDate)
//           .set({
//             hours: checkout_time.split(";")[1].split(":")[0],
//             minute: checkout_time.split(";")[1].split(":")[1],
//             second: "00",
//           })
//           .format("DD/MM/YYYY HH:mm:ss");
//       } else {
//         DateStart = moment(CrDate)
//           .set({
//             hours: checkout_time.split(";")[1].split(":")[0],
//             minute: checkout_time.split(";")[1].split(":")[1],
//             second: "00",
//           })
//           .format("DD/MM/YYYY HH:mm:ss");
//         DateEnd = moment(CrDate)
//           .add(1, "days")
//           .set({
//             hours: checkout_time.split(";")[1].split(":")[0],
//             minute: checkout_time.split(";")[1].split(":")[1],
//             second: "00",
//           })
//           .format("DD/MM/YYYY HH:mm:ss");
//       }
//     }
//   }
//   return {
//     isSkips,
//     DateStart,
//     DateEnd,
//   };
// };

const getDateToFromV2 = ({ checkout_time, DateStart, DateEnd }) => {
  let isSkips = false;

  let newDateStart = null;
  let newDateEnd = null;

  if (checkout_time) {
    if (DateStart) {
      if (
        moment().format("DD-MM-YYYY") === moment(DateStart).format("DD-MM-YYYY")
      ) {
        let CrOut = moment().set({
          hours: "00",
          minute: "00",
        });
        let CrOutEnd = moment().set({
          hours: checkout_time.split(";")[1].split(":")[0],
          minute: checkout_time.split(";")[1].split(":")[1],
        });

        let now = moment();

        if (now.isBetween(CrOut, CrOutEnd, null, "[]")) {
          newDateStart = moment(DateStart)
            .subtract(1, "days")
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
              second: "00",
            })
            .toDate();
        } else {
          newDateStart = moment(DateStart)
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
              second: "00",
            })
            .toDate();
        }
      } else {
        newDateStart = moment(DateStart)
          .set({
            hours: "00",
            minute: "00",
            second: "00",
          })
          .toDate();
      }
    }
    if (DateEnd) {
      if (
        moment().format("DD-MM-YYYY") === moment(DateEnd).format("DD-MM-YYYY")
      ) {
        let CrIn = moment()
          .subtract(1, "days")
          .set({
            hours: checkout_time.split(";")[0].split(":")[0],
            minute: checkout_time.split(";")[0].split(":")[1],
          });
        let CrInEnd = moment()
          .subtract(1, "days")
          .set({
            hours: "23",
            minute: "59",
          });
        let CrOut = moment().set({
          hours: "00",
          minute: "00",
        });
        let CrOutEnd = moment().set({
          hours: checkout_time.split(";")[1].split(":")[0],
          minute: checkout_time.split(";")[1].split(":")[1],
        });

        let now = moment();

        if (now.isBetween(CrIn, CrInEnd, null, "[]")) {
          newDateEnd = moment(DateEnd)
            .add(1, "days")
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
              second: "00",
            })
            .toDate();
        } else if (now.isBetween(CrOut, CrOutEnd, null, "[]")) {
          isSkips = true;
          newDateEnd = moment(DateEnd)
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
              second: "00",
            })
            .toDate();
        } else {
          newDateEnd = moment(DateEnd)
            .add(1, "days")
            .set({
              hours: checkout_time.split(";")[1].split(":")[0],
              minute: checkout_time.split(";")[1].split(":")[1],
              second: "00",
            })
            .toDate();
        }
      } else {
        newDateEnd = moment(DateEnd)
          .set({
            hours: "23",
            minute: "59",
            second: "59",
          })
          .toDate();
      }
    }
  } else {
    newDateStart = DateStart
      ? moment(DateStart)
          .set({
            hours: "00",
            minute: "00",
            second: "00",
          })
          .toDate()
      : null;
    newDateEnd = DateEnd
      ? moment(DateEnd)
          .set({
            hours: "23",
            minute: "59",
            second: "59",
          })
          .toDate()
      : null;
  }
  return {
    isSkips,
    DateStart: newDateStart,
    DateEnd: newDateEnd,
  };
};

function PickerReportMassageV2({ children }) {
  const { AuthCrStockID, checkout_time, GlobalConfig } = useSelector(
    ({ Auth, JsonConfig }) => ({
      AuthCrStockID: Auth.CrStockID,
      GTimeOpen: JsonConfig?.APP?.Working?.TimeOpen || "00:00:00",
      GTimeClose: JsonConfig?.APP?.Working?.TimeClose || "23:59:00",
      checkout_time: JsonConfig?.Admin?.checkout_time || "",
      GlobalConfig: JsonConfig,
    })
  );

  const [visible, setVisible] = useState(false);

  const [isExport, setIsExport] = useState(false);

  const [isExport2, setIsExport2] = useState(false);

  const [filters, setFilters] = useState({
    DateStart: null,
    DateEnd: null,
  });

  let elRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setFilters({
        DateStart: new Date(),
        DateEnd: new Date(),
      });
    } else {
      setFilters({
        DateStart: null,
        DateEnd: null,
      });
    }
  }, [visible]);

  const columns = useMemo(
    () => [
      {
        key: "Id",
        title: "ID Đơn hàng",
        dataKey: "Id",
        cellRenderer: ({ rowData }) => <div>#{rowData.Id}</div>,
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "UserFullName",
        title: "Nhân viên bán",
        dataKey: "UserFullName",
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "AffName",
        title: "Người giới thiệu",
        dataKey: "AffName",
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "CreateDate",
        title: "Thời gian",
        dataKey: "CreateDate",
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format("HH:mm DD/MM/YYYY"),
        width: 160,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "MemberName",
        title: "Tên khách hàng",
        dataKey: "MemberName",
        cellRenderer: ({ rowData }) => rowData.MemberName || "Không có tên",
        width: 250,
        sortable: false,
      },
      {
        key: "MemberPhone",
        title: "Số điện thoại",
        dataKey: "MemberPhone",
        cellRenderer: ({ rowData }) => rowData.MemberPhone || "Không có",
        width: 160,
        sortable: false,
      },
      {
        key: "IsNewMember",
        title: "Loại Cũ / Mới (ĐG)",
        dataKey: "IsNewMember",
        cellRenderer: ({ rowData }) => getInfoSource(rowData).IsMember,
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "Gioitinh",
        title: "Loại Cũ / Mới (KH)",
        dataKey: "Gioitinh",
        cellRenderer: ({ rowData }) => {
          if (rowData?.Gioitinh) {
            return rowData?.Gioitinh === 1 ? "Khách mới" : "Khách cũ";
          }
          return <></>;
        },
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "GetSource",
        title: "Nguồn KH (ĐG)",
        dataKey: "GetSource",
        cellRenderer: ({ rowData }) => getInfoSource(rowData).Source,
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "Source",
        title: "Nguồn KH (NV)",
        dataKey: "Source",
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "Jobs",
        title: "Quốc gia",
        dataKey: "Jobs",
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "ToPay",
        title: "Giá trị tổng (ĐH)",
        dataKey: "ToPay",
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ToPay),
        width: 180,
        sortable: false,
      },
      {
        key: "TIP",
        title: "Giá trị TIP (ĐH)",
        dataKey: "TIP",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(getTIP(rowData));
        },
        width: 180,
        sortable: false,
      },
      {
        key: "PHI_DICH_VU",
        title: "Phí dịch vụ",
        dataKey: "PHI_DICH_VU",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(getPHI_DICH_VU(rowData));
        },
        width: 180,
        sortable: false,
      },
      {
        key: "PHI_QUET_THE",
        title: "Phí quẹt thẻ",
        dataKey: "PHI_QUET_THE",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(getPHI_QUET_THE(rowData));
        },
        width: 180,
        sortable: false,
      },
      {
        key: "TOTAL/SP/DV",
        title: "Giá trị SP/DV (ĐH)",
        dataKey: "TOTAL/SP/DV",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(
            rowData.ToPay -
              getTIP(rowData) -
              getPHI_DICH_VU(rowData) -
              getPHI_QUET_THE(rowData)
          );
        },
        width: 180,
        sortable: false,
      },
      {
        key: "gg",
        title: "Giảm giá (ĐH)",
        dataKey: "gg",
        cellRenderer: ({ rowData }) => {
          let Total = 0;
          let newOi = rowData.MetaJSON ? JSON.parse(rowData.MetaJSON) : [];

          newOi = newOi?.oi || [];

          newOi = newOi.filter(
            (x) =>
              x.name !== "TIP" &&
              x.name !== "Phí quẹt thẻ" &&
              x.name !== "Phí dịch vụ"
          );

          if (newOi && newOi.length > 0) {
            Total = newOi
              .filter((x) => x.p > 0)
              .map((x) => x.p * x.qty - x.tp)
              .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
              );
          }
          return PriceHelper.formatVND(Total > 0 ? Math.abs(Total) : 0);
        },
        width: 180,
        sortable: false,
      },
      {
        key: "DaThToan_TM",
        title: "TT Tiền mặt",
        dataKey: "DaThToan_TM",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(rowData.DaThToan_TM);
        },
        width: 180,
        sortable: false,
      },
      {
        key: "DaThToan_CK",
        title: "TT Chuyển khoản",
        dataKey: "DaThToan_CK",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(rowData.DaThToan_CK);
        },
        width: 180,
        sortable: false,
      },
      {
        key: "DaThToan_QT",
        title: "TT Quẹt thẻ",
        dataKey: "DaThToan_QT",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(rowData.DaThToan_QT);
        },
        width: 180,
        sortable: false,
      },
      {
        key: "DaThToan_Vi",
        title: "TT Ví",
        dataKey: "DaThToan_Vi",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(Math.abs(rowData.DaThToan_Vi));
        },
        width: 180,
        sortable: false,
      },
      {
        key: "DaThToan_ThTien",
        title: "TT Thẻ tiền",
        dataKey: "DaThToan_ThTien",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(rowData.DaThToan_ThTien);
        },
        width: 180,
        sortable: false,
      },
      {
        key: "ConNo",
        title: "Còn nợ",
        dataKey: "ConNo",
        cellRenderer: ({ rowData }) => PriceHelper.formatVND(rowData.ConNo),
        width: 180,
        sortable: false,
      },
      {
        key: "Prod",
        title: "Chi tiết đơn hàng",
        dataKey: "Prod",
        cellRenderer: ({ rowData }) => {
          let newOi = rowData.MetaJSON ? JSON.parse(rowData.MetaJSON) : [];

          newOi = newOi?.oi || [];

          newOi = newOi.filter(
            (x) =>
              x.name !== "TIP" &&
              x.name !== "Phí dịch vụ" &&
              x.name !== "Phí quẹt thẻ"
          );

          return (
            <div>
              {newOi.map((x) => (
                <div>
                  {x.name} (x{x.qty})
                </div>
              ))}
            </div>
          );
        },
        width: 300,
        sortable: false,
      },
      {
        key: "Services",
        title: "Dịch vụ / Nhân viên",
        dataKey: "Services",
        cellRenderer: ({ rowData }) => {
          return (
            <div>
              {getServices(rowData)
                .Staffs.split(",")
                .map((x) => (
                  <div>{x}</div>
                ))}
            </div>
          );
        },
        width: 350,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "Rate",
        title: "Đánh giá",
        dataKey: "Rate",
        width: 150,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
        cellRenderer: ({ rowData }) => {
          return getServices(rowData).Rate;
        },
      },
      {
        key: "RateNote",
        title: "Nội dung",
        dataKey: "RateNote",
        cellRenderer: ({ rowData }) => {
          return getServices(rowData).RateNote;
        },
        width: 350,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: ["ListCurrentCalendars", { visible, filters }],
    queryFn: async () => {
      let { DateStart, DateEnd, isSkips } = getDateToFromV2({
        ...filters,
        checkout_time,
      });

      let { result: rs1 } = await CalendarCrud.getReportOverallSales({
        DateStart: moment(DateStart).format("DD/MM/YYYY HH:mm:ss"),
        DateEnd: moment(DateEnd).format("DD/MM/YYYY HH:mm:ss"),
        StockID: AuthCrStockID,
      });
      let { result: rs2 } = await CalendarCrud.getReportSellOut({
        StockID: AuthCrStockID,
        DateStart: moment(DateStart).format("DD/MM/YYYY HH:mm:ss"),
        DateEnd: moment(DateEnd).format("DD/MM/YYYY HH:mm:ss"),
        BrandIds: "",
        CategoriesIds: "",
        ProductIds: "",
        TimeToReal: 1,
        Voucher: "",
        Payment: "",
        IsMember: "",
      });
      let { result: rs3 } = await CalendarCrud.getReportService({
        StockID: AuthCrStockID,
        DateStart: moment(DateStart).format("DD/MM/YYYY HH:mm:ss"),
        DateEnd: moment(DateEnd).format("DD/MM/YYYY HH:mm:ss"),
        Pi: 1,
        Ps: 5000,
        MemberID: "",
        Status: "",
        Warranty: "",
        StaffID: "",
        StarRating: "",
        Dich_vu_chuyen_doi_khong_hop_le: 0,
        IsMemberSet: "",
        CardServiceID: "",
        ServiceOriginalID: "",
        TransfUserID: "",
        ShowsX: "2",
      });

      let { list: rs4 } = await CalendarCrud.getAllWorkSheet({
        From: moment()
          .subtract(isSkips ? 1 : 0, "days")
          .format("DD/MM/YYYY"),
        To: moment()
          .subtract(isSkips ? 1 : 0, "days")
          .format("DD/MM/YYYY"),
        StockID: AuthCrStockID,
        key: "",
      });

      let TIP = null;
      let PHI_QUET_THE = null;
      let PHI_DICH_VU = null;

      if (rs2 && rs2.length > 0) {
        let index = rs2.findIndex(
          (x) => x.Format === 1 && x.ProdTitle === "TIP"
        );
        if (index > -1) {
          TIP = rs2[index];
        }
        let indexQT = rs2.findIndex(
          (x) => x.Format === 1 && x.ProdTitle === "Phí quẹt thẻ"
        );
        if (indexQT > -1) {
          PHI_QUET_THE = rs2[indexQT];
        }
        let indexDV = rs2.findIndex(
          (x) => x.Format === 1 && x.ProdTitle === "Phí dịch vụ"
        );
        if (indexDV > -1) {
          PHI_DICH_VU = rs2[indexDV];
        }
      }

      let CheckIns = rs4.map((x) => ({
        UserID: x.UserID,
        CheckIn: x.Dates[0].WorkTrack?.CheckIn || "",
        CheckOut: x.Dates[0].WorkTrack?.CheckOut || "",
        FullName: x.FullName,
      }));

      let STAFFS = [];
      let SERVICES = [];

      if (rs3?.Items && rs3?.Items.length > 0) {
        for (let item of rs3.Items) {
          if (item.StaffSalaries && item.StaffSalaries.length > 0) {
            for (let staff of item.StaffSalaries) {
              let index = STAFFS.findIndex((x) => x.ID === staff?.StaffId);
              if (index > -1) {
                STAFFS[index].Items = [...STAFFS[index].Items, item];
              } else {
                STAFFS.push({
                  FullName: staff?.FullName,
                  ID: staff?.StaffId,
                  Items: [item],
                });
              }
            }
          }
          let indexSv = SERVICES.findIndex(
            (x) => x?.ProServiceId === item?.ProServiceId
          );
          if (indexSv > -1) {
            SERVICES[indexSv].Items = [...SERVICES[indexSv].Items, item];
          } else {
            SERVICES.push({
              ProServiceId: item?.ProServiceId,
              ProServiceName: item?.ProServiceName,
              Items: [item],
            });
          }
        }
      }

      for (let u of CheckIns) {
        let index = STAFFS.findIndex((x) => x.ID === u.UserID);
        if (index > -1) {
          STAFFS[index].FullName = u?.FullName;
          STAFFS[index].ID = u?.UserID;
          STAFFS[index].CheckIn = u?.CheckIn || null;
          STAFFS[index].CheckOut = u?.CheckOut || null;
        } else {
          if (u?.CheckIn) {
            STAFFS.push({
              FullName: u?.FullName,
              ID: u?.UserID,
              CheckIn: u?.CheckIn || null,
              CheckOut: u?.CheckOut || null,
              Items: [],
            });
          }
        }
      }
      STAFFS = STAFFS.map((x) => ({
        ...x,
        ValueOf: x.CheckIn ? moment(x.CheckIn).valueOf() : -1,
      })).sort((a, b) => a.ValueOf - b.ValueOf);

      return {
        Today: {
          ...rs1,
          TIP,
          PHI_DICH_VU,
          PHI_QUET_THE,
          TIPs:
            rs2 && rs2.length > 0
              ? rs2.filter(
                  (x) => x.Format === 1 && x.ProdTitle.indexOf("TIP") > -1
                )
              : [],
          DV_CONG_THEM:
            rs2 && rs2.length > 0
              ? rs2.filter(
                  (x) =>
                    x.Format === 1 &&
                    x.IsCourse &&
                    x.ProdTitle.indexOf("TIP") === -1 &&
                    x.ProdTitle !== "Phí dịch vụ" &&
                    x.ProdTitle !== "Phí quẹt thẻ"
                )
              : [],
          SP_BAN_RA:
            rs2 && rs2.length > 0
              ? rs2.filter(
                  (x) =>
                    x.Format === 1 &&
                    x.ProdTitle.indexOf("TIP") === -1 &&
                    !x.IsCourse
                )
              : [],
          DV_BAN_RA:
            rs2 && rs2.length > 0
              ? rs2.filter(
                  (x) =>
                    x.Format === 2 &&
                    x.ProdTitle.toUpperCase().indexOf("COMBO") === -1
                )
              : [],
          COMBOS:
            rs2 && rs2.length > 0
              ? rs2.filter(
                  (x) =>
                    x.Format === 2 &&
                    x.ProdTitle.toUpperCase().indexOf("COMBO") > -1
                )
              : [],
          THE_TIEN:
            rs2 && rs2.length > 0 ? rs2.filter((x) => x.Format === 3) : [],
        },
        STAFFS: [
          ...STAFFS.filter((x) => x.ValueOf > 0),
          ...STAFFS.filter((x) => x.ValueOf < 0),
        ],
        SERVICES,
        filters: {
          DateStart: DateStart || moment().format("DD/MM/YYYY HH:mm"),
          DateEnd: DateEnd || moment().format("DD/MM/YYYY HH:mm"),
        },
      };
    },
    enabled:
      Boolean(filters && filters?.DateStart && filters?.DateEnd) && visible,
    keepPreviousData: true,
  });

  const Orders = useInfiniteQuery({
    queryKey: ["ListCurrentOrdersCalendars", { filters }],
    queryFn: async ({ pageParam = 1 }) => {
      let { DateStart, DateEnd } = getDateToFromV2({
        ...filters,
        checkout_time,
      });
      let rs = await CalendarCrud.getReportOrdersSales({
        _Method_: "Reports.v2.Ban_Hang.GetBCao_DSo_DSach2",
        StockID: AuthCrStockID,
        DateStart: moment(DateStart).format("DD/MM/YYYY HH:mm:ss"),
        DateEnd: moment(DateEnd).format("DD/MM/YYYY HH:mm:ss"),
        Pi: pageParam,
        Ps: 20,
        Voucher: "",
        Payment: "",
        IsMember: "",
        MemberID: "",
        SourceName: "",
        ShipCode: "",
        ShowsX: "2",
        DebtFrom: null,
        DebtTo: null,
        no: "",
      });
      let { data: rsRooms } = await CalendarCrud.getConfigName(`room`);
      let RoomsList =
        rsRooms && rsRooms.length > 0 && rsRooms[0].Value
          ? JSON.parse(rsRooms[0].Value)
          : null;
      let Rooms = [];
      for (let st of RoomsList) {
        if (st?.ListRooms && st?.ListRooms.length > 0) {
          for (let room of st?.ListRooms) {
            if (room.Children && room.Children.length > 0) {
              for (let r of room.Children) {
                Rooms.push(r);
              }
            }
          }
        }
      }
      let newItems =
        rs.Items && rs.Items.length > 0
          ? rs.Items.map((x) => {
              let obj = { ...x, id: uuidv4() };
              if (x.Services && x.Services.length > 0) {
                obj.Services = obj.Services
                  ? obj.Services.map((k) => {
                      let sv = { ...k };
                      if (sv.RoomID) {
                        let index = Rooms.findIndex((o) => o.ID === sv.RoomID);
                        if (index > -1) sv.RoomTitle = Rooms[index].label;
                      }
                      return sv;
                    })
                  : [];
              }
              return obj;
            })
          : [];
      return rs ? { ...rs, Items: newItems, Pi: pageParam } : null;
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage?.Pi === lastPage?.PCount ? undefined : lastPage.Pi + 1,
    keepPreviousData: true,
    enabled:
      Boolean(filters && filters?.DateStart && filters?.DateEnd) && visible,
  });

  const Lists = formatArray.useInfiniteQuery(Orders?.data?.pages, "Items");

  const onHide = () => setVisible(false);

  const getTIP = (rowData) => {
    let TIP = 0;
    if (rowData.MetaJSON) {
      let PeJson = JSON.parse(rowData.MetaJSON);
      if (PeJson.oi && PeJson.oi.length > 0) {
        let index = PeJson.oi.findIndex((x) => x.name === "TIP");
        if (index > -1) {
          TIP = PeJson.oi[index].tp;
        }
      }
    }
    return TIP;
  };

  const getPHI_DICH_VU = (rowData) => {
    let Value = 0;
    if (rowData.MetaJSON) {
      let PeJson = JSON.parse(rowData.MetaJSON);
      if (PeJson.oi && PeJson.oi.length > 0) {
        let index = PeJson.oi.findIndex((x) => x.name === "Phí dịch vụ");
        if (index > -1) {
          Value = PeJson.oi[index].tp;
        }
      }
    }
    return Value;
  };

  const getPHI_QUET_THE = (rowData) => {
    let Value = 0;
    if (rowData.MetaJSON) {
      let PeJson = JSON.parse(rowData.MetaJSON);
      if (PeJson.oi && PeJson.oi.length > 0) {
        let index = PeJson.oi.findIndex((x) => x.name === "Phí quẹt thẻ");
        if (index > -1) {
          Value = PeJson.oi[index].tp;
        }
      }
    }
    return Value;
  };

  const getServices = (rowData) => {
    let Staffs = "";
    let RateNote = "";
    let RateNotes = "";
    let Rate = "";

    if (rowData.Services && rowData.Services.length > 0) {
      RateNote = rowData.Services[0].RateNote || "";
      RateNotes = RateNote;
      if (RateNote.indexOf("Đã từng trả nghiệm dịch vụ") > -1) {
        RateNote = RateNote.slice(
          0,
          RateNote.indexOf("Đã từng trả nghiệm dịch vụ")
        );
      } else if (RateNote.indexOf("Biết đến từ") > -1) {
        RateNote = RateNote.slice(0, RateNote.indexOf("Biết đến từ"));
      }

      RateNote = RateNote.split(",")
        .filter((x) => x && x !== " " && x !== ". ")
        .join(", ");

      Staffs = rowData.Services.map((x) => {
        let StaffStr = "";
        let Salary = x.SalaryJSON ? JSON.parse(x.SalaryJSON) : null;
        if (Salary && Salary.salaryList && Salary.salaryList.length > 0) {
          StaffStr = Salary.salaryList.map((o) => o.StaffName).join(", ");
        }

        return (
          `${x.OrderTitle}` +
          (StaffStr ? ` (${StaffStr})` : "") +
          (x.RoomTitle ? ` (${x.RoomTitle})` : "")
        );
      })
        .filter((x) => x)
        .join(",");
      if (rowData.Services.some((x) => x.Rate)) {
        Rate = rowData.Services.map((x) => x.Rate).sort((a, b) => b - a)[0];
      }
    }

    return {
      Staffs,
      RateNote,
      Rate: Rate ? `${Rate} sao` : "",
      RateNotes,
    };
  };

  const getInfoSource = (rowData) => {
    let Source = "";
    let IsMember = "";
    let Desc = getServices(rowData).RateNotes;

    if (Desc) {
      let DescSplit = Desc.split(",");
      let index = DescSplit.findIndex(
        (x) => x.indexOf("Đã từng trả nghiệm dịch vụ") > -1
      );

      if (index > -1) {
        if (DescSplit[index].indexOf("Chưa từng") > -1) {
          IsMember = "Khách mới";
        } else {
          IsMember = "Khách cũ";
        }
      }
      let index2 = DescSplit.findIndex((x) => x.indexOf("Biết đến từ") > -1);
      if (index2 > -1) {
        Source = DescSplit[index2]
          .match(/\((.*?)\)/g)
          .map((b) => b.replace(/\(|(.*?)\)/g, "$1"))
          .join("");
      }
    }
    return {
      IsMember,
      Source,
    };
  };

  const sumArrayPrice = (arr, key) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce(
      (total, item) => total + (Math.abs(Number(item[key])) || 0),
      0
    );
  };

  const exportExcel = async () => {
    // let { DateStart, DateEnd, isSkips } = getDateToFromV2({
    //   ...filters,
    //   checkout_time,
    // });
    // ExcelHepers.dataToExcel(
    //   `Báo cáo doanh thu ${moment(DateStart).format("DD MM YYYY")} - ${moment(
    //     DateEnd
    //   ).format("DD MM YYYY")}`,
    //   (sheet, workbook) => {
    //     let table = {
    //       title: "BÁO CÁO DOANH THU",
    //       headers: [
    //         [
    //           "STT",
    //           "NGÀY THÁNG",
    //           "DOANH THU",
    //           "PHÂN LOẠI",
    //           "LƯỢT KHÁCH",
    //           "GHI CHÚ",
    //         ],
    //         [
    //           "DOANH THU JSPA",
    //           "QUẸT THẺ",
    //           "TIP",
    //           "TỔNG TIỀN",
    //           "TIỀN MẶT",
    //           "CHUYỂN KHOẢN",
    //           "QUẸT THẺ",
    //           "TỔNG CỘNG",
    //           "DỊCH VỤ",
    //           "COMBO",
    //           "SẢN PHẨM",
    //           "TỔNG CỘNG",
    //         ],
    //       ],
    //       data: [],
    //       formatters: [3, 4, 5], // Cột Số lượng và Thành tiền sẽ được định dạng số
    //     };

    //     // Thiết lập số dòng và cột
    //     sheet.setRowCount(4);
    //     sheet.setColumnCount(15);

    //     // Dòng 1: Tiêu đề lớn, merge toàn bộ cột
    //     sheet.setValue(0, 0, "BÁO CÁO DOANH THU");
    //     sheet.addSpan(0, 0, 1, 6); // colspan 6 cột

    //     // Dòng 2: Header với rowspan và colspan
    //     sheet.setValue(1, 0, "STT");
    //     sheet.addSpan(1, 0, 2, 1); // rowspan 2 dòng cho STT

    //     sheet.setValue(1, 1, "Ngày tháng");
    //     sheet.addSpan(1, 1, 2, 1); // rowspan 2 dòng cho STT

    //     sheet.setValue(1, 2, "Doanh thu");
    //     sheet.addSpan(1, 2, 1, 4); // colspan 4 cột cho Thông tin

    //     sheet.setValue(1, 6, "Phân loại");
    //     sheet.addSpan(1, 6, 1, 4); // colspan 4 cột cho Doanh thu

    //     sheet.setValue(1, 10, "Lượt khách");
    //     sheet.addSpan(1, 10, 1, 4); // colspan 4 cột cho Doanh thu

    //     sheet.setValue(1, 14, "Ghi chú");
    //     sheet.addSpan(1, 14, 2, 1); // colspan 4 cột cho Doanh thu

    //     // Dòng 3: Header con
    //     sheet.setValue(2, 2, "Doanh thu Jspa");
    //     sheet.setValue(2, 3, "Quẹt thẻ");
    //     sheet.setValue(2, 4, "Tip");
    //     sheet.setValue(2, 5, "Tổng tiền");
    //     sheet.setValue(2, 6, "Tiền mặt");
    //     sheet.setValue(2, 7, "Chuyển khoản");
    //     sheet.setValue(2, 8, "Quẹt thẻ");
    //     sheet.setValue(2, 9, "Tổng cộng");
    //     sheet.setValue(2, 10, "Dịch vụ");
    //     sheet.setValue(2, 11, "Combo");
    //     sheet.setValue(2, 12, "Sản phẩm");
    //     sheet.setValue(2, 13, "Tổng cộng");

    //     sheet.autoFitRow(0);
    //   }
    // );

    loading &&
      loading("Đang thực hiện ...", async () => {
        setIsExport2(true);
        let { DateStart, DateEnd, isSkips } = getDateToFromV2({
          ...filters,
          checkout_time,
        });

        let { result: rs1 } = await CalendarCrud.getReportOverallSales({
          DateStart: moment(DateStart).format("DD/MM/YYYY HH:mm:ss"),
          DateEnd: moment(DateEnd).format("DD/MM/YYYY HH:mm:ss"),
          StockID: AuthCrStockID,
        });
        let { result: rs2 } = await CalendarCrud.getReportSellOut({
          StockID: AuthCrStockID,
          DateStart: moment(DateStart).format("DD/MM/YYYY HH:mm:ss"),
          DateEnd: moment(DateEnd).format("DD/MM/YYYY HH:mm:ss"),
          BrandIds: "",
          CategoriesIds: "",
          ProductIds: "",
          TimeToReal: 1,
          Voucher: "",
          Payment: "",
          IsMember: "",
        });
        let { result: rs3 } = await CalendarCrud.getReportService({
          StockID: AuthCrStockID,
          DateStart: moment(DateStart).format("DD/MM/YYYY HH:mm:ss"),
          DateEnd: moment(DateEnd).format("DD/MM/YYYY HH:mm:ss"),
          Pi: 1,
          Ps: 5000,
          MemberID: "",
          Status: "",
          Warranty: "",
          StaffID: "",
          StarRating: "",
          Dich_vu_chuyen_doi_khong_hop_le: 0,
          IsMemberSet: "",
          CardServiceID: "",
          ServiceOriginalID: "",
          TransfUserID: "",
          ShowsX: "2",
        });

        let { list: rs4 } = await CalendarCrud.getAllWorkSheet({
          From: moment()
            .subtract(isSkips ? 1 : 0, "days")
            .format("DD/MM/YYYY"),
          To: moment()
            .subtract(isSkips ? 1 : 0, "days")
            .format("DD/MM/YYYY"),
          StockID: AuthCrStockID,
          key: "",
        });

        let { result: THUs } = await CalendarCrud.getRevenueEndExpenditure({
          StockID: AuthCrStockID,
          DateStart: moment(DateStart).format("DD/MM/YYYY"),
          DateEnd: moment(DateEnd).format("DD/MM/YYYY"),
          Pi: 1,
          Ps: 5000,
          PaymentMethods: "",
          TypeTC: 0,
          TagsTC: "THU",
          CustomType: "",
          ShowsX: "2",
        });

        let { result: CHIs } = await CalendarCrud.getRevenueEndExpenditure({
          StockID: AuthCrStockID,
          DateStart: moment(DateStart).format("DD/MM/YYYY"),
          DateEnd: moment(DateEnd).format("DD/MM/YYYY"),
          Pi: 1,
          Ps: 5000,
          PaymentMethods: "",
          TypeTC: 1,
          TagsTC: "CHI",
          CustomType: "",
          ShowsX: "2",
        });

        let TIP = null;
        let PHI_QUET_THE = null;
        let PHI_DICH_VU = null;

        if (rs2 && rs2.length > 0) {
          let index = rs2.findIndex(
            (x) => x.Format === 1 && x.ProdTitle === "TIP"
          );
          if (index > -1) {
            TIP = rs2[index];
          }
          let indexQT = rs2.findIndex(
            (x) => x.Format === 1 && x.ProdTitle === "Phí quẹt thẻ"
          );
          if (indexQT > -1) {
            PHI_QUET_THE = rs2[indexQT];
          }
          let indexDV = rs2.findIndex(
            (x) => x.Format === 1 && x.ProdTitle === "Phí dịch vụ"
          );
          if (indexDV > -1) {
            PHI_DICH_VU = rs2[indexDV];
          }
        }

        let CheckIns = rs4.map((x) => ({
          UserID: x.UserID,
          CheckIn: x.Dates[0].WorkTrack?.CheckIn || "",
          CheckOut: x.Dates[0].WorkTrack?.CheckOut || "",
          FullName: x.FullName,
        }));

        let STAFFS = [];
        let SERVICES = [];

        if (rs3?.Items && rs3?.Items.length > 0) {
          for (let item of rs3.Items) {
            if (item.StaffSalaries && item.StaffSalaries.length > 0) {
              for (let staff of item.StaffSalaries) {
                let index = STAFFS.findIndex((x) => x.ID === staff?.StaffId);
                if (index > -1) {
                  STAFFS[index].Items = [...STAFFS[index].Items, item];
                } else {
                  STAFFS.push({
                    FullName: staff?.FullName,
                    ID: staff?.StaffId,
                    Items: [item],
                  });
                }
              }
            }
            let indexSv = SERVICES.findIndex(
              (x) => x?.ProServiceId === item?.ProServiceId
            );
            if (indexSv > -1) {
              SERVICES[indexSv].Items = [...SERVICES[indexSv].Items, item];
            } else {
              SERVICES.push({
                ProServiceId: item?.ProServiceId,
                ProServiceName: item?.ProServiceName,
                Items: [item],
              });
            }
          }
        }

        for (let u of CheckIns) {
          let index = STAFFS.findIndex((x) => x.ID === u.UserID);
          if (index > -1) {
            STAFFS[index].FullName = u?.FullName;
            STAFFS[index].ID = u?.UserID;
            STAFFS[index].CheckIn = u?.CheckIn || null;
            STAFFS[index].CheckOut = u?.CheckOut || null;
          } else {
            if (u?.CheckIn) {
              STAFFS.push({
                FullName: u?.FullName,
                ID: u?.UserID,
                CheckIn: u?.CheckIn || null,
                CheckOut: u?.CheckOut || null,
                Items: [],
              });
            }
          }
        }
        STAFFS = STAFFS.map((x) => ({
          ...x,
          ValueOf: x.CheckIn ? moment(x.CheckIn).valueOf() : -1,
        })).sort((a, b) => a.ValueOf - b.ValueOf);

        let result1 = {
          Today: {
            ...rs1,
            TIP,
            PHI_DICH_VU,
            PHI_QUET_THE,
            TIPs:
              rs2 && rs2.length > 0
                ? rs2.filter(
                    (x) => x.Format === 1 && x.ProdTitle.indexOf("TIP") > -1
                  )
                : [],
            DV_CONG_THEM:
              rs2 && rs2.length > 0
                ? rs2
                    .filter(
                      (x) =>
                        x.Format === 1 &&
                        x.IsCourse &&
                        x.ProdTitle.indexOf("TIP") === -1 &&
                        x.ProdTitle !== "Phí dịch vụ" &&
                        x.ProdTitle !== "Phí quẹt thẻ"
                    )
                    .map((x) => ({
                      ...x,
                      ProdType: "Dịch vụ cộng thêm",
                    }))
                : [],
            SP_BAN_RA:
              rs2 && rs2.length > 0
                ? rs2
                    .filter(
                      (x) =>
                        x.Format === 1 &&
                        x.ProdTitle.indexOf("TIP") === -1 &&
                        !x.IsCourse
                    )
                    .map((x) => ({
                      ...x,
                      ProdType: "Sản phẩm",
                    }))
                : [],
            DV_BAN_RA:
              rs2 && rs2.length > 0
                ? rs2
                    .filter(
                      (x) =>
                        x.Format === 2 &&
                        x.ProdTitle.toUpperCase().indexOf("COMBO") === -1
                    )
                    .map((x) => ({
                      ...x,
                      ProdType: "Dịch vụ",
                    }))
                : [],
            COMBOS:
              rs2 && rs2.length > 0
                ? rs2
                    .filter(
                      (x) =>
                        x.Format === 2 &&
                        x.ProdTitle.toUpperCase().indexOf("COMBO") > -1
                    )
                    .map((x) => ({
                      ...x,
                      ProdType: "Combo",
                    }))
                : [],
          },
          STAFFS: [
            ...STAFFS.filter((x) => x.ValueOf > 0),
            ...STAFFS.filter((x) => x.ValueOf < 0),
          ],
          SERVICES,
        };

        ExcelHepers.dataToExcel(
          `Báo cáo doanh thu ${moment(DateStart).format(
            "DD MM YYYY"
          )} - ${moment(DateEnd).format("DD MM YYYY")}`,
          (sheet, workbook) => {
            workbook.suspendPaint();
            workbook.suspendEvent();

            let table1 = {
              title: "BÁN HÀNG",
              headers: [
                "STT",
                "DỊCH VỤ",
                "PHÂN LOẠI",
                "SỐ LƯỢNG",
                "GIẢM GIÁ",
                "THÀNH TIỀN",
              ],
              data: [],
              formatters: [3, 4, 5], // Cột Số lượng và Thành tiền sẽ được định dạng số
            };

            let Sales = [
              ...result1?.Today?.DV_BAN_RA,
              ...result1?.Today?.COMBOS,
              ...result1?.Today?.SP_BAN_RA,
              ...result1?.Today?.DV_CONG_THEM,
            ];

            for (let i = 0; i < Sales.length; i++) {
              let item = Sales[i];
              table1.data.push([
                i + 1,
                item.ProdTitle,
                item.ProdType,
                item.SumQTy,
                item.Giamgia,
                item.SumTopay,
              ]);
            }

            let table2 = {
              title: "THU CHI",
              headers: [
                "KHOẢN",
                "LOẠI",
                "GHI CHÚ",
                "TM",
                "CK",
                "QT",
                "SỐ TIỀN",
              ],
              data: [
                [
                  "THU BÁN HÀNG",
                  "",
                  "",
                  result1?.Today?.DSo_TToan_TMat,
                  result1?.Today?.DSo_TToan_CKhoan,
                  result1?.Today?.DSo_TToan_QThe,
                  result1?.Today?.DSo_TToan_TMat +
                    result1?.Today?.DSo_TToan_CKhoan +
                    result1?.Today?.DSo_TToan_QThe,
                ],
              ],
              formatters: [3, 4, 5, 6], // Cột Số tiền, TM, CK, QT sẽ được định dạng số
            };

            if (THUs?.Items && THUs?.Items.length > 0) {
              for (let i = 0; i < THUs.Items.length; i++) {
                let item = THUs.Items[i];
                table2.data.push([
                  "Thu khác",
                  item.CustomType || "",
                  item.Content || "",
                  item.TM,
                  item.CK,
                  item.QT,
                  item.TM + item.CK + item.QT,
                ]);
              }
            }

            if (CHIs?.Items && CHIs?.Items.length > 0) {
              for (let i = 0; i < CHIs.Items.length; i++) {
                let item = CHIs.Items[i];
                table2.data.push([
                  "Chi",
                  item.CustomType || "",
                  item.Content || "",
                  Math.abs(item.TM),
                  Math.abs(item.CK),
                  Math.abs(item.QT),
                  Math.abs(item.TM) + Math.abs(item.CK) + Math.abs(item.QT),
                ]);
              }
            }

            let THUs_TONG =
              sumArrayPrice(THUs?.Items, "TM") +
              sumArrayPrice(THUs?.Items, "CK") +
              sumArrayPrice(THUs?.Items, "QT");

            let CHIs_TONG =
              sumArrayPrice(CHIs?.Items, "TM") +
              sumArrayPrice(CHIs?.Items, "CK") +
              sumArrayPrice(CHIs?.Items, "QT");

            table2.data.push([
              "TỔNG THU",
              "",
              "",
              sumArrayPrice(THUs?.Items, "TM"),
              sumArrayPrice(THUs?.Items, "CK"),
              sumArrayPrice(CHIs?.Items, "QT"),
              result1?.Today?.DSo_TToan_TMat +
                result1?.Today?.DSo_TToan_CKhoan +
                result1?.Today?.DSo_TToan_QThe +
                THUs_TONG,
            ]);

            table2.data.push([
              "TỔNG THU",
              "",
              "",
              sumArrayPrice(CHIs?.Items, "TM"),
              sumArrayPrice(CHIs?.Items, "CK"),
              sumArrayPrice(CHIs?.Items, "QT"),
              CHIs_TONG,
            ]);

            table2.data.push([
              "TỒN",
              "",
              "",
              (result1?.Today?.DSo_TToan_TMat || 0) +
                sumArrayPrice(THUs?.Items, "TM") -
                sumArrayPrice(CHIs?.Items, "TM"),

              (result1?.Today?.DSo_TToan_CKhoan || 0) +
                sumArrayPrice(THUs?.Items, "CK") -
                sumArrayPrice(CHIs?.Items, "CK"),

              (result1?.Today?.DSo_TToan_QThe || 0) +
                sumArrayPrice(THUs?.Items, "QT") -
                sumArrayPrice(CHIs?.Items, "QT"),
              result1?.Today?.DSo_TToan_TMat +
                result1?.Today?.DSo_TToan_CKhoan +
                result1?.Today?.DSo_TToan_QThe +
                THUs_TONG -
                CHIs_TONG,
            ]);

            // Thêm tiêu đề lớn ở đầu
            sheet.setValue(
              0,
              0,
              `BÁO CÁO TỪ ${moment(DateStart).format(
                "HH:mm DD/MM/YYYY"
              )} - ${moment(DateEnd).format("HH:mm DD/MM/YYYY")}`
            );
            sheet.getCell(0, 0).font("bold 22pt Arial");
            sheet
              .getCell(0, 0)
              .hAlign(window.GC.Spread.Sheets.HorizontalAlign.center);
            sheet
              .getCell(0, 0)
              .vAlign(window.GC.Spread.Sheets.VerticalAlign.center);
            // Merge tiêu đề qua số cột lớn nhất của các bảng
            sheet.addSpan(
              0,
              0,
              1,
              Math.max(table1.headers.length, table2.headers.length)
            );

            // Auto fit chiều cao tiêu đề lớn
            sheet.autoFitRow(0);

            // Hàm xuất 1 bảng với tiêu đề, header màu nền, border
            function exportTable(
              startRow,
              title,
              headers,
              data,
              formatters = []
            ) {
              // Tiêu đề
              sheet.setValue(startRow, 0, title);
              sheet.getCell(startRow, 0).font("bold 16pt Arial");
              sheet
                .getCell(startRow, 0)
                .hAlign(window.GC.Spread.Sheets.HorizontalAlign.left);
              sheet
                .getCell(startRow, 0)
                .vAlign(window.GC.Spread.Sheets.VerticalAlign.center);

              // Header
              headers.forEach((h, i) => {
                sheet.setValue(startRow + 1, i, h);
                sheet.getCell(startRow + 1, i).backColor("#FFA800");
                sheet.getCell(startRow + 1, i).font("bold 13pt Arial");
                sheet
                  .getCell(startRow + 1, i)
                  .hAlign(window.GC.Spread.Sheets.HorizontalAlign.center);
                sheet
                  .getCell(startRow + 1, i)
                  .vAlign(window.GC.Spread.Sheets.VerticalAlign.center);
              });

              // Data
              data.forEach((row, r) => {
                row.forEach((cell, c) => {
                  sheet.setValue(startRow + 2 + r, c, cell);
                  if (formatters.includes(c)) {
                    sheet.getCell(startRow + 2 + r, c).formatter("#,#");
                  }
                });
              });

              // Border cho toàn bảng (gồm cả header, KHÔNG gồm tiêu đề)
              const totalRows = data.length + 1; // chỉ header + data
              const totalCols = headers.length;
              const border = new window.GC.Spread.Sheets.LineBorder(
                "#000",
                window.GC.Spread.Sheets.LineStyle.thin
              );
              sheet
                .getRange(startRow + 1, 0, totalRows, totalCols)
                .setBorder(border, { all: true });

              // Auto fit height cho từng dòng của bảng này
              for (let r = 0; r < totalRows; r++) {
                sheet.autoFitRow(startRow + r);
              }

              // Trả về dòng bắt đầu cho bảng tiếp theo
              return startRow + totalRows + 2;
            }

            // Hàm xuất bảng không header, không border

            function exportTableNoHeaderNoBorder(
              startRow,
              data,
              leftPadding = 0,
              first = false
            ) {
              data.forEach((row, r) => {
                row.forEach((cell, c) => {
                  sheet.setValue(startRow + r, c + leftPadding, cell);
                  sheet
                    .getCell(startRow + r, c + leftPadding)
                    .font("normal 13pt Arial");
                  if (c === 1 && typeof cell === "number") {
                    sheet
                      .getCell(startRow + r, c + leftPadding)
                      .formatter("#,#");
                    sheet
                      .getCell(startRow + r, c + leftPadding)
                      .font("bold 13pt Arial"); // Số tiền bold
                  }
                });
                sheet.autoFitRow(startRow + r);
              });

              // Thêm border cho toàn bảng giữa
              if (data.length > 0) {
                const lastRow = startRow + data.length - 1;
                for (let c = 0; c < data[0].length; c++) {
                  if (!first) {
                    sheet
                      .getCell(lastRow, c + leftPadding)
                      .backColor("#F64E60");
                    sheet
                      .getCell(lastRow, c + leftPadding)
                      .font("bold 14pt Arial");
                  }
                  else {
                    sheet
                      .getCell(startRow, c + leftPadding)
                      .font("bold 14pt Arial");
                  }
                }

                const border = new window.GC.Spread.Sheets.LineBorder(
                  "#000",
                  window.GC.Spread.Sheets.LineStyle.thin
                );
                sheet
                  .getRange(startRow, leftPadding, data.length, data[0].length)
                  .setBorder(border, { all: true });
              }
              return startRow + data.length + 2;
            }

            // Xuất bảng 1
            let nextRow = exportTable(
              2,
              table1.title,
              table1.headers,
              table1.data,
              table1.formatters
            );
            // Xuất bảng giữa không header, không border
            let middleTable = [
              [
                "TIỀN SPA",
                (result1?.Today?.DSo_Ngay || 0) -
                  (result1?.Today?.TIP?.SumTopay || 0) -
                  (result1?.Today?.PHI_QUET_THE?.SumTopay || 0) -
                  (result1?.Today?.PHI_DICH_VU?.SumTopay || 0),
              ],
              ["TIỀN TIP", result1?.Today?.TIP?.SumTopay || 0],
              ["TIỀN QUẸT THẺ", result1?.Today?.PHI_QUET_THE?.SumTopay || 0],
              ["TỔNG TIỀN", result1?.Today?.DSo_Ngay || 0],
            ];
            nextRow = exportTableNoHeaderNoBorder(nextRow - 1, middleTable, 4);

            let middleTable2 = [
              ["TỔNG GIẢM GIÁ", sumArrayPrice(Sales, "Giamgia"),],
              ["TỔNG DỊCH VỤ", sumArrayPrice(result1?.Today?.DV_BAN_RA, "SumQTy")],
              ["TỔNG COMBO", sumArrayPrice(result1?.Today?.COMBOS, "SumQTy")],
              ["TỔNG SẢN PHẨM", sumArrayPrice(result1?.Today?.SP_BAN_RA, "SumQTy")],
              ["TỔNG DV CỘNG THÊM", sumArrayPrice(result1?.Today?.DV_CONG_THEM, "SumQTy")],
            ];

            nextRow = exportTableNoHeaderNoBorder(
              nextRow - 1,
              middleTable2,
              4,
              true
            );

            // Xuất bảng 2
            exportTable(
              nextRow,
              table2.title,
              table2.headers,
              table2.data,
              table2.formatters
            );

            // Auto fit
            for (
              let i = 0;
              i < Math.max(table1.headers.length, table2.headers.length);
              i++
            ) {
              sheet.autoFitColumn(i);
            }

            workbook.resumePaint();
            workbook.resumeEvent();

            setIsExport2(false);
            window.top?.toastr?.remove();
          }
        );
      });
  };

  const onExport = () => {
    window?.top?.loading &&
      window?.top?.loading("Đang thực hiện ...", () => {
        setIsExport(true);
        let { DateStart, DateEnd } = getDateToFromV2({
          ...filters,
          checkout_time,
        });
        CalendarCrud.getReportOrdersSales({
          _Method_: "Reports.v2.Ban_Hang.GetBCao_DSo_DSach2",
          StockID: AuthCrStockID,
          DateStart: moment(DateStart).format("DD/MM/YYYY HH:mm:ss"),
          DateEnd: moment(DateEnd).format("DD/MM/YYYY HH:mm:ss"),
          Pi: 1,
          Ps: 10000,
          Voucher: "",
          Payment: "",
          IsMember: "",
          MemberID: "",
          SourceName: "",
          ShipCode: "",
          ShowsX: "2",
          DebtFrom: null,
          DebtTo: null,
          no: "",
        }).then(async (rs) => {
          let { Total, Items } = rs;
          let { data: rsRooms } = await CalendarCrud.getConfigName(`room`);
          let RoomsList =
            rsRooms && rsRooms.length > 0 && rsRooms[0].Value
              ? JSON.parse(rsRooms[0].Value)
              : null;
          let Rooms = [];
          for (let st of RoomsList) {
            if (st?.ListRooms && st?.ListRooms.length > 0) {
              for (let room of st?.ListRooms) {
                if (room.Children && room.Children.length > 0) {
                  for (let r of room.Children) {
                    Rooms.push(r);
                  }
                }
              }
            }
          }
          let newItems =
            Items && Items.length > 0
              ? Items.map((x) => {
                  let obj = { ...x, id: uuidv4() };
                  if (x.Services && x.Services.length > 0) {
                    obj.Services = obj.Services
                      ? obj.Services.map((k) => {
                          let sv = { ...k };
                          if (sv.RoomID) {
                            let index = Rooms.findIndex(
                              (o) => o.ID === sv.RoomID
                            );
                            if (index > -1) sv.RoomTitle = Rooms[index].label;
                          }
                          return sv;
                        })
                      : [];
                  }
                  return obj;
                })
              : [];

          ExcelHepers.dataToExcel(
            `Danh sách đơn hàng (${Total}) - Từ ${moment(DateStart).format(
              "DD/MM/YYYY"
            )} đến ${moment(DateEnd).format("DD/MM/YYYY")}`,
            (sheet, workbook) => {
              workbook.suspendPaint();
              workbook.suspendEvent();
              let Head = [
                "ID ĐƠN HÀNG",
                "NHÂN VIÊN BÁN",
                "NGƯỜI GIỚI THIỆU",
                "THỜI GIAN",
                "TÊN KHÁCH HÀNG",
                "SỐ ĐIỆN THOẠI",
                "LOẠI CŨ / MỚI (ĐG)",
                "LOẠI CŨ / MỚI (KH)",
                "NGUỒN KH (ĐG)",
                "NGUỒN KH (NV)",
                "QUỐC GIA",
                "GIÁ TRỊ TỔNG (ĐH)",
                "GIÁ TRỊ TIP (ĐH)",
                "PHÍ DỊCH VỤ",
                "PHÍ QUẸT THẺ",
                "GIÁ TRỊ SP/DV (ĐH)",
                "GIẢM GIÁ (ĐH)",
                "TT TIỀN MẶT",
                "TT CHUYỂN KHOẢN",
                "TT QUẸT THẺ",
                "TT VÍ",
                "TT THẺ TIỀN",
                "CÒN NỢ",
                "CHI TIẾT ĐƠN HÀNG",
                "DỊCH VỤ / NHÂN VIÊN",
                "ĐÁNH GIÁ",
                "NỘI DUNG",
              ];
              let Response = [Head];
              for (let rowData of newItems) {
                let TotalGG = 0;
                let newOi = rowData.MetaJSON
                  ? JSON.parse(rowData.MetaJSON)
                  : [];
                newOi = newOi?.oi || [];
                newOi = newOi.filter(
                  (x) =>
                    x.name !== "TIP" &&
                    x.name !== "Phí dịch vụ" &&
                    x.name !== "Phí quẹt thẻ"
                );
                if (newOi && newOi.length > 0) {
                  TotalGG = newOi
                    .filter((x) => x.p > 0)
                    .map((x) => x.p * x.qty - x.tp)
                    .reduce(
                      (accumulator, currentValue) => accumulator + currentValue,
                      0
                    );
                }
                let loai = "";
                if (rowData.Gioitinh) {
                  loai = rowData.Gioitinh === 1 ? "Khách mới" : "Khách cũ";
                }
                Response.push([
                  rowData.Id,
                  rowData?.UserFullName || "",
                  rowData?.AffName,
                  moment(rowData.CreateDate).format("HH:mm DD-MM-YYYY"),
                  rowData.MemberName,
                  rowData.MemberPhone,
                  getInfoSource(rowData).IsMember,
                  loai,
                  getInfoSource(rowData).Source,
                  rowData.Source,
                  rowData.Jobs,
                  rowData.ToPay,
                  getTIP(rowData),
                  getPHI_DICH_VU(rowData),
                  getPHI_QUET_THE(rowData),
                  rowData.ToPay -
                    getTIP(rowData) -
                    getPHI_DICH_VU(rowData) -
                    getPHI_QUET_THE(rowData),
                  TotalGG > 0 ? Math.abs(TotalGG) : 0,
                  rowData.DaThToan_TM,
                  rowData.DaThToan_CK,
                  rowData.DaThToan_QT,
                  Math.abs(rowData.DaThToan_Vi),
                  rowData.DaThToan_ThTien,
                  rowData.ConNo,
                  newOi.map((x) => `${x.name} (x${x.qty})`).join("; "),
                  getServices(rowData).Staffs,
                  getServices(rowData).Rate,
                  getServices(rowData).RateNote,
                ]);
              }
              let TotalRow = Response.length;
              let TotalColumn = Head.length;
              sheet.setArray(2, 0, Response);
              //title
              workbook
                .getActiveSheet()
                .getCell(0, 0)
                .value(
                  data?.FullName +
                    ", T" +
                    moment(filters.Month).format("MM-YYYY")
                );
              workbook
                .getActiveSheet()
                .getCell(0, 0)
                .font("18pt Arial");
              workbook
                .getActiveSheet()
                .getRange(2, 0, 1, TotalColumn)
                .font("12pt Arial");
              workbook
                .getActiveSheet()
                .getRange(2, 0, 1, TotalColumn)
                .backColor("#E7E9EB");
              //border
              var border = new window.GC.Spread.Sheets.LineBorder();
              border.color = "#000";
              border.style = window.GC.Spread.Sheets.LineStyle.thin;
              workbook
                .getActiveSheet()
                .getRange(2, 0, TotalRow, TotalColumn)
                .borderLeft(border);
              workbook
                .getActiveSheet()
                .getRange(2, 0, TotalRow, TotalColumn)
                .borderRight(border);
              workbook
                .getActiveSheet()
                .getRange(2, 0, TotalRow, TotalColumn)
                .borderBottom(border);
              workbook
                .getActiveSheet()
                .getRange(2, 0, TotalRow, TotalColumn)
                .borderTop(border);
              //filter
              var cellrange = new window.GC.Spread.Sheets.Range(
                3,
                0,
                1,
                TotalColumn
              );
              var hideRowFilter = new window.GC.Spread.Sheets.Filter.HideRowFilter(
                cellrange
              );
              workbook.getActiveSheet().rowFilter(hideRowFilter);
              //format number
              workbook
                .getActiveSheet()
                .getCell(2, 0)
                .hAlign(window.GC.Spread.Sheets.HorizontalAlign.center);
              //auto fit width and height
              //workbook.getActiveSheet().autoFitRow(TotalRow + 2);
              workbook.getActiveSheet().autoFitRow(0);
              for (let i = 1; i < TotalColumn; i++) {
                workbook.getActiveSheet().autoFitColumn(i);
              }
              window.top?.toastr?.remove();
              //Finish
              workbook.resumePaint();
              workbook.resumeEvent();
              setIsExport(false);
            }
          );
        });
      });
  };

  const SumTotal = (arr, key) => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((n, item) => n + item[key], 0);
  };

  let height = elRef?.current?.offsetHeight - 53;

  let height2Col = elRef?.current?.offsetHeight / 2 - 53 - 8;

  if (GlobalConfig?.Admin?.MasExportExcel) {
    height2Col = height;
  }

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible &&
        createPortal(
          <div className="fixed top-0 left-0 z-[1003] bg-white !h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 border-b">
              <div className="hidden text-xl font-medium lg:block">
                Thống kê
                {checkout_time && filters && (
                  <span className="pl-1 text-sm">
                    (
                    {moment(
                      getDateToFromV2({
                        ...filters,
                        checkout_time,
                      }).DateStart
                    ).format("DD/MM/YYYY HH:mm")}
                    <span className="px-1">-</span>
                    {moment(
                      getDateToFromV2({
                        ...filters,
                        checkout_time,
                      }).DateEnd
                    ).format("DD/MM/YYYY HH:mm")}
                    )
                  </span>
                )}
              </div>
              <Formik
                initialValues={filters}
                onSubmit={(values) => {
                  if (
                    values.DateStart &&
                    values.DateEnd &&
                    moment(values.DateStart).format("DD-MM-YYYY") ===
                      moment(filters.DateStart).format("DD-MM-YYYY") &&
                    moment(values.DateEnd).format("DD-MM-YYYY") ===
                      moment(filters.DateEnd).format("DD-MM-YYYY")
                  ) {
                    Orders.refetch();
                    refetch();
                  } else {
                    setFilters(values);
                  }
                }}
                enableReinitialize
              >
                {(formikProps) => {
                  const { values, setFieldValue } = formikProps;

                  return (
                    <Form className="flex w-full gap-2 lg:w-auto">
                      <div className="lg:w-[160px] flex-1">
                        <DatePicker
                          locale={vi}
                          selected={
                            values.DateStart ? new Date(values.DateStart) : null
                          }
                          onChange={(date) => setFieldValue("DateStart", date)}
                          className="!h-11 form-control !rounded-[4px] !text-[15px] px-2 md:px-4"
                          shouldCloseOnSelect={true}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Từ thời gian"
                          // showTimeSelect
                          // showTimeSelectOnly
                          // timeIntervals={1}
                        />
                      </div>
                      <div className="items-center hidden md:flex">-</div>
                      <div className="lg:w-[160px] flex-1">
                        <DatePicker
                          locale={vi}
                          selected={
                            values.DateEnd ? new Date(values.DateEnd) : null
                          }
                          onChange={(date) => setFieldValue("DateEnd", date)}
                          className="!h-11 form-control !rounded-[4px] !text-[15px] px-2 md:px-4"
                          shouldCloseOnSelect={true}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Đến thời gian"
                          // showTimeSelect
                          // showTimeSelectOnly
                          // timeIntervals={1}
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-[4px] w-11 bg-primary text-white disabled:opacity-50"
                        disabled={
                          isLoading ||
                          isFetching ||
                          Orders?.isLoading ||
                          Orders?.isFetching ||
                          !filters.DateStart ||
                          !filters.DateEnd
                        }
                      >
                        {!isLoading &&
                          !isFetching &&
                          !Orders?.isLoading &&
                          !Orders?.isFetching && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                              />
                            </svg>
                          )}

                        {(isLoading ||
                          isFetching ||
                          Orders?.isLoading ||
                          Orders?.isFetching) && (
                          <div role="status">
                            <svg
                              aria-hidden="true"
                              className="w-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                            <span className="sr-only">Loading...</span>
                          </div>
                        )}
                      </button>
                      {GlobalConfig?.Admin?.MasExportExcel ? (
                        <button
                          type="button"
                          className="rounded-[4px] w-11 text-primary hidden md:block"
                          onClick={async () => {
                            exportExcel();
                          }}
                        >
                          {!isExport2 &&
                            !isLoading &&
                            !isFetching &&
                            !Orders?.isLoading &&
                            !Orders?.isFetching && (
                              <svg
                                className="w-6"
                                fill="#000000"
                                viewBox="0 0 32 32"
                                version="1.1"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M29.121 8.502v-3.749h-8.435v3.749zM29.121 15.063v-4.686h-8.435v4.686zM29.121 21.623v-4.686h-8.435v4.686zM29.121 27.247v-3.749h-8.435v3.749zM18.812 8.502v-3.749h-8.435v3.749zM18.812 15.063v-4.686h-2.812v4.686zM18.812 21.623v-4.686h-2.812v4.686zM18.812 27.247v-3.749h-8.435v3.749zM8.502 17.6l1.774 3.324h2.674l-2.974-4.836 2.924-4.749h-2.574l-1.625 2.999-0.062 0.1-0.050 0.112-0.8-1.6-0.825-1.612h-2.724l2.837 4.774-3.099 4.811h2.699zM29.746 2.879c0.005-0 0.010-0 0.015-0 0.339 0 0.645 0.144 0.859 0.374l0.001 0.001c0.231 0.215 0.375 0.52 0.375 0.859 0 0.005-0 0.011-0 0.016v-0.001 23.743c-0.017 0.683-0.567 1.232-1.248 1.25l-0.002 0h-19.994c-0.683-0.017-1.232-0.567-1.25-1.248l-0-0.002v-4.374h-6.248c-0.005 0-0.010 0-0.015 0-0.339 0-0.645-0.144-0.859-0.374l-0.001-0.001c-0.231-0.215-0.375-0.52-0.375-0.859 0-0.005 0-0.011 0-0.016v0.001-12.496c-0-0.005-0-0.010-0-0.015 0-0.339 0.144-0.645 0.374-0.859l0.001-0.001c0.211-0.231 0.513-0.375 0.848-0.375 0.009 0 0.019 0 0.028 0l-0.001-0h6.248v-4.374c-0-0.005-0-0.010-0-0.015 0-0.339 0.144-0.645 0.374-0.859l0.001-0.001c0.215-0.231 0.52-0.375 0.859-0.375 0.005 0 0.011 0 0.016 0h-0.001z" />
                              </svg>
                            )}

                          {(isExport2 ||
                            isLoading ||
                            isFetching ||
                            Orders?.isLoading ||
                            Orders?.isFetching) && (
                            <div role="status">
                              <svg
                                aria-hidden="true"
                                className="w-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                  fill="currentFill"
                                />
                              </svg>
                              <span className="sr-only">Loading...</span>
                            </div>
                          )}
                        </button>
                      ) : (
                        <></>
                      )}

                      <button
                        type="button"
                        className="rounded-[4px] w-11 text-primary hidden md:block"
                        onClick={async () => {
                          await refetch();
                          await Orders?.refetch();
                        }}
                      >
                        {!isLoading &&
                          !isFetching &&
                          !Orders?.isLoading &&
                          !Orders?.isFetching && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                              />
                            </svg>
                          )}

                        {(isLoading ||
                          isFetching ||
                          Orders?.isLoading ||
                          Orders?.isFetching) && (
                          <div role="status">
                            <svg
                              aria-hidden="true"
                              className="w-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                            <span className="sr-only">Loading...</span>
                          </div>
                        )}
                      </button>
                      <div className="h-11 w-[1px] bg-gray-300"></div>
                      <div
                        className="flex items-center justify-center cursor-pointer md:w-12 w-11 h-11"
                        onClick={onHide}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 md:w-8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
            <div className="relative p-4 overflow-auto grow bg-[#ededf1]">
              {isLoading && (
                <>
                  <div className="grid lg:grid-cols-3 grid-cols-1 lg:gap-[20px] gap-4">
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tổng đơn hàng</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Đã thanh toán</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Chờ thanh toán</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền SP/DV/Combos</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div className="pl-2">- Tiền sản phẩm</div>
                        <div className="font-semibold leading-5 font-title">
                          <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div className="pl-1">- Tiền dịch vụ</div>
                        <div className="leading-5 text-[16px] font-semibold font-title">
                          <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div className="pl-1">- Tiền DV cộng thêm</div>
                        <div className="leading-5 text-[16px] font-semibold font-title">
                          <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div className="pl-1">- Tiền combo</div>
                        <div className="leading-5 text-[16px] font-semibold font-title">
                          <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền phí quẹt thẻ</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền phí dịch vụ</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền TIP</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Chuyển khoản</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Quẹt thẻ</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền mặt</div>
                        <div className="h-4 bg-gray-200 rounded-full w-[100px] animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {!isLoading && (
                <div>
                  <div className="grid grid-cols-1 gap-4 mb-4 xl:grid-cols-4 md:grid-cols-2 lg:flex-row">
                    <div>
                      <div className="grid grid-cols-1 gap-4" ref={elRef}>
                        <div className="bg-white rounded">
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Tổng đơn hàng</div>
                            <div className="leading-5 text-[16px] font-semibold text-primary font-title">
                              {PriceHelper.formatVND(
                                data?.Today?.DSo_Ngay || 0
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Đã thanh toán</div>
                            <div className="leading-5 text-[16px] font-semibold text-success font-title">
                              {PriceHelper.formatVND(
                                (data?.Today?.DSo_TToan || 0) +
                                  Math.abs(data?.Today?.DSo_TToan_ThTien || 0) +
                                  Math.abs(data?.Today?.DSo_TToan_Vi || 0)
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Chờ thanh toán</div>
                            <div className="leading-5 text-[16px] font-semibold text-warning font-title">
                              {PriceHelper.formatVND(
                                (data?.Today?.DSo_Ngay || 0) -
                                  ((data?.Today?.DSo_TToan || 0) +
                                    Math.abs(
                                      data?.Today?.DSo_TToan_ThTien || 0
                                    ) +
                                    Math.abs(data?.Today?.DSo_TToan_Vi || 0))
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded">
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Tiền SP/DV/Combos</div>
                            <div className="leading-5 text-[16px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                (data?.Today?.DSo_Ngay || 0) -
                                  (data?.Today?.TIP?.SumTopay || 0) -
                                  (data?.Today?.PHI_QUET_THE?.SumTopay || 0) -
                                  (data?.Today?.PHI_DICH_VU?.SumTopay || 0)
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0 text-[13px] text-gray-800">
                            <div className="pl-5">Tiền sản phẩm</div>
                            <div className="leading-5 text-[15px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                SumTotal(data?.Today?.SP_BAN_RA, "SumTopay")
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0 text-[13px] text-gray-800">
                            <div className="pl-5">Tiền dịch vụ</div>
                            <div className="leading-5 text-[15px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                SumTotal(data?.Today?.DV_BAN_RA, "SumTopay")
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0 text-[13px] text-gray-800">
                            <div className="pl-5">Tiền DV cộng thêm</div>
                            <div className="leading-5 text-[15px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                SumTotal(data?.Today?.DV_CONG_THEM, "SumTopay")
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0 text-[13px] text-gray-800">
                            <div className="pl-5">Tiền combo</div>
                            <div className="leading-5 text-[15px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                SumTotal(data?.Today?.COMBOS, "SumTopay")
                              )}
                            </div>
                          </div>
                          {!GlobalConfig?.Admin?.MasExportExcel && (
                            <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0 text-[13px] text-gray-800">
                              <div className="pl-5">Tiền thẻ tiền</div>
                              <div className="leading-5 text-[15px] font-semibold font-title">
                                {PriceHelper.formatVND(
                                  SumTotal(data?.Today?.THE_TIEN, "SumTopay")
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Tiền phí quẹt thẻ</div>
                            <div className="leading-5 text-[16px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                data?.Today?.PHI_QUET_THE?.SumTopay || 0
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Tiền phí dịch vụ</div>
                            <div className="leading-5 text-[16px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                data?.Today?.PHI_DICH_VU?.SumTopay || 0
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Tiền TIP</div>
                            <div className="leading-5 text-[16px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                data?.Today?.TIP?.SumTopay || 0
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded">
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Chuyển khoản</div>
                            <div className="leading-5 text-[16px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                data?.Today?.DSo_TToan_CKhoan || 0
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Quẹt thẻ</div>
                            <div className="leading-5 text-[16px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                data?.Today?.DSo_TToan_QThe || 0
                              )}
                            </div>
                          </div>
                          <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                            <div>Tiền mặt</div>
                            <div className="leading-5 text-[16px] font-semibold font-title">
                              {PriceHelper.formatVND(
                                data?.Today?.DSo_TToan_TMat || 0
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="bg-white rounded">
                        <div className="px-5 py-4 border-b">
                          <div className="leading-5 text-[16px] font-medium uppercase">
                            Sản phẩm
                          </div>
                        </div>

                        <div
                          className="overflow-auto"
                          style={{ height: `${height2Col}px` }}
                        >
                          {data?.Today?.SP_BAN_RA &&
                          data?.Today?.SP_BAN_RA.length > 0 ? (
                            data?.Today?.SP_BAN_RA.map((item, index) => (
                              <div
                                className="flex border-b border-dashed last:!border-0 px-6 py-3"
                                key={index}
                              >
                                <div className="flex-1 font-light">
                                  {item?.ProdTitle} (x{item?.SumQTy})
                                </div>
                                <div className="w-[150px] text-right font-semibold font-title">
                                  {PriceHelper.formatVND(item?.SumTopay)}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex border-b border-dashed last:!border-0 px-6 py-3 font-light">
                              Không có dữ liệu.
                            </div>
                          )}
                        </div>
                      </div>
                      {!GlobalConfig?.Admin?.MasExportExcel && (
                        <div className="bg-white rounded">
                          <div className="px-5 py-4 border-b">
                            <div className="leading-5 text-[16px] font-medium uppercase">
                              Thẻ tiền
                            </div>
                          </div>

                          <div
                            className="overflow-auto"
                            style={{ height: `${height2Col}px` }}
                          >
                            {data?.Today?.THE_TIEN &&
                              data?.Today?.THE_TIEN.map((item, index) => (
                                <div
                                  className="flex border-b border-dashed last:!border-0 px-6 py-3"
                                  key={index}
                                >
                                  <div className="flex-1 font-light">
                                    {item?.ProdTitle} (x{item?.SumQTy})
                                  </div>
                                  <div className="w-[150px] text-right font-semibold font-title">
                                    {PriceHelper.formatVND(item?.SumTopay)}
                                  </div>
                                </div>
                              ))}
                            {(!data?.Today?.THE_TIEN ||
                              data?.Today?.THE_TIEN.length === 0) && (
                              <div className="flex border-b border-dashed last:!border-0 px-6 py-3 font-light">
                                Không có dữ liệu.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded">
                      <div className="px-5 py-4 border-b">
                        <div className="leading-5 text-[16px] font-medium uppercase">
                          Dịch vụ / Dịch vụ cộng thêm
                        </div>
                      </div>
                      <div
                        className="overflow-auto"
                        style={{ height: `${height}px` }}
                      >
                        <div>
                          <div className="bg-[#f4f6f9] px-6 py-3 text-[#3F4254] font-semibold uppercase text-[12px]">
                            Dịch vụ cộng thêm
                          </div>
                          <div>
                            {data?.Today?.DV_CONG_THEM &&
                            data?.Today?.DV_CONG_THEM.length > 0 ? (
                              data?.Today?.DV_CONG_THEM.map((item, index) => (
                                <div
                                  className="flex border-b border-dashed last:!border-0 px-6 py-3"
                                  key={index}
                                >
                                  <div className="flex-1 font-light">
                                    {item?.ProdTitle} (x{item?.SumQTy})
                                  </div>
                                  <div className="w-[150px] text-right font-semibold font-title">
                                    {PriceHelper.formatVND(item?.SumTopay)}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex border-b border-dashed last:!border-0 px-6 py-3 font-light">
                                Không có dữ liệu.
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="bg-[#f4f6f9] px-6 py-3 text-[#3F4254] font-semibold uppercase text-[12px]">
                            Dịch vụ
                          </div>
                          <div>
                            {data?.Today?.DV_BAN_RA &&
                            data?.Today?.DV_BAN_RA.length > 0 ? (
                              data?.Today?.DV_BAN_RA.map((item, index) => (
                                <div
                                  className="flex justify-between border-b border-dashed last:!border-0 px-6 py-3"
                                  key={index}
                                >
                                  <div className="flex-1 font-light">
                                    {item?.ProdTitle} (x{item?.SumQTy})
                                  </div>
                                  <div className="w-[150px] text-right font-semibold font-title">
                                    {PriceHelper.formatVND(item?.SumTopay)}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex border-b border-dashed last:!border-0 px-6 py-3 font-light">
                                Không có dữ liệu.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="px-5 py-4 border-b">
                        <div className="leading-5 text-[16px] font-medium uppercase">
                          Combo
                        </div>
                      </div>
                      <div
                        className="overflow-auto"
                        style={{ height: `${height}px` }}
                      >
                        {data?.Today?.COMBOS &&
                        data?.Today?.COMBOS.length > 0 ? (
                          data?.Today?.COMBOS.map((item, index) => (
                            <div
                              className="flex justify-between border-b border-dashed last:!border-0 px-6 py-3"
                              key={index}
                            >
                              <div className="flex-1 font-light">
                                {item?.ProdTitle} (x{item?.SumQTy})
                              </div>
                              <div className="w-[150px] text-right font-semibold font-title">
                                {PriceHelper.formatVND(item?.SumTopay)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="flex border-b border-dashed last:!border-0 px-6 py-3 font-light">
                            Không có dữ liệu.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded">
                    <div className="flex items-center justify-between px-5 py-3 border-b">
                      <div className="leading-5 text-[16px] font-medium uppercase">
                        <span className="hidden lg:block">
                          Danh sách đơn hàng
                        </span>
                        <span className="lg:hidden">Đơn hàng</span>
                      </div>
                      <button
                        disabled={isExport}
                        className="text-white bg-primary rounded-[3px] py-2.5 px-4 flex"
                        type="button"
                        onClick={onExport}
                      >
                        <span>Xuất Excel</span>
                        {isExport && (
                          <div className="ml-3" role="status">
                            <svg
                              aria-hidden="true"
                              className="w-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                            <span className="sr-only">Loading...</span>
                          </div>
                        )}
                      </button>
                    </div>
                    <div className="relative h-[500px] p-4">
                      <AutoResizer>
                        {({ width, height }) => (
                          <Table
                            fixed
                            key="id"
                            rowKey="id"
                            width={width}
                            height={height}
                            columns={columns}
                            data={Lists}
                            disabled={Orders?.isLoading}
                            loadingMore={Orders?.hasNextPage}
                            onEndReachedThreshold={300}
                            onEndReached={() => {
                              if (!Orders.isFetchingNextPage) {
                                Orders?.fetchNextPage();
                              }
                            }}
                            //overlayRenderer={this.renderOverlay}
                            //emptyRenderer={this.renderEmpty}
                            ignoreFunctionInColumnCompare={false}
                            estimatedRowHeight={60}
                            emptyRenderer={() =>
                              !Orders?.isLoading && !Orders?.isFetching ? (
                                <div className="flex items-center justify-center w-full h-full">
                                  Không có dữ liệu
                                </div>
                              ) : (
                                <>
                                  <div className="left-0 z-50 flex items-center justify-center w-full h-full">
                                    <div role="status">
                                      <svg
                                        aria-hidden="true"
                                        className="w-8 h-8 text-gray-500 animate-spin fill-blue-600"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                          fill="currentColor"
                                        />
                                        <path
                                          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                          fill="currentFill"
                                        />
                                      </svg>
                                      <span className="sr-only">
                                        Loading...
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )
                            }
                          />
                        )}
                      </AutoResizer>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {isFetching && (
              <div className="absolute bottom-0 left-0 z-50 flex items-center justify-center w-full h-[calc(100vh-73px)] bg-white/50">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-8 h-8 text-gray-500 animate-spin fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

export default PickerReportMassageV2;
