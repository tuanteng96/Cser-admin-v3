import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useInfiniteQuery, useQuery } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import moment from "moment";
import vi from "date-fns/locale/vi";
import { PriceHelper } from "../../../../helpers/PriceHelper";
import Table, { AutoResizer } from "react-base-table";
import Text from "react-texty";
import clsx from "clsx";
import ExcelHepers from "../../../../helpers/ExcelHepers";
import { Form, Formik } from "formik";

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

const getDateToFrom = ({ checkout_time, CrDate }) => {
  let isSkips = false;

  let DateStart = null;
  let DateEnd = null;

  if (checkout_time) {
    if (moment(CrDate).diff(moment(), "days") < 0) {
      DateStart = moment(CrDate)
        .set({
          hours: checkout_time.split(";")[1].split(":")[0],
          minute: checkout_time.split(";")[1].split(":")[1],
          second: "00",
        })
        .format("DD/MM/YYYY HH:mm:ss");
      DateEnd = moment(CrDate)
        .add(1, "days")
        .set({
          hours: checkout_time.split(";")[1].split(":")[0],
          minute: checkout_time.split(";")[1].split(":")[1],
          second: "00",
        })
        .format("DD/MM/YYYY HH:mm:ss");
    } else {
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
        DateEnd = moment(CrDate)
          .add(1, "days")
          .set({
            hours: checkout_time.split(";")[1].split(":")[0],
            minute: checkout_time.split(";")[1].split(":")[1],
            second: "00",
          })
          .format("DD/MM/YYYY HH:mm:ss");
      } else if (now.isBetween(CrOut, CrOutEnd, null, "[]")) {
        isSkips = true;
        DateStart = moment(CrDate)
          .subtract(1, "days")
          .set({
            hours: checkout_time.split(";")[1].split(":")[0],
            minute: checkout_time.split(";")[1].split(":")[1],
            second: "00",
          })
          .format("DD/MM/YYYY HH:mm:ss");
        DateEnd = moment(CrDate)
          .set({
            hours: checkout_time.split(";")[1].split(":")[0],
            minute: checkout_time.split(";")[1].split(":")[1],
            second: "00",
          })
          .format("DD/MM/YYYY HH:mm:ss");
      } else {
        DateStart = moment(CrDate)
          .set({
            hours: checkout_time.split(";")[1].split(":")[0],
            minute: checkout_time.split(";")[1].split(":")[1],
            second: "00",
          })
          .format("DD/MM/YYYY HH:mm:ss");
        DateEnd = moment(CrDate)
          .add(1, "days")
          .set({
            hours: checkout_time.split(";")[1].split(":")[0],
            minute: checkout_time.split(";")[1].split(":")[1],
            second: "00",
          })
          .format("DD/MM/YYYY HH:mm:ss");
      }
    }
  }
  return {
    isSkips,
    DateStart,
    DateEnd,
  };
};

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
          DateEnd = moment(DateEnd)
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
  const { AuthCrStockID, checkout_time } = useSelector(
    ({ Auth, JsonConfig }) => ({
      AuthCrStockID: Auth.CrStockID,
      GTimeOpen: JsonConfig?.APP?.Working?.TimeOpen || "00:00:00",
      GTimeClose: JsonConfig?.APP?.Working?.TimeClose || "23:59:00",
      checkout_time: JsonConfig?.Admin?.checkout_time || "",
    })
  );

  const [visible, setVisible] = useState(false);

  const [isExport, setIsExport] = useState(false);

  let [CrDate, setCrDate] = useState(new Date());

  const [filters, setFilters] = useState({
    DateStart: null,
    DateEnd: null,
  });

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
        From: moment(CrDate)
          .subtract(isSkips ? 1 : 0, "days")
          .format("DD/MM/YYYY"),
        To: moment(CrDate)
          .subtract(isSkips ? 1 : 0, "days")
          .format("DD/MM/YYYY"),
        StockID: AuthCrStockID,
        key: "",
      });

      let TIP = null;

      if (rs2 && rs2.length > 0) {
        let index = rs2.findIndex(
          (x) => x.Format === 1 && x.ProdTitle === "TIP"
        );
        if (index > -1) {
          TIP = rs2[index];
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
          SP_BAN_RA:
            rs2 && rs2.length > 0 ? rs2.filter((x) => x.Format === 1) : [],
          DV_BAN_RA:
            rs2 && rs2.length > 0 ? rs2.filter((x) => x.Format === 2) : [],
        },
        STAFFS: [
          ...STAFFS.filter((x) => x.ValueOf > 0),
          ...STAFFS.filter((x) => x.ValueOf < 0),
        ],
        SERVICES,
        filters: {
          DateStart: DateStart || moment(CrDate).format("DD/MM/YYYY HH:mm"),
          DateEnd: DateEnd || moment(CrDate).format("DD/MM/YYYY HH:mm"),
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
              let obj = { ...x };
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
    if (rowData.Prod) {
      let Prods = rowData.Prod.split(";");
      let index = rowData.Prod.split(";").findIndex(
        (x) => x.indexOf("TIP") > -1
      );

      if (index > -1) {
        const regex = /\(([^)]+)\)/g;
        const matches = [...Prods[index].matchAll(regex)];
        const values = matches.map((match) => match[1]);
        if (values && values.length > 0 && values[0].split(",").length > 1) {
          TIP = Number(values[0].split(",")[1]);
        }
      }
    }
    return TIP;
  };

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
        title: "Loại Cũ / Mới",
        dataKey: "IsNewMember",
        cellRenderer: ({ rowData }) => getInfoSource(rowData).IsMember,
        width: 200,
        sortable: false,
        mobileOptions: {
          visible: true,
        },
      },
      {
        key: "MemberSource",
        title: "Nguồn khách hàng",
        dataKey: "MemberSource",
        cellRenderer: ({ rowData }) => getInfoSource(rowData).Source,
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
        key: "TOTAL/SP/DV",
        title: "Giá trị SP/DV (ĐH)",
        dataKey: "TOTAL/SP/DV",
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(rowData.ToPay - getTIP(rowData));
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

          newOi = newOi.filter((x) => x.name !== "TIP");
          if (newOi && newOi.length > 0) {
            Total = newOi
              .map((x) => x.p * x.qty - x.tp)
              .reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0
              );
          }
          return PriceHelper.formatVND(Math.abs(Total));
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

          newOi = newOi.filter((x) => x.name !== "TIP");

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

  const getServices = (rowData) => {
    let Staffs = "";
    let RateNote = "";
    let Rate = "";

    if (rowData.Services && rowData.Services.length > 0) {
      RateNote = rowData.Services[0].RateNote || "";

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
    };
  };

  const getInfoSource = (rowData) => {
    let Source = "";
    let IsMember = "Khách mới";
    let Desc = getServices(rowData).RateNote;
    if (Desc) {
      let DescSplit = Desc.split(",");
      let index = DescSplit.findIndex(
        (x) => x.indexOf("Đã từng trả nghiệm dịch vụ") > -1
      );
      if (index > -1) {
        if (DescSplit[index].indexOf("Đã từng") > -1) {
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

  const onExport = () => {
    window?.top?.loading &&
      window?.top?.loading("Đang thực hiện ...", () => {
        setIsExport(true);
        let { DateStart, DateEnd } = getDateToFrom({
          CrDate,
          checkout_time,
        });
        CalendarCrud.getReportOrdersSales({
          _Method_: "Reports.v2.Ban_Hang.GetBCao_DSo_DSach2",
          StockID: AuthCrStockID,
          DateStart: DateStart || moment(CrDate).format("DD/MM/YYYY"),
          DateEnd: DateEnd || moment(CrDate).format("DD/MM/YYYY"),
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
        }).then((rs) => {
          let { Total, Items } = rs;

          ExcelHepers.dataToExcel(
            `Danh sách đơn hàng (${Total}) - Từ ${moment(CrDate).format(
              "DD/MM/YYYY"
            )} đến ${moment(CrDate).format("DD/MM/YYYY")}`,
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
                "LOẠI CŨ / MỚI",
                "NGUỒN KHÁCH HÀNG",
                "QUỐC GIA",
                "GIÁ TRỊ TỔNG (ĐH)",
                "GIÁ TRỊ TIP (ĐH)",
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

              for (let rowData of Items) {
                let TotalGG = 0;
                let newOi = rowData.MetaJSON
                  ? JSON.parse(rowData.MetaJSON)
                  : [];

                newOi = newOi?.oi || [];

                newOi = newOi.filter((x) => x.name !== "TIP");
                if (newOi && newOi.length > 0) {
                  TotalGG = newOi
                    .map((x) => x.p * x.qty - x.tp)
                    .reduce(
                      (accumulator, currentValue) => accumulator + currentValue,
                      0
                    );
                }
                Response.push([
                  rowData.Id,
                  rowData?.UserFullName || "",
                  rowData?.AffName,
                  moment(rowData.CreateDate).format("HH:mm DD-MM-YYYY"),
                  rowData.MemberName,
                  rowData.MemberPhone,
                  getInfoSource(rowData).IsMember,
                  getInfoSource(rowData).Source,
                  rowData.Jobs,
                  rowData.ToPay,
                  getTIP(rowData),
                  rowData.ToPay - getTIP(rowData),
                  Math.abs(TotalGG),
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
                {/* {checkout_time && filters && (
                  <span className="pl-1 text-sm">
                    ({filters?.DateStart} - {filters?.DateEnd})
                  </span>
                )} */}
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
                    <Form className="flex w-full gap-2 md:gap-3 lg:w-auto">
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
                        <div>Tiền Spa</div>
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
                  <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tổng đơn hàng</div>
                        <div className="text-lg font-semibold text-primary font-title">
                          {PriceHelper.formatVND(data?.Today?.DSo_Ngay || 0)}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Đã thanh toán</div>
                        <div className="text-lg font-semibold text-success font-title">
                          {PriceHelper.formatVND(
                            (data?.Today?.DSo_TToan || 0) +
                              Math.abs(data?.Today?.DSo_TToan_ThTien || 0) +
                              Math.abs(data?.Today?.DSo_TToan_Vi || 0)
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Chờ thanh toán</div>
                        <div className="text-lg font-semibold text-warning font-title">
                          {PriceHelper.formatVND(
                            (data?.Today?.DSo_Ngay || 0) -
                              ((data?.Today?.DSo_TToan || 0) +
                                Math.abs(data?.Today?.DSo_TToan_ThTien || 0) +
                                Math.abs(data?.Today?.DSo_TToan_Vi || 0))
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền Spa</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            (data?.Today?.DSo_Ngay || 0) -
                              (data?.Today?.TIP?.SumTopay || 0)
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền TIP</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            data?.Today?.TIP?.SumTopay || 0
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded">
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Chuyển khoản</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            data?.Today?.DSo_TToan_CKhoan || 0
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Quẹt thẻ</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            data?.Today?.DSo_TToan_QThe || 0
                          )}
                        </div>
                      </div>
                      <div className="flex items-end justify-between px-6 py-4 border-b border-dashed last:!border-0">
                        <div>Tiền mặt</div>
                        <div className="text-lg font-semibold font-title">
                          {PriceHelper.formatVND(
                            data?.Today?.DSo_TToan_TMat || 0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-4 bg-white rounded">
                    <div className="flex items-center justify-between px-5 py-3 border-b">
                      <div className="text-lg font-medium uppercase">
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
                            rowKey="Id"
                            width={width}
                            height={height}
                            columns={columns}
                            data={Lists}
                            disabled={Orders?.isLoading}
                            loadingMore={Orders?.isFetching}
                            onEndReachedThreshold={300}
                            onEndReached={Orders?.fetchNextPage}
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
                  <div className="bg-white rounded">
                    <div className="px-5 py-4 border-b">
                      <div className="text-lg font-medium uppercase">
                        Bán hàng
                      </div>
                    </div>
                    <div>
                      <div className="bg-[#f4f6f9] px-6 py-3 text-[#3F4254] font-semibold uppercase text-[12px]">
                        Sản phẩm
                      </div>
                      <div>
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
                              <div className="w-[180px] text-right font-semibold font-title">
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
                              <div className="w-[180px] text-right font-semibold font-title">
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
              )}
              {isFetching && (
                <div className="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-[calc(100vh-73px)] bg-white/50">
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
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default PickerReportMassageV2;
