import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import moment from "moment";
import vi from "date-fns/locale/vi";
import {
  toAbsoluteUrl,
  toAbsoluteUser,
} from "../../../../helpers/AssetsHelpers";
import clsx from "clsx";

const getStatusClss = (Status, item) => {
  const isAuto =
    item?.Desc && item.Desc.toUpperCase().indexOf("TỰ ĐỘNG ĐẶT LỊCH");
  if (Status === "XAC_NHAN") {
    if (isAuto !== "" && isAuto > -1) return "primary1";
    return "primary";
  }
  if (Status === "CHUA_XAC_NHAN") {
    return "warning";
  }
  if (Status === "KHACH_KHONG_DEN") {
    return "danger";
  }
  if (Status === "KHACH_DEN") {
    return "info";
  }
  if (Status === "doing") {
    return "success";
  }
  if (Status === "done") {
    return "secondary";
  }
};

function PickerCurrentCalendar({ children, setInitialValue, onOpenModal }) {
  const { AuthCrStockID, GTimeOpen, GTimeClose } = useSelector(
    ({ Auth, JsonConfig }) => ({
      AuthCrStockID: Auth.CrStockID,
      GTimeOpen: JsonConfig?.APP?.Working?.TimeOpen || "00:00:00",
      GTimeClose: JsonConfig?.APP?.Working?.TimeClose || "23:59:00",
    })
  );

  const [visible, setVisible] = useState(false);

  const [TimeOpen] = useState(GTimeOpen);
  const [TimeClose] = useState(GTimeClose);

  let [CrDate, setCrDate] = useState(new Date());

  useEffect(() => {
    if (visible) {
      setCrDate(new Date());
    } else {
      setCrDate(null);
    }
  }, [visible]);

  const [filters] = useState({
    Status: ["XAC_NHAN", "DANG_THUC_HIEN"],
    MemberID: "",
    From: moment().format("YYYY-MM-DD"),
    To: moment().format("YYYY-MM-DD"),
    StockID: AuthCrStockID,
    UserServiceIDs: "",
    StatusMember: "",
    StatusBook: "",
    StatusAtHome: "",
    Tags: "",
  });

  const { data, isFetching, isLoading } = useQuery({
    queryKey: ["ListCurrentCalendars", { visible, filters, CrDate }],
    queryFn: async () => {
      const newFilters = {
        ...filters,
      };

      let data = await CalendarCrud.getBooking(newFilters);
      let { data: dataRooms } = await CalendarCrud.getConfigName(`room`);
      const rsRooms =
        dataRooms && dataRooms[0].Value ? JSON.parse(dataRooms[0].Value) : [];

      let dataOffline = [];

      dataOffline =
        data?.dayOffs && data?.dayOffs.length > 0
          ? data?.dayOffs.map((item) => ({
              start: item.From,
              end: item.To,
              resourceIds: [item.UserID],
              display: "background",
              extendedProps: {
                noEvent: true,
              },
              className: ["fc-no-event"],
            }))
          : [];
      if (data?.userOffs && data?.userOffs.length > 0) {
        for (let useroff of data?.userOffs) {
          if (useroff.dayList && useroff.dayList.length > 0) {
            let i = useroff.dayList.findIndex(
              (x) =>
                moment(x.Day).format("DD-MM-YYYY") ===
                moment(filters.From).format("DD-MM-YYYY")
            );
            if (i > -1) {
              let { off } = useroff.dayList[i];
              if (off) {
                if (off.isOff) {
                  dataOffline.push({
                    start: moment(filters.From)
                      .set({
                        hour: moment(TimeOpen, "HH:mm").get("hour"),
                        minute: moment(TimeOpen, "HH:mm").get("minute"),
                        second: 0,
                      })
                      .toDate(),
                    end: moment(filters.To)
                      .set({
                        hour: moment(TimeClose, "HH:mm").get("hour"),
                        minute: moment(TimeClose, "HH:mm").get("minute"),
                        second: 0,
                      })
                      .toDate(),
                    resourceIds: [useroff.user.ID],
                    display: "background",
                    extendedProps: {
                      noEvent: true,
                    },
                    className: ["fc-no-event"],
                  });
                } else {
                  dataOffline.push({
                    start: moment(filters.From)
                      .set({
                        hour: moment(TimeOpen, "HH:mm").get("hour"),
                        minute: moment(TimeOpen, "HH:mm").get("minute"),
                        second: 0,
                      })
                      .toDate(),
                    end: moment(filters.To)
                      .set({
                        hour: moment(off.TimeFrom, "HH:mm").get("hour"),
                        minute: moment(off.TimeFrom, "HH:mm").get("minute"),
                        second: 0,
                      })
                      .toDate(),
                    resourceIds: [useroff.user.ID],
                    display: "background",
                    extendedProps: {
                      noEvent: true,
                    },
                    className: ["fc-no-event"],
                  });
                  dataOffline.push({
                    start: moment(filters.From)
                      .set({
                        hour: moment(off.TimeTo, "HH:mm").get("hour"),
                        minute: moment(off.TimeTo, "HH:mm").get("minute"),
                        second: 0,
                      })
                      .toDate(),
                    end: moment(filters.To)
                      .set({
                        hour: moment(TimeClose, "HH:mm").get("hour"),
                        minute: moment(TimeClose, "HH:mm").get("minute"),
                        second: 0,
                      })
                      .toDate(),
                    resourceIds: [useroff.user.ID],
                    display: "background",
                    extendedProps: {
                      noEvent: true,
                    },
                    className: ["fc-no-event"],
                  });
                }
              }
            }
          }
        }
      }

      let dataBooks =
        data.books && Array.isArray(data.books)
          ? data.books
              .map((item) => {
                let TreatmentJson = item?.TreatmentJson
                  ? JSON.parse(item?.TreatmentJson)
                  : "";

                return {
                  ...item,
                  start: item.BookDate,
                  end: moment(item.BookDate)
                    .add(item.RootMinutes || 90, "minutes")
                    .toDate(),
                  title: item.RootTitles,
                  className: `fc-event-solid-${getStatusClss(
                    item.Status,
                    item
                  )}`,
                  MemberCurrent: {
                    FullName:
                      item?.IsAnonymous ||
                      item.Member?.MobilePhone === "0000000000"
                        ? item?.FullName
                        : item?.Member?.FullName,
                    MobilePhone:
                      item?.IsAnonymous ||
                      item.Member?.MobilePhone === "0000000000"
                        ? item?.Phone
                        : item?.Member?.MobilePhone,
                  },
                  isBook: true,
                  StaffIds:
                    item.UserServices && item.UserServices.length > 0
                      ? item.UserServices.map((x) => x.ID)
                      : [],
                  RoomID: TreatmentJson?.ID || "",
                  RoomTitle: TreatmentJson?.label || "",
                };
              })
              .filter((item) => item.Status !== "TU_CHOI")
          : [];

      let dataBooksAuto =
        data.osList && Array.isArray(data.osList)
          ? data.osList.map((item) => {
              let obj = {
                ...item,
                Status: item?.os?.Status,
                AtHome: false,
                Member: item.member,
                MemberCurrent: {
                  FullName: item?.member?.FullName,
                  MobilePhone: item?.member?.MobilePhone,
                },
                start: item.os.BookDate,
                end: moment(item.os.BookDate)
                  .add(item.os.RootMinutes || 90, "minutes")
                  .toDate(),
                BookDate: item.os.BookDate,
                title: item.os.Title,
                RootTitles: item.os.ProdService2 || item.os.ProdService,
                className: `fc-event-solid-${getStatusClss(item.os.Status)} ${
                  item?.os?.RoomStatus === "done" ? "bg-stripes" : ""
                }`,
                StaffIds:
                  item.staffs && item.staffs.length > 0
                    ? item.staffs.map((x) => x.ID)
                    : [],
                RoomID: item?.os?.RoomID || "",
                RoomTitle: "",
              };
              let newRooms = [];
              if (rsRooms && rsRooms.length > 0) {
                for (let v1 of rsRooms) {
                  for (let v2 of v1?.ListRooms || []) {
                    newRooms = [...newRooms, ...(v2?.Children || [])];
                  }
                }
              }
              if (item?.os?.RoomID) {
                let index = newRooms.findIndex(
                  (x) => x.ID === item?.os?.RoomID
                );
                if (index > -1) obj.RoomTitle = newRooms[index].label;
              }
              return obj;
            })
          : [];

      dataBooks = dataBooks.filter(
        (x) =>
          dataBooksAuto.findIndex((o) => o?.Member?.ID === x?.Member?.ID) === -1
      );

      const { data: dataStaffs } = await CalendarCrud.getStaffs({
        StockID: AuthCrStockID,
        All: true,
      });

      const ListStaffs =
        Array.isArray(dataStaffs) && dataStaffs.length > 0
          ? dataStaffs.map((item) => ({
              ...item,
              id: item.id,
              title: item.text,
            }))
          : [];
      let rs = [];

      if (ListStaffs && ListStaffs.length > 0) {
        for (let staff of ListStaffs) {
          let newStaff = { ...staff, Offlines: [], Books: [] };
          if (dataOffline && dataOffline.length > 0) {
            newStaff.Offlines = dataOffline.filter(
              (off) =>
                off.resourceIds &&
                off.resourceIds.includes(staff.id) &&
                moment(
                  moment(CrDate).format("YYYY-MM-DD HH:mm"),
                  "YYYY-MM-DD HH:mm"
                ).isBetween(
                  moment(moment(off.start, "YYYY-MM-DD HH:mm")),
                  moment(moment(off.end, "YYYY-MM-DD HH:mm")),
                  null,
                  "[]"
                )
            );
          }
          if (dataBooks && dataBooks.length > 0) {
            let StaffDataBooks = dataBooks.filter(
              (x) =>
                x.StaffIds &&
                x.StaffIds.includes(staff.id) &&
                moment(
                  moment(CrDate).format("YYYY-MM-DD HH:mm"),
                  "YYYY-MM-DD HH:mm"
                ).isBetween(
                  moment(moment(x.start, "YYYY-MM-DD HH:mm")),
                  moment(moment(x.end, "YYYY-MM-DD HH:mm")),
                  null,
                  "[]"
                )
            );
            newStaff.Books = [...newStaff.Books, ...StaffDataBooks];
          }
          if (dataBooksAuto && dataBooksAuto.length > 0) {
            let StaffDataBooksAuto = dataBooksAuto.filter(
              (x) =>
                x.StaffIds &&
                x.StaffIds.includes(staff.id) &&
                moment(
                  moment(CrDate).format("YYYY-MM-DD HH:mm"),
                  "YYYY-MM-DD HH:mm"
                ).isBetween(
                  moment(moment(x.start, "YYYY-MM-DD HH:mm")),
                  moment(moment(x.end, "YYYY-MM-DD HH:mm")),
                  null,
                  "[)"
                )
            );
            newStaff.Books = [...newStaff.Books, ...StaffDataBooksAuto];
          }
          rs.push(newStaff);
        }
      }

      let Rooms = [];

      if (AuthCrStockID) {
        let index =
          rsRooms &&
          rsRooms.findIndex((x) => Number(x.StockID) === Number(AuthCrStockID));
        if (
          index > -1 &&
          rsRooms[index].ListRooms &&
          rsRooms[index].ListRooms.length > 0
        ) {
          Rooms = rsRooms[index].ListRooms.map((x) => ({
            label: x.label,
            groupid: x.ID,
            options:
              x.Children && x.Children.length > 0
                ? x.Children.map((o) => {
                    let obj = {
                      ID: o.ID,
                      label: o.label,
                      value: o.ID,
                      Books: [],
                    };
                    obj.Books = [...dataBooks, ...dataBooksAuto].filter(
                      (k) =>
                        k.RoomID &&
                        k.RoomID === o.ID &&
                        moment(
                          moment(CrDate).format("YYYY-MM-DD HH:mm"),
                          "YYYY-MM-DD HH:mm"
                        ).isBetween(
                          moment(moment(k.start, "YYYY-MM-DD HH:mm")),
                          moment(moment(k.end, "YYYY-MM-DD HH:mm")),
                          null,
                          "[]"
                        )
                    );
                    // obj.Books = rs.filter(
                    //   (n) =>
                    //     n.Books &&
                    //     n.Books.length > 0 &&
                    //     n.Books.some((k) => k.RoomID && k.RoomID === o.ID)
                    // );
                    return obj;
                  })
                : [],
          }));
        }
      }
      rs = rs
        // .map((x) => {
        //   let obj = { ...x, Sort: 0 };
        //   if (obj.Offlines && obj.Offlines.length > 0) {
        //     obj.Sort = 10;
        //   } else if (obj.Books && obj.Books.length > 0) {
        //     if (obj.Books.some((x) => x.Status === "done")) {
        //       obj.Sort = 1;
        //     } else if (obj.Books.some((x) => x.Status === "doing")) {
        //       obj.Sort = 2;
        //     } else if (obj.Books.some((x) => x.Status === "XAC_NHAN")) {
        //       obj.Sort = 3;
        //     }
        //   }
        //   return obj;
        // })
        .sort((a, b) => a?.source?.Order - b?.source?.Order);
      return {
        Books: rs,
        Rooms,
      };
    },
    enabled: visible && Boolean(CrDate),
    keepPreviousData: true,
  });

  const onHide = () => setVisible(false);

  const getClassWrap = (item) => {
    if (item?.Offlines && item.Offlines.length > 0) {
      return "bg-danger border-danger text-white";
    } else if (item?.Books && item.Books.length > 0) {
      let DANG_THUC_HIEN = item.Books.some((x) => x.Status === "doing");
      if (DANG_THUC_HIEN) return "bg-success border-success text-white";

      let XAC_NHAN = item.Books.some((x) => x.Status === "XAC_NHAN");
      if (XAC_NHAN) return "bg-primary border-primary text-white";
    } else {
      return "bg-[#fffde0]";
    }
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
              <div className="text-xl font-medium">Lịch hiện tại</div>
              <div className="flex gap-3">
                <div className="w-[150px]">
                  <DatePicker
                    locale={vi}
                    selected={CrDate}
                    onChange={(date) => setCrDate(date)}
                    className="!h-11 form-control !rounded-[4px] !text-[15px]"
                    shouldCloseOnSelect={true}
                    dateFormat="HH:mm"
                    placeholderText="Chọn thời gian"
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={1}
                  />
                </div>
                {/* <button
                        type="submit"
                        className="rounded-[4px] w-[80px] text-white bg-primary"
                      >
                        {!isLoading && !isFetching && <span>Kiểm tra</span>}

                        {(isLoading || isFetching) && (
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
                      </button> */}
                <button
                  type="button"
                  className="rounded-[4px] w-11 text-primary"
                  onClick={() => setCrDate(new Date())}
                >
                  {!isLoading && !isFetching && (
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

                  {(isLoading || isFetching) && (
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
                  className="flex items-center justify-center w-12 cursor-pointer h-11"
                  onClick={onHide}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex h-[calc(100%-73px)] relative">
              <div className="relative flex-1 h-full px-4 pt-8 pb-4 overflow-auto">
                {isLoading && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 xl:gap-8 xl:grid-cols-5">
                    {Array(5)
                      .fill()
                      .map((_, index) => (
                        <div
                          className="border relative rounded min-h-[110px] cursor-pointer bg-[#fffde0]"
                          key={index}
                        >
                          <div className="absolute left-2/4 -translate-x-2/4 -top-5">
                            <div className="relative w-16 h-16 p-1 bg-white border rounded-full font-inter border-primary">
                              <div className="relative cursor-pointer aspect-square">
                                <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded-full animate-pulse">
                                  <svg
                                    className="w-6 h-6 text-gray-200 dark:text-gray-600"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 20 18"
                                  >
                                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div className="mt-1.5 font-medium text-center">
                              <div className="h-3.5 bg-gray-200 rounded-full dark:bg-gray-700 w-16 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="pt-[90px] px-4 pb-3">
                            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-2/4 mb-1.5"></div>
                            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                {!isLoading && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 xl:gap-8 xl:grid-cols-5">
                    {data?.Books &&
                      data?.Books.map((item, index) => (
                        <div
                          className={clsx(
                            "border relative rounded min-h-[110px] cursor-pointer",
                            getClassWrap(item)
                          )}
                          key={index}
                          onClick={() => {
                            if (!item?.Books || item?.Books.length === 0) {
                              if (
                                !item?.Offlines ||
                                item?.Offlines.length === 0
                              ) {
                                setInitialValue({
                                  UserServiceIDs: [
                                    {
                                      value: item.id,
                                      label: item.text,
                                    },
                                  ],
                                });
                                onOpenModal();
                              }
                            } else {
                              if (item?.Books[0]?.os) {
                                // window?.top?.BANGLICH_BUOI &&
                                //   window?.top?.BANGLICH_BUOI(
                                //     item?.Books[0],
                                //     onRefresh
                                //   );
                                window.top.location.href = `/admin/?mdl=store&act=sell#mp:${item?.Books[0]?.os?.MemberID}`;
                              } else {
                                setInitialValue(item?.Books[0]);
                                onOpenModal();
                              }
                            }
                          }}
                        >
                          <div className="absolute left-2/4 -translate-x-2/4 -top-5">
                            <div className="relative w-16 h-16 p-1 bg-white border rounded-full font-inter border-primary">
                              <div className="relative cursor-pointer aspect-square">
                                <img
                                  className="object-cover object-top w-full h-full rounded-full"
                                  src={toAbsoluteUser(item?.photo, "/")}
                                  alt={item.title}
                                  onError={(e) => {
                                    if (
                                      e.target.src !==
                                      toAbsoluteUrl("/assets/images/blank.png")
                                    ) {
                                      e.target.src = toAbsoluteUrl(
                                        "/assets/images/blank.png"
                                      );
                                    }
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    let Photos = [
                                      {
                                        src: toAbsoluteUser(item?.photo, "/"),
                                      },
                                    ];
                                    let newPhotoJSON = item?.source?.PhotoJSON
                                      ? JSON.parse(item?.source?.PhotoJSON)
                                      : null;
                                    if (newPhotoJSON) {
                                      Photos = [
                                        ...Photos,
                                        ...newPhotoJSON.map((x) => ({
                                          src: toAbsoluteUser(
                                            x,
                                            "/Upload/image/"
                                          ),
                                        })),
                                      ];
                                    }
                                    if (Photos && Photos.length > 1) {
                                      window.top?.$?.magnificPopup &&
                                        window.top?.$?.magnificPopup.open({
                                          items: Photos,
                                          gallery: {
                                            enabled: true,
                                          },
                                          type: "image",
                                        });
                                    } else {
                                      window.top?.$?.magnificPopup &&
                                        window.top?.$?.magnificPopup.open({
                                          items: {
                                            src: toAbsoluteUser(
                                              item?.photo,
                                              "/"
                                            ),
                                          },
                                          type: "image",
                                        });
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <div className="mt-1.5 font-medium text-center">
                              {item.title}
                            </div>
                          </div>
                          {item.Books && item.Books.length > 0 && (
                            <div className="pt-[90px] px-4 pb-3">
                              {item.Books.map((book, i) => (
                                <div key={i}>
                                  <div className="text-[12px] font-light">
                                    <div className="mb-px">
                                      {book?.Member?.FullName || ""}
                                      {book?.RoomTitle && (
                                        <span className="pl-1">
                                          (Phòng {book?.RoomTitle})
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      {moment(book.start).format("HH:mm")}
                                      <span className="px-1">-</span>
                                      {moment(book.end).format("HH:mm")}
                                    </div>
                                  </div>
                                  {book?.RootTitles && (
                                    <div className="text-[12px] font-light mt-1">
                                      {book?.RootTitles}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <div className="bg-[#e5e7eb] w-[250px] p-4 h-full overflow-auto">
                {isLoading && (
                  <>
                    {Array(2).fill((_, index) => (
                      <div className="group" key={index}>
                        <div className="relative flex items-center">
                          <div className="relative z-10 pr-2 font-medium text-white bg-primary max-w-[85%] w-[70px] h-[25px] animate-pulse truncate rounded-[3px] px-2 uppercase text-[13px] pt-1 pb-px"></div>
                          <div className="flex-1 h-[1px] bg-primary top-3 left-0 animate-pulse" />
                        </div>
                        <div className="flex flex-col gap-1.5 py-3 group-last:!pb-0">
                          <div className="p-2 bg-white text-[13px] rounded-[4px] flex items-center gap-2 cursor-pointer animate-pulse">
                            <div className="w-3.5 h-3.5 rounded-full bg-primary border-primary text-white" />
                          </div>
                          <div className="animate-pulse p-2 bg-white text-[13px] rounded-[4px] flex items-center gap-2 cursor-pointer">
                            <div className="w-3.5 h-3.5 rounded-full bg-success border-success text-white" />
                          </div>
                          <div className="animate-pulse p-2 bg-white text-[13px] rounded-[4px] flex items-center gap-2 cursor-pointer">
                            <div className="w-3.5 h-3.5 rounded-full bg-warning" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {!isLoading && (
                  <>
                    {data?.Rooms &&
                      data?.Rooms.map((gr, index) => (
                        <div className="group" key={index}>
                          <div className="relative flex">
                            <div className="relative z-10 pr-2 font-medium text-white bg-primary max-w-[85%] truncate rounded-[3px] px-2 uppercase text-[13px] pt-1 pb-px">
                              {gr.label}
                            </div>
                            <div className="absolute w-full h-[1px] bg-primary top-3 left-0"></div>
                          </div>
                          <div className="flex flex-col gap-1.5 py-3 group-last:!pb-0">
                            {gr.options &&
                              gr.options.map((room, i) => (
                                <div
                                  className="p-2 bg-white text-[13px] rounded-[4px] flex items-center gap-2 cursor-pointer"
                                  key={i}
                                  onClick={() => {
                                    if (
                                      !room?.Books ||
                                      room?.Books.length === 0
                                    ) {
                                      setInitialValue({
                                        TreatmentJson: {
                                          label: room?.label,
                                          value: room?.value,
                                        },
                                      });
                                      onOpenModal();
                                    } else {
                                      if (room?.Books[0]?.os) {
                                        // window?.top?.BANGLICH_BUOI &&
                                        //   window?.top?.BANGLICH_BUOI(
                                        //     room?.Books[0],
                                        //     onRefresh
                                        //   );
                                        window.top.location.href = `/admin/?mdl=store&act=sell#mp:${room?.Books[0]?.os?.MemberID}`;
                                      } else {
                                        setInitialValue(room?.Books[0]);
                                        onOpenModal();
                                      }
                                    }
                                  }}
                                >
                                  {room.Books && room.Books.length > 0 ? (
                                    <div
                                      className={clsx(
                                        "w-3.5 h-3.5 rounded-full",
                                        getClassWrap(room)
                                      )}
                                    ></div>
                                  ) : (
                                    <div
                                      className={clsx(
                                        "w-3.5 h-3.5 rounded-full bg-warning"
                                      )}
                                    ></div>
                                  )}
                                  <div className="flex-1 truncate">
                                    {room.label}
                                  </div>
                                  {room.Books && room.Books.length > 0 && (
                                    <div className="w-[90px] text-[12px]">
                                      {moment(room.Books[0].start).format(
                                        "HH:mm"
                                      )}
                                      <span className="px-px">-</span>
                                      {moment(room.Books[0].end).format(
                                        "HH:mm"
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                  </>
                )}
              </div>
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

export default PickerCurrentCalendar;
