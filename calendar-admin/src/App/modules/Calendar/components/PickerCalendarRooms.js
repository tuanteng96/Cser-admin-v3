import { forwardRef, useImperativeHandle, useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useQuery } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";

import moment from "moment";
import { Form, Formik } from "formik";
import clsx from "clsx";
import {
  toAbsoluteUrl,
  toAbsoluteUser,
} from "../../../../helpers/AssetsHelpers";
import PickerReportStaffService from "./PickerReportStaffService";
import PickerReportMassageV2 from "./PickerReportMassageV2";

const PickerCalendarRooms = forwardRef(
  ({ children, TimeOpen, TimeClose, onOpenModal, setInitialValue }, ref) => {
    const { AuthCrStockID, checkout_time } = useSelector(
      ({ Auth, JsonConfig }) => ({
        AuthCrStockID: Auth.CrStockID,
        checkout_time: Boolean(JsonConfig?.Admin?.checkout_time),
      })
    );

    const [visible, setVisible] = useState(false);

    const open = () => {
      setVisible(true);
    };

    useImperativeHandle(ref, () => ({
      open,
    }));

    const [filters, setFilters] = useState({
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

    const { data, isFetching, isLoading, refetch } = useQuery({
      queryKey: ["ListCalendarRooms", { filters }],
      queryFn: async () => {
        let CrDate = new Date();
        const newFilters = {
          ...filters,
          IsMassage: checkout_time,
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
                    RoomID: TreatmentJson?.ID || TreatmentJson?.value || "",
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
                  ID: item?.os?.ID,
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

        // dataBooks = dataBooks.filter(
        //   (x) =>
        //     dataBooksAuto.findIndex((o) => o?.Member?.ID === x?.Member?.ID) ===
        //     -1
        // );

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
            let newStaff = {
              ...staff,
              Offlines: [],
              Books: [],
              NextBooks: [],
              Book: null,
            };
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
              let StaffNextBooks = dataBooks.filter(
                (x) =>
                  x.StaffIds &&
                  x.StaffIds.includes(staff.id) &&
                  (moment(
                    moment(CrDate).format("YYYY-MM-DD HH:mm"),
                    "YYYY-MM-DD HH:mm"
                  ).isBetween(
                    moment(moment(x.start, "YYYY-MM-DD HH:mm")),
                    moment(moment(x.end, "YYYY-MM-DD HH:mm")),
                    null,
                    "[]"
                  ) ||
                    moment(
                      moment(CrDate).format("YYYY-MM-DD HH:mm"),
                      "YYYY-MM-DD HH:mm"
                    ).diff(
                      moment(moment(x.start, "YYYY-MM-DD HH:mm")),
                      "minutes"
                    ) <= 0)
              );

              newStaff.Books = [...newStaff.Books, ...StaffDataBooks];

              newStaff.NextBooks = [...newStaff.NextBooks, ...StaffNextBooks];
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
                    "[]"
                  )
              );

              newStaff.Books = [...newStaff.Books, ...StaffDataBooksAuto];
            }
            rs.push(newStaff);
          }
        }

        rs = rs
          .map((x) => {
            let obj = {
              ...x,
              Books: x.Books.sort(
                (a, b) => new Date(a.BookDate) - new Date(b.BookDate)
              ),
              NextBooks: x.NextBooks.sort(
                (a, b) => new Date(a.BookDate) - new Date(b.BookDate)
              ),
            };
            obj.Book = obj.Books && obj.Books.length > 0 ? obj.Books[0] : null;
            obj.NextBooks = obj.NextBooks?.filter(
              (o) => o?.ID !== obj.Book?.ID
            );

            if (obj.Book && obj.Book?.os) {
              obj.NextBooks = obj.NextBooks.filter(
                (x) =>
                  !moment(
                    moment(x.start).format("YYYY-MM-DD HH:mm"),
                    "YYYY-MM-DD HH:mm"
                  ).isBetween(
                    moment(moment(obj.Book?.BookDate, "YYYY-MM-DD HH:mm")),
                    moment(
                      moment(obj.Book?.BookDate, "YYYY-MM-DD HH:mm").add(
                        obj.Book?.os.RootMinutes || 90,
                        "minutes"
                      )
                    ),
                    null,
                    "()"
                  )
              );
            }

            return obj;
          })
          .sort((a, b) => a?.source?.Order - b?.source?.Order);

        let Rooms = [];

        if (AuthCrStockID) {
          let index =
            rsRooms &&
            rsRooms.findIndex(
              (x) => Number(x.StockID) === Number(AuthCrStockID)
            );
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
                        Book: null,
                        NextBooks: [],
                      };
                      obj.Books = rs
                        .filter(
                          (k) => k.Book?.RoomID && k.Book?.RoomID === o.ID
                        )
                        .sort(
                          (a, b) =>
                            new Date(a?.Book?.BookDate) -
                            new Date(b?.Book?.BookDate)
                        );
                      obj.Book =
                        obj.Books && obj.Books.length > 0 && obj.Books[0].Book
                          ? obj.Books[0].Book
                          : null;

                      let RoomNextBooks = [...(dataBooks || [])]
                        .filter(
                          (x) =>
                            x.RoomID &&
                            x.RoomID === o.ID &&
                            (moment(
                              moment(CrDate).format("YYYY-MM-DD HH:mm"),
                              "YYYY-MM-DD HH:mm"
                            ).isBetween(
                              moment(moment(x.start, "YYYY-MM-DD HH:mm")),
                              moment(moment(x.end, "YYYY-MM-DD HH:mm")),
                              null,
                              "[]"
                            ) ||
                              moment(
                                moment(CrDate).format("YYYY-MM-DD HH:mm"),
                                "YYYY-MM-DD HH:mm"
                              ).diff(
                                moment(moment(x.start, "YYYY-MM-DD HH:mm")),
                                "minutes"
                              ) <= 0)
                        )
                        .filter((x) => x.ID !== obj.Book?.ID);

                      if (obj.Book && obj.Book?.os) {
                        RoomNextBooks = RoomNextBooks.filter(
                          (x) =>
                            !moment(
                              moment(x.start).format("YYYY-MM-DD HH:mm"),
                              "YYYY-MM-DD HH:mm"
                            ).isBetween(
                              moment(
                                moment(obj.Book?.BookDate, "YYYY-MM-DD HH:mm")
                              ),
                              moment(
                                moment(
                                  obj.Book?.BookDate,
                                  "YYYY-MM-DD HH:mm"
                                ).add(obj.Book?.os.RootMinutes || 90, "minutes")
                              ),
                              null,
                              "()"
                            )
                        );
                      }

                      obj.NextBooks = RoomNextBooks.sort(
                        (a, b) => new Date(a.BookDate) - new Date(b.BookDate)
                      );
                      return obj;
                    })
                  : [],
            }));
          }
        }

        return {
          Books: rs,
          Rooms,
        };
      },
      keepPreviousData: true,
      enabled: visible && Boolean(filters.From),
    });

    const getClassWrap = (item) => {
      if (item?.Offlines && item.Offlines.length > 0) {
        return "bg-danger border-danger text-white";
      } else if (item?.Book) {
        if (item?.Book?.Status === "doing") {
          return "bg-success border-success text-white";
        }
        if (item?.Book?.Status === "XAC_NHAN") {
          return "bg-primary border-primary text-white";
        }
      } else {
        return "bg-[#fffde0]";
      }
    };

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

    const onHide = () => setVisible(false);

    return (
      <>
        {children({
          open: () => setVisible(true),
        })}
        {visible &&
          createPortal(
            <div className="fixed top-0 left-0 z-[1003] bg-white !h-full w-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="hidden text-xl font-medium lg:block">
                  Nhân viên / Phòng
                </div>
                <Formik
                  initialValues={filters}
                  onSubmit={async (values) => {
                    setFilters((prevState) => ({
                      ...prevState,
                      ...values,
                    }));
                  }}
                  enableReinitialize
                >
                  {(formikProps) => {
                    // const { values, setFieldValue } = formikProps;

                    return (
                      <Form className="flex gap-2">
                        {/* <div className="w-[180px]">
                        <DatePicker
                          locale={vi}
                          selected={
                            values.CrDate ? new Date(values.CrDate) : null
                          }
                          onChange={(date) => setFieldValue("CrDate", date)}
                          className="!h-11 form-control !rounded-[4px] !text-[15px]"
                          shouldCloseOnSelect={true}
                          dateFormat="dd/MM/yyyy"
                          placeholderText="Chọn ngày"
                        />
                      </div>
                      <button
                        type="submit"
                        className="rounded-[4px] w-12 text-white bg-primary"
                      >
                        {!isLoading && !isFetching && <span>Lọc</span>}

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
                          onClick={refetch}
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
                        <PickerReportStaffService>
                          {({ open }) => (
                            <button
                              onClick={open}
                              type="button"
                              className="rounded-[4px] px-2.5 text-[#3F4254] bg-[#D1D3E0]"
                            >
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
                                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                                />
                              </svg>
                            </button>
                          )}
                        </PickerReportStaffService>
                        <PickerReportMassageV2>
                          {({ open }) => (
                            <button
                              onClick={open}
                              type="button"
                              className="rounded-[4px] px-2.5 text-[#3F4254] bg-[#D1D3E0]"
                            >
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
                                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                                />
                              </svg>
                            </button>
                          )}
                        </PickerReportMassageV2>
                        <button
                          onClick={onOpenModal}
                          type="button"
                          className="rounded-[4px] px-4 text-white bg-primary"
                        >
                          Tạo đặt lịch
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
                      </Form>
                    );
                  }}
                </Formik>
              </div>
              <div className="relative p-4 grow [&>*]:h-full lg:h-[calc(100%-73px)] flex">
                <div className="relative flex-1 h-full pt-8 pr-5 overflow-auto">
                  {isLoading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 xl:gap-x-5 xl:gap-y-8 xl:grid-cols-4 2xl:grid-cols-5">
                      {Array(4)
                        .fill()
                        .map((_, index) => (
                          <div
                            className="border relative rounded min-h-[140px] cursor-pointer bg-[#fffde0]"
                            key={index}
                          >
                            <div className="absolute left-2/4 -translate-x-2/4 -top-5">
                              <div className="relative p-1 bg-white border rounded-full w-11 h-11 lg:w-16 lg:h-16 font-inter border-primary">
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
                            <div className="pt-[90px] lg:px-4 px-2 pb-3">
                              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-2/4 mb-1.5"></div>
                              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                  {!isLoading && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 xl:gap-x-5 xl:gap-y-8 xl:grid-cols-4 2xl:grid-cols-5">
                      {data?.Books &&
                        data?.Books.map((item, index) => (
                          <div
                            className={clsx(
                              "border relative rounded min-h-[140px] cursor-pointer",
                              getClassWrap(item)
                            )}
                            key={index}
                            onClick={() => {
                              if (!item?.Book) {
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
                                if (item?.Book?.os) {
                                  // window?.top?.BANGLICH_BUOI &&
                                  //   window?.top?.BANGLICH_BUOI(
                                  //     item?.Books[0],
                                  //     onRefresh
                                  //   );
                                  window.top.location.href = `/admin/?mdl=store&act=sell#mp:${item?.Books[0]?.os?.MemberID}`;
                                } else {
                                  setInitialValue(item?.Book);
                                  onOpenModal();
                                }
                              }
                            }}
                          >
                            <div className="absolute flex flex-col items-center w-full left-2/4 -translate-x-2/4 -top-5">
                              <div className="relative p-1 bg-white border rounded-full w-11 h-11 lg:w-16 lg:h-16 font-inter border-primary">
                                <div className="relative cursor-pointer aspect-square">
                                  <img
                                    className="object-cover object-top w-full h-full rounded-full"
                                    src={toAbsoluteUser(item?.photo, "/")}
                                    alt={item.title}
                                    onError={(e) => {
                                      if (
                                        e.target.src !==
                                        toAbsoluteUrl(
                                          "/assets/images/blank.png"
                                        )
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
                              <div className="mt-1.5 font-medium text-center text-[12px] lg:text-[14px]">
                                {item.title}
                              </div>
                            </div>
                            {((item.NextBooks && item.NextBooks.length > 0) ||
                              item.Book) && (
                              <div className="lg:pt-[90px] pt-[60px] lg:px-4 px-2 pb-3">
                                {item.Book && (
                                  <div
                                    className={clsx(
                                      item.NextBooks &&
                                        item.NextBooks.length > 0 &&
                                        "pb-2 mb-2 border-b border-dashed"
                                    )}
                                  >
                                    <div className="text-[12px] font-light">
                                      <div className="mb-px">
                                        {item.Book?.Member?.FullName || ""}
                                        {item.Book?.RoomTitle && (
                                          <span className="pl-1">
                                            (Phòng {item.Book?.RoomTitle})
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        {moment(item.Book.start).format(
                                          "HH:mm"
                                        )}
                                        <span className="px-1">-</span>
                                        {moment(item.Book.end).format("HH:mm")}
                                      </div>
                                    </div>
                                    {item.Book?.RootTitles && (
                                      <div className="text-[12px] font-light mt-px">
                                        {item.Book?.RootTitles}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {item.NextBooks && item.NextBooks.length > 0 && (
                                  <div>
                                    {item.NextBooks.map((book, i) => (
                                      <div
                                        className="p-2 text-black bg-white rounded-[3px] mb-1.5 last:!mb-0"
                                        key={i}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (book?.os) {
                                            // window?.top?.BANGLICH_BUOI &&
                                            //   window?.top?.BANGLICH_BUOI(
                                            //     item?.Books[0],
                                            //     onRefresh
                                            //   );
                                            window.top.location.href = `/admin/?mdl=store&act=sell#mp:${book?.os?.MemberID}`;
                                          } else {
                                            setInitialValue(book);
                                            onOpenModal();
                                          }
                                        }}
                                      >
                                        <div className="text-[12px] font-light">
                                          <div className="mb-px">
                                            {book?.Member?.FullName || ""}
                                            {/* {book?.RoomTitle && (
                                                    <span className="pl-1">
                                                      (Phòng {book?.RoomTitle})
                                                    </span>
                                                  )} */}
                                          </div>
                                          <div>
                                            {moment(book.start).format("HH:mm")}
                                            <span className="px-1">-</span>
                                            {moment(book.end).format("HH:mm")}
                                          </div>
                                        </div>
                                        {book?.RootTitles && (
                                          <div className="text-[12px] font-light mt-px">
                                            {book?.RootTitles}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="bg-[#e5e7eb] lg:w-[250px] w-[90px] lg:p-4 p-2 overflow-auto h-full">
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
                                    className="bg-white rounded-[4px]"
                                    key={i}
                                  >
                                    <div
                                      className="p-2 lg:text-[13px] text-[11px] flex-col lg:flex-row flex items-center lg:gap-2 cursor-pointer"
                                      key={i}
                                      onClick={() => {
                                        if (!room?.Book) {
                                          setInitialValue({
                                            TreatmentJson: {
                                              label: room?.label,
                                              value: room?.value,
                                            },
                                          });
                                          onOpenModal();
                                        } else {
                                          if (room?.Book?.os) {
                                            // window?.top?.BANGLICH_BUOI &&
                                            //   window?.top?.BANGLICH_BUOI(
                                            //     room?.Books[0],
                                            //     onRefresh
                                            //   );
                                            window.top.location.href = `/admin/?mdl=store&act=sell#mp:${room?.Book?.os?.MemberID}`;
                                          } else {
                                            setInitialValue(room?.Book);
                                            onOpenModal();
                                          }
                                        }
                                      }}
                                    >
                                      {room.Book ? (
                                        <div
                                          className={clsx(
                                            "w-3.5 h-3.5 rounded-full",
                                            getClassWrap({ Book: room.Book })
                                          )}
                                        ></div>
                                      ) : (
                                        <div
                                          className={clsx(
                                            "w-3.5 h-3.5 rounded-full bg-warning"
                                          )}
                                        ></div>
                                      )}
                                      <div className="mt-1 truncate lg:flex-1 lg:mt-0">
                                        {room.label}
                                      </div>
                                      {room.Book && (
                                        <div className="lg:w-[90px] w-full lg:text-[12px] text-[11px] flex lg:justify-end justify-center">
                                          {moment(room.Book.start).format(
                                            "HH:mm"
                                          )}
                                          <span className="px-px">-</span>
                                          {moment(room.Book.end).format(
                                            "HH:mm"
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {room.NextBooks &&
                                      room.NextBooks.length > 0 && (
                                        <div className="border-t border-dashed lg:text-[12px] text-[11px] flex px-3 py-2 gap-1.5 flex-wrap">
                                          {room.NextBooks.map((o, k) => (
                                            <div
                                              className="text-[#3F4254] bg-[#E4E6EF] px-1.5 py-px rounded-[3px] cursor-pointer"
                                              key={k}
                                              onClick={() => {
                                                setInitialValue(o);
                                                onOpenModal();
                                              }}
                                            >
                                              {moment(o.start).format("HH:mm")}
                                              <span className="px-px">-</span>
                                              {moment(o.end).format("HH:mm")}
                                            </div>
                                          ))}
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
                {isLoading && (
                  <div className="absolute top-0 left-0 z-50 flex items-center justify-center w-full h-full">
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
);

export default PickerCalendarRooms;
