import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import ModalCalendar from "../../../components/ModalCalendar/ModalCalendar";
import SidebarCalendar from "../../../components/SidebarCalendar/SidebarCalendar";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "../../../_assets/sass/pages/_calendar.scss";
import CalendarCrud from "./_redux/CalendarCrud";
import { useWindowSize } from "../../../hooks/useWindowSize";
import _ from "lodash";
import CalendarStaff from "./CalendarStaff";
import { AppContext } from "../../App";
import ModalCalendarLock from "../../../components/ModalCalendarLock/ModalCalendarLock";

import moment from "moment";
import "moment/locale/vi";

moment.locale("vi");

var todayDate = moment().startOf("day");
// var YM = todayDate.format("YYYY-MM");
// var YESTERDAY = todayDate
//   .clone()
//   .subtract(1, "day")
//   .format("YYYY-MM-DD");
var TODAY = todayDate.format("YYYY-MM-DD");
// var TOMORROW = todayDate
//   .clone()
//   .add(1, "day")
//   .format("YYYY-MM-DD");

const viLocales = {
  code: "vi",
  week: {
    dow: 0, // Sunday is the first day of the week.
    doy: 6, // The week that contains Jan 1st is the first week of the year.
  },
  buttonText: {
    prev: "Tháng trước",
    next: "Tháng sau",
    today: "Hôm nay",
    month: "Tháng",
    week: "Tuần",
    day: "Ngày",
    list: "Danh sách",
    timeGridWeek: "Tuần",
  },
  weekText: "Sm",
  allDayText: "Cả ngày",
  moreLinkText: "Xem thêm",
  noEventsText: "Không có dịch vụ",
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
    return "success";
  }
  if (Status === "doing") {
    return "info";
  }
  if (Status === "done") {
    return "secondary";
  }
};

function CalendarPage(props) {
  const [isModal, setIsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnLoading, setBtnLoading] = useState({
    isBtnBooking: false,
    isBtnDelete: false,
  });
  const [isFilter, setIsFilter] = useState(false);
  const [filters, setFilters] = useState({
    Status: [
      "XAC_NHAN",
      "XAC_NHAN_TU_DONG",
      "CHUA_XAC_NHAN",
      "DANG_THUC_HIEN",
      "THUC_HIEN_XONG",
    ],
  });
  const [initialValue, setInitialValue] = useState({});
  const [Events, setEvents] = useState([]);
  const [StaffFull, setStaffFull] = useState([]);
  const [initialView, setInitialView] = useState("timeGridWeek");
  const [headerTitle, setHeaderTitle] = useState("");
  const [StaffOffline, setStaffOffline] = useState([]);
  const [isModalLock, setIsModalLock] = useState(false);
  const { width } = useWindowSize();

  const { AuthCrStockID, TimeOpen, TimeClose, StocksList } = useSelector(
    ({ Auth, JsonConfig }) => ({
      AuthCrStockID: Auth.CrStockID,
      StocksList: Auth?.Stocks.filter((x) => x.ParentID !== 0),
      TimeOpen: JsonConfig?.APP?.Working?.TimeOpen || "00:00:00",
      TimeClose: JsonConfig?.APP?.Working?.TimeClose || "23:59:00",
    })
  );

  const [elmHeight, setElmHeight] = useState(0);
  const [ListLock, setListLock] = useState({
    ListLocks: [],
  });
  const [lstTeles, setLstTeles] = useState([]);
  const [btnLoadingLock, setBtnLoadingLock] = useState(false);
  const calendarRef = useRef("");
  const { isTelesales } = useContext(AppContext);

  useEffect(() => {
    async function getLstTeles() {
      const { data } = await CalendarCrud.getConfigName("tagkh");
      if (data && data.length > 0) {
        const result = JSON.parse(data[0].Value);
        const newResult = result.map((item) => ({
          value: item.Title,
          label: item.Title,
          options:
            item.Children &&
            item.Children.map((o) => ({
              value: o.Title,
              label: o.Title,
            })),
        }));
        setLstTeles(newResult);
      }
    }

    getLstTeles();
  }, []);

  //Get Staff Full
  useEffect(() => {
    async function getStaffFull() {
      const { data } = await CalendarCrud.getStaffs({
        StockID: AuthCrStockID,
        All: true,
      });
      const newData =
        Array.isArray(data) && data.length > 0
          ? data.map((item) => ({ id: item.id, title: item.text }))
          : [];
      setStaffFull(newData);
    }

    getStaffFull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (filters && filters.From) {
      getBooking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    if (calendarRef?.current?.getApi()) {
      let calendarApi = calendarRef.current.getApi();
      setHeaderTitle(calendarApi.currentDataManager.data?.viewTitle);
    }
  }, [calendarRef]);

  useEffect(() => {
    getListLock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AuthCrStockID]);

  const getListLock = (callback) => {
    CalendarCrud.getConfigName(`giocam`)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const result = JSON.parse(data[0].Value);
          const newResult =
            result && result.length > 0
              ? result.map((lock) => ({
                  ...lock,
                  ListDisable:
                    lock.ListDisable && lock.ListDisable.length > 0
                      ? lock.ListDisable.filter((item) =>
                          moment().isSameOrBefore(
                            moment(item.Date, "DD/MM/YYYY"),
                            "day"
                          )
                        )
                          .map((item) => ({
                            ...item,
                            Date: moment(item.Date, "DD/MM/YYYY").toDate(),
                            TimeClose:
                              item.TimeClose && item.TimeClose.length > 0
                                ? item.TimeClose
                                : [{ Start: "", End: "" }],
                          }))
                          .sort(
                            (a, b) =>
                              moment(a.Date).valueOf() -
                              moment(b.Date).valueOf()
                          )
                      : [],
                }))
              : StocksList.map((o) => ({
                  StockID: o.ID,
                  ListDisable: [],
                }));
          setListLock({
            ListLocks: newResult,
          });
          callback && callback();
        }
      })
      .catch((error) => console.log(error));
  };

  const onSubmitLock = ({ ListLocks }) => {
    setBtnLoadingLock(true);
    const newListLock =
      ListLocks && ListLocks.length > 0
        ? ListLocks.map((lock) => ({
            ...lock,
            ListDisable:
              lock.ListDisable && lock.ListDisable.length > 0
                ? lock.ListDisable.filter((item) => item.Date).map((item) => ({
                    ...item,
                    Date: moment(item.Date).format("DD/MM/YYYY"),
                    TimeClose:
                      item.TimeClose && item.TimeClose.length > 0
                        ? item.TimeClose.map((time) => ({
                            Start: time.Start
                              ? time.Start
                              : item.TimeClose.length === 1
                              ? "00:00"
                              : null,
                            End: time.End
                              ? time.End
                              : item.TimeClose.length === 1
                              ? "23:59"
                              : null,
                          })).filter((time) => time.Start && time.End)
                        : [{ Start: "00:00", End: "23:59" }],
                  }))
                : [],
          }))
        : [];
    CalendarCrud.saveConfigName("giocam", newListLock)
      .then((response) => {
        getListLock(() => {
          onHideModalLock();
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const onRefresh = (callback) => {
    getBooking(() => callback && callback());
  };

  //Open Modal Booking
  const onOpenModal = () => {
    setIsModal(true);
  };

  window.top.NewBook = onOpenModal;

  //Edit Modal Booking
  const onHideModal = () => {
    setInitialValue({});
    setIsModal(false);
  };

  //
  const onOpenFilter = () => {
    setIsFilter(true);
  };
  //
  const onHideFilter = () => {
    setIsFilter(false);
  };

  //Get Text Toast
  const getTextToast = (Status) => {
    if (!Status) {
      return "Thêm mới lịch thành công !";
    }
    return "Cập nhập lịch thành công !";
  };

  const onSubmitBooking = async (values) => {
    setBtnLoading((prevState) => ({
      ...prevState,
      isBtnBooking: true,
    }));

    const objBooking = {
      ...values,
      MemberID: values.MemberID.value,
      RootIdS: values.RootIdS
        ? values.RootIdS.map((item) => item.value).toString()
        : "",
      UserServiceIDs:
        values.UserServiceIDs && values.UserServiceIDs.length > 0
          ? values.UserServiceIDs.map((item) => item.value).toString()
          : "",
      BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
      Status: values.Status ? values.Status : "XAC_NHAN",
      IsAnonymous: values.MemberID?.PassersBy || false,
    };

    if (values?.MemberID?.isCreate) {
      objBooking.FullName = values.MemberID?.text;
      objBooking.Phone = values.MemberID?.suffix;
    }

    const CurrentStockID = Cookies.get("StockID");
    const u_id_z4aDf2 = Cookies.get("u_id_z4aDf2");

    try {
      if (values?.MemberID?.isCreate && !values.MemberID?.PassersBy) {
        const objCreate = {
          member: {
            MobilePhone: values.MemberID?.suffix,
            FullName: values.MemberID?.text,
            IsAff: 1,
          },
        };
        const newMember = await CalendarCrud.createMember(objCreate);
        if (newMember?.error) {
          toast.error(newMember?.error || JSON.stringify(newMember), {
            position: toast.POSITION.TOP_RIGHT,
            autoClose: 1500,
          });
          setBtnLoading((prevState) => ({
            ...prevState,
            isBtnBooking: false,
          }));
          return;
        }
        objBooking.MemberID = newMember?.member?.ID || 0;
      }

      const dataPost = {
        booking: [objBooking],
      };

      await CalendarCrud.postBooking(dataPost, {
        CurrentStockID,
        u_id_z4aDf2,
      });

      if (values.Status === "KHACH_KHONG_DEN") {
        if (window?.GlobalConfig?.Admin?.kpiCancelFinish && values?.CreateBy) {
          let newData = {
            update: [
              {
                MemberID: values?.CreateBy,
                Status: window?.top?.GlobalConfig?.Admin?.kpiCancelFinish,
              },
            ]
          };
          await CalendarCrud.editTagsMember(newData);
        }
      }

      window.top.bodyEvent &&
        window.top.bodyEvent("ui_changed", {
          name: "cld_dat_lich_moi",
          mid: objBooking.MemberID || 0,
        });

      getBooking(() => {
        toast.success(getTextToast(values.Status), {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
        setBtnLoading((prevState) => ({
          ...prevState,
          isBtnBooking: false,
        }));
        onHideModal();
      });
    } catch (error) {
      console.log(error);
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnBooking: false,
      }));
    }
  };

  const onFinish = async (values) => {
    setBtnLoading((prevState) => ({
      ...prevState,
      isBtnBooking: true,
    }));

    const objBooking = {
      ...values,
      MemberID: values.MemberID.value,
      RootIdS: values.RootIdS.map((item) => item.value).toString(),
      UserServiceIDs:
        values.UserServiceIDs && values.UserServiceIDs.length > 0
          ? values.UserServiceIDs.map((item) => item.value).toString()
          : "",
      BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
      Status: "KHACH_DEN",
    };

    const CurrentStockID = Cookies.get("StockID");
    const u_id_z4aDf2 = Cookies.get("u_id_z4aDf2");

    try {
      if (values.IsMemberCurrent.IsAnonymous) {
        if (!values?.IsMemberCurrent?.MemberPhone) {
          const objCreate = {
            member: {
              MobilePhone: values?.IsMemberCurrent?.MemberCreate?.Phone,
              FullName: values?.IsMemberCurrent?.MemberCreate?.FullName,
            },
          };
          const newMember = await CalendarCrud.createMember(objCreate);
          if (newMember.error) {
            toast.error(newMember.error, {
              position: toast.POSITION.TOP_RIGHT,
              autoClose: 1500,
            });
            setBtnLoading((prevState) => ({
              ...prevState,
              isBtnBooking: false,
            }));
            return;
          }
          objBooking.MemberID = newMember?.member?.ID;
        } else {
          objBooking.MemberID = values?.IsMemberCurrent?.MemberPhone.ID;
        }
      }

      var bodyFormCheckIn = new FormData();
      bodyFormCheckIn.append("cmd", "checkin");
      bodyFormCheckIn.append("mid", objBooking.MemberID);
      bodyFormCheckIn.append("desc", "");
      await CalendarCrud.checkinMember(bodyFormCheckIn);

      const dataPost = {
        booking: [objBooking],
      };
      await CalendarCrud.postBooking(dataPost, {
        CurrentStockID,
        u_id_z4aDf2,
      });

      if (window?.GlobalConfig?.Admin?.kpiFinish && values?.CreateBy) {
        let newData = {
          update: [
            {
              MemberID: values?.CreateBy,
              Status: window?.top?.GlobalConfig?.Admin?.kpiFinish,
            },
          ],
        };
        await CalendarCrud.editTagsMember(newData);
      }

      window.top.bodyEvent &&
        window.top.bodyEvent("ui_changed", {
          name: "cld_thuc_hien_lich",
          mid: objBooking.MemberID || 0,
        });
      getBooking(() => {
        window.top.location.href = `/admin/?mdl=store&act=sell#mp:${objBooking.MemberID}`;
        toast.success(getTextToast(values.Status), {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
        setBtnLoading((prevState) => ({
          ...prevState,
          isBtnBooking: false,
        }));
        onHideModal();
      });
    } catch (error) {
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnBooking: false,
      }));
    }
  };

  const onDeleteBooking = async (values) => {
    setBtnLoading((prevState) => ({
      ...prevState,
      isBtnDelete: true,
    }));
    const CurrentStockID = Cookies.get("StockID");
    const u_id_z4aDf2 = Cookies.get("u_id_z4aDf2");
    const dataPost = {
      booking: [
        {
          ...values,
          MemberID: values.MemberID.value,
          RootIdS: values.RootIdS.map((item) => item.value).toString(),
          UserServiceIDs:
            values.UserServiceIDs && values.UserServiceIDs.length > 0
              ? values.UserServiceIDs.map((item) => item.value).toString()
              : "",
          BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
          Status: "TU_CHOI",
        },
      ],
    };

    try {
      await CalendarCrud.postBooking(dataPost, {
        CurrentStockID,
        u_id_z4aDf2,
      });

      if (window?.GlobalConfig?.Admin?.kpiCancel && values?.CreateBy) {
        let newData = {
          update: [
            {
              MemberID: values?.CreateBy,
              Status: window?.top?.GlobalConfig?.Admin?.kpiCancel,
            },
          ],
        };
        await CalendarCrud.editTagsMember(newData);
      }
      
      window.top.bodyEvent &&
        window.top.bodyEvent("ui_changed", {
          name: "cld_huy_lich",
          mid: values.MemberID.value || 0,
        });
      getBooking(() => {
        toast.success("Hủy lịch thành công !", {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
        setBtnLoading((prevState) => ({
          ...prevState,
          isBtnDelete: false,
        }));
        onHideModal();
      });
    } catch (error) {
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnDelete: false,
      }));
    }
  };

  const getFiltersBooking = (values) => {
    if (_.isEqual(values, filters)) {
      getBooking();
    } else {
      setFilters(values);
    }
  };

  const checkStar = (item) => {
    if (item?.Member?.MobilePhone !== "0000000000") return "";
    if (item?.Member?.MobilePhone === "0000000000" && item?.IsNew) return "**";
    else {
      return "*";
    }
  };

  const getBooking = (fn) => {
    !loading && setLoading(true);
    const newFilters = {
      ...filters,
      MemberID:
        filters.MemberID && Array.isArray(filters.MemberID)
          ? filters.MemberID.map((item) => item.value).toString()
          : "",
      From: filters.From ? moment(filters.From).format("YYYY-MM-DD") : "",
      To: filters.To ? moment(filters.To).format("YYYY-MM-DD") : "",
      Status:
        filters.Status && filters.Status.length > 0
          ? filters.Status.join(",")
          : "",
      UserServiceIDs:
        filters.UserServiceIDs && Array.isArray(filters.UserServiceIDs)
          ? filters.UserServiceIDs.map((item) => item.value).toString()
          : "",
      StatusMember: filters?.StatusMember ? filters?.StatusMember.value : "",
      StatusBook: filters?.StatusBook ? filters?.StatusBook.value : "",
      StatusAtHome: filters?.StatusAtHome ? filters?.StatusAtHome.value : "",
    };

    CalendarCrud.getBooking(newFilters)
      .then((data) => {
        setStaffOffline(data?.dayOffs ?? []);
        const dataBooks =
          data.books && Array.isArray(data.books)
            ? data.books
                .map((item) => ({
                  ...item,
                  start: item.BookDate,
                  end: moment(item.BookDate)
                    .add(item.RootMinutes ?? 60, "minutes")
                    .toDate(),
                  title: item.RootTitles,
                  className: `fc-event-solid-${getStatusClss(
                    item.Status,
                    item
                  )}`,
                  resourceIds:
                    item.UserServices &&
                    Array.isArray(item.UserServices) &&
                    item.UserServices.length > 0
                      ? item.UserServices.map((item) => item.ID)
                      : [],
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
                  Star: checkStar(item),
                  isBook: true,
                }))
                .filter((item) => item.Status !== "TU_CHOI")
            : [];
        const dataBooksAuto =
          data.osList && Array.isArray(data.osList)
            ? data.osList.map((item) => ({
                ...item,
                AtHome: false,
                Member: item.member,
                MemberCurrent: {
                  FullName: item?.member?.FullName,
                  MobilePhone: item?.member?.MobilePhone,
                },
                start: item.os.BookDate,
                end: moment(item.os.BookDate)
                  .add(item.os.RootMinutes ?? 60, "minutes")
                  .toDate(),
                BookDate: item.os.BookDate,
                title: item.os.Title,
                RootTitles: item.os.ProdService2 || item.os.ProdService,
                className: `fc-event-solid-${getStatusClss(item.os.Status)}`,
                resourceIds:
                  item.staffs && Array.isArray(item.staffs)
                    ? item.staffs.map((staf) => staf.ID)
                    : [],
              }))
            : [];
        setEvents([...dataBooks, ...dataBooksAuto]);
        setLoading(false);
        isFilter && onHideFilter();
        fn && fn();
      })
      .catch((error) => console.log(error));
  };

  const GenerateName = (name) => {
    if (width > 767) {
      return `<span class="text-capitalize">${name}</span>`;
    }
    const newName = name.split(" ");
    const stringName = [];
    for (var key in newName) {
      if (Number(key) !== newName.length - 1) {
        stringName.push(newName[key].charAt(0));
      } else {
        stringName.push(newName[key]);
      }
    }
    return `<div class="text-capitalize">${stringName
      .slice(0, stringName.length - 1)
      .join(".")}</div><div class="text-capitalize">${
      stringName[stringName.length - 1]
    }</div>`;
  };

  const onOpenModalLock = () => {
    setIsModalLock(true);
  };

  const onHideModalLock = () => {
    setIsModalLock(false);
    setBtnLoadingLock(false);
  };

  // const someMethod = () => {
  //   let calendarApi = calendarRef.current.getApi()
  //   console.log(calendarApi)
  //   calendarApi.prev()
  //   calendarApi.changeView("dayGridDay");
  // }
  //console.log(Events)

  return (
    <div
      className={`ezs-calendar ${
        initialView === "resourceTimelineDay" ? "show-calendar-staff" : ""
      }`}
    >
      <div className="container-fluid h-100 px-0">
        <div className="d-flex flex-column flex-xl-row h-100">
          <SidebarCalendar
            filters={filters}
            onOpenModal={onOpenModal}
            onSubmit={getFiltersBooking}
            initialView={initialView}
            loading={loading}
            onOpenFilter={onOpenFilter}
            onHideFilter={onHideFilter}
            isFilter={isFilter}
            headerTitle={headerTitle}
            onOpenModalLock={onOpenModalLock}
          />
          <div
            className={`ezs-calendar__content ${loading &&
              "loading"} position-relative`}
          >
            <FullCalendar
              handleWindowResize={true}
              ref={calendarRef}
              themeSystem="unthemed"
              locale={viLocales}
              initialDate={TODAY}
              initialView={initialView} //timeGridDay
              schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
              aspectRatio="3"
              editable={false}
              navLinks={true}
              allDaySlot={false}
              firstDay={1}
              views={{
                dayGridMonth: {
                  dayMaxEvents: 2,
                  dateClick: ({ date }) => {
                    if (isTelesales) return;
                    setInitialValue({ ...initialValue, BookDate: date });
                    onOpenModal();
                  },
                  slotMinTime: TimeOpen,
                  slotMaxTime: TimeClose,
                },
                timeGridWeek: {
                  eventMaxStack: 2,
                  duration: { days: width > 991 ? 6 : 3 },
                  slotLabelContent: ({ date, text }) => {
                    return (
                      <>
                        <span className="font-size-min gird-time font-number">
                          {text} {moment(date).format("A")}
                        </span>
                        <span className="font-size-min font-number w-55px d-block"></span>
                      </>
                    );
                  },
                  dayHeaderContent: ({ date, isToday, ...arg }) => {
                    return (
                      <div className="font-number">
                        <div className={`date-mm ${isToday && "text-primary"}`}>
                          {moment(date).format("ddd")}
                        </div>
                        <div
                          className={`w-40px h-40px d-flex align-items-center justify-content-center rounded-circle date-dd ${isToday &&
                            "bg-primary text-white"}`}
                        >
                          {moment(date).format("DD")}
                        </div>
                      </div>
                    );
                  },
                  nowIndicator: true,
                  now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                  scrollTime: moment(new Date()).format("HH:mm"),
                  dateClick: ({ date }) => {
                    if (isTelesales) return;
                    setInitialValue({ ...initialValue, BookDate: date });
                    onOpenModal();
                  },
                  slotMinTime: TimeOpen,
                  slotMaxTime: TimeClose,
                },
                timeGridDay: {
                  eventMaxStack: 8,
                  slotLabelContent: ({ date, text }) => {
                    return (
                      <>
                        <span className="font-size-min gird-time font-number">
                          {text} {moment(date).format("A")}
                        </span>
                        <span className="font-size-min font-number w-55px d-block"></span>
                      </>
                    );
                  },
                  dayHeaderContent: ({ date, isToday, ...arg }) => {
                    return (
                      <div className="font-number">
                        <div className={`date-mm text-center`}>
                          {moment(date).format("ddd")}
                        </div>
                        <div
                          className={`w-40px h-40px d-flex align-items-center justify-content-center rounded-circle date-dd`}
                        >
                          {moment(date).format("DD")}
                        </div>
                      </div>
                    );
                  },
                  nowIndicator: true,
                  now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                  scrollTime: moment(new Date()).format("HH:mm"),
                  slotMinWidth: "50",
                  dateClick: ({ date }) => {
                    if (isTelesales) return;
                    setInitialValue({ ...initialValue, BookDate: date });
                    onOpenModal();
                  },
                  slotMinTime: TimeOpen,
                  slotMaxTime: TimeClose,
                },
                resourceTimeGridDay: {
                  type: "resourceTimeline",
                  buttonText: "Nhân viên",
                  resourceAreaHeaderContent: () => "Nhân viên",
                  nowIndicator: true,
                  now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                  scrollTime: moment(new Date()).format("HH:mm"),
                  resourceAreaWidth: "300px",
                  stickyHeaderDates: true,
                  slotMinTime: TimeOpen,
                  slotMaxTime: TimeClose,
                },
                resourceTimelineDay: {
                  type: "resourceTimeline",
                  buttonText: "Nhân viên",
                  resourceAreaHeaderContent: () =>
                    width > 1200 ? "Nhân viên" : "N.Viên",
                  nowIndicator: true,
                  now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                  scrollTime: moment(new Date()).format("HH:mm"),
                  resourceAreaWidth: width > 767 ? "180px" : "70px",
                  slotMinWidth: width > 767 ? "60" : "35",
                  dateClick: ({ date }) => {
                    if (isTelesales) return;
                    setInitialValue({ ...initialValue, BookDate: date });
                    onOpenModal();
                  },
                  resourceLabelDidMount: ({ el, fieldValue, ...arg }) => {
                    el.querySelector(
                      ".fc-datagrid-cell-main"
                    ).innerHTML = `${GenerateName(fieldValue)}`;
                  },
                  slotLabelDidMount: ({ text, date, el, ...arg }) => {
                    el.querySelector(
                      ".fc-timeline-slot-cushion"
                    ).innerHTML = `<span class="gird-time font-number">
                        ${text} ${moment(date).format("A")}
                      </span>`;
                  },
                  slotMinTime: TimeOpen,
                  slotMaxTime: TimeClose,
                },
              }}
              plugins={[
                dayGridPlugin,
                interactionPlugin,
                timeGridPlugin,
                listPlugin,
                resourceTimeGridPlugin,
                resourceTimelinePlugin,
              ]}
              resources={StaffFull}
              events={Events}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right:
                  "dayGridMonth,timeGridWeek,timeGridDay,listWeek,resourceTimelineDay", //resourceTimeGridDay
              }}
              selectable={true}
              selectMirror={true}
              moreLinkContent={({ num, view }) => {
                if (
                  view.type === "timeGridWeek" ||
                  view.type === "timeGridDay"
                ) {
                  return <>+ {num}</>;
                }
                return <>Xem thêm + {num}</>;
              }}
              eventClick={({ event, el }) => {
                if (isTelesales) return;
                const { _def } = event;
                if (_def.extendedProps.os) {
                  window?.top?.BANGLICH_BUOI &&
                    window?.top?.BANGLICH_BUOI(_def.extendedProps, onRefresh);
                  return;
                }
                setInitialValue(_def.extendedProps);
                onOpenModal();
              }}
              eventContent={(arg) => {
                const { event, view } = arg;
                const { extendedProps } = event._def;
                let italicEl = document.createElement("div");
                italicEl.classList.add("fc-content");
                if (
                  typeof extendedProps !== "object" ||
                  Object.keys(extendedProps).length > 0
                ) {
                  if (view.type !== "listWeek") {
                    italicEl.innerHTML = `<div class="fc-title">
                    <div class="d-flex justify-content-between"><div><span class="fullname">${
                      extendedProps.AtHome
                        ? `<i class="fas fa-home text-white font-size-xs"></i>`
                        : ""
                    } ${extendedProps.Star ? `(${extendedProps.Star})` : ""} ${
                      extendedProps.MemberCurrent.FullName
                    }</span><span class="d-none d-md-inline"> - ${
                      extendedProps.MemberCurrent?.MobilePhone
                    }</span></div><span class="${!extendedProps.isBook &&
                      "d-none"}">${extendedProps?.BookCount?.Done ||
                      0}/${extendedProps?.BookCount?.Total || 0}</span></div>
                    <div class="d-flex">
                      <div class="w-35px">${moment(
                        extendedProps.BookDate
                      ).format("HH:mm")} </div>
                      <div class="flex-1 text-truncate pl-5px"> - ${
                        extendedProps.RootTitles
                          ? extendedProps.RootMinutes ??
                            extendedProps?.os?.RootMinutes ??
                            60
                          : 30
                      }p - ${extendedProps.RootTitles || "Không xác định"}</div>
                    </div>
                  </div>`;
                  } else {
                    italicEl.innerHTML = `<div class="fc-title">
                    <div><span class="fullname">${
                      extendedProps.AtHome
                        ? `<i class="fas fa-home font-size-xs"></i>`
                        : ""
                    } ${extendedProps.Star ? `(${extendedProps.Star})` : ""} ${
                      extendedProps.MemberCurrent.FullName
                    }</span><span class="d-none d-md-inline"> - ${
                      extendedProps.MemberCurrent?.MobilePhone
                    }</span><span> - ${
                      extendedProps.RootTitles
                        ? extendedProps.RootMinutes ??
                          extendedProps?.os?.RootMinutes ??
                          60
                        : 30
                    }p - ${extendedProps.RootTitles ||
                      "Không xác định"}</span> <span class="${!extendedProps.isBook &&
                      "d-none"}">- ${extendedProps?.BookCount?.Done ||
                      0}/${extendedProps?.BookCount?.Total || 0}</span></div>
                  </div>`;
                  }
                } else {
                  italicEl.innerHTML = `<div class="fc-title">
                    Không có lịch
                  </div>`;
                }
                let arrayOfDomNodes = [italicEl];
                return {
                  domNodes: arrayOfDomNodes,
                };
              }}
              dayHeaderDidMount={(arg) => {
                const { view, el, isToday, date } = arg;
                if (view.type === "listWeek") {
                  el.querySelector(".fc-list-day-text").innerHTML = `
                    <div class="d-flex align-items-center">
                      <span class="font-number text-date ${isToday &&
                        "bg-primary text-white"}">${moment(date).format(
                    "DD"
                  )}</span>
                      <span class="font-number text-date-full pl-2">THG ${moment(
                        date
                      ).format("MM")}, ${moment(date).format("ddd")}</span>
                    </div>
                  `;
                  el.querySelector(".fc-list-day-side-text").innerHTML = "";
                }
              }}
              dayCellDidMount={({ el, view }) => {}}
              eventDidMount={(arg) => {
                const { view } = arg;
                //Set View Calendar
                setInitialView(view.type);
              }}
              viewWillUnmount={({ view, el }) => {
                // Create Dom
              }}
              datesSet={({ view, start, end, ...arg }) => {
                let calendarElm = document.querySelectorAll(".fc-view-harness");
                const newFilters = {
                  ...filters,
                  StockID: AuthCrStockID,
                };

                if (view.type === "dayGridMonth") {
                  const monthCurrent = moment(end).subtract(1, "month");
                  const startOfMonth = moment(monthCurrent)
                    .startOf("month")
                    .format("YYYY-MM-DD");
                  const endOfMonth = moment(monthCurrent)
                    .endOf("month")
                    .format("YYYY-MM-DD");
                  newFilters.From = startOfMonth;
                  newFilters.To = endOfMonth;
                }
                if (view.type === "timeGridWeek" || view.type === "listWeek") {
                  newFilters.From = moment(start).format("YYYY-MM-DD");
                  newFilters.To = moment(end)
                    .subtract(1, "days")
                    .format("YYYY-MM-DD");
                }
                if (view.type === "timeGridDay") {
                  newFilters.From = moment(start).format("YYYY-MM-DD");
                  newFilters.To = moment(start).format("YYYY-MM-DD");
                }
                if (view.type === "resourceTimelineDay") {
                  newFilters.From = moment(start).format("YYYY-MM-DD");
                  newFilters.To = moment(start).format("YYYY-MM-DD");
                }
                if (view.type === "resourceTimelineDay") {
                  setElmHeight(calendarElm[0].offsetHeight);
                  calendarElm[0].style.display = "none";
                } else {
                  calendarElm[0].style.display = "block";
                }
                setInitialView(view.type);
                setFilters(newFilters);
              }}
            />
            {initialView === "resourceTimelineDay" && (
              <CalendarStaff
                filters={filters}
                StaffOffline={StaffOffline}
                loading={loading}
                height={elmHeight}
                resources={StaffFull}
                events={Events}
                dateClick={({ BookDate, UserServiceIDs }) => {
                  if (isTelesales) return;
                  setInitialValue({
                    ...initialValue,
                    BookDate,
                    UserServiceIDs,
                  });
                  onOpenModal();
                }}
                eventClick={(service) => {
                  if (service.os) {
                    window?.top?.BANGLICH_BUOI &&
                      window?.top?.BANGLICH_BUOI(service, onRefresh);
                    return;
                  }
                  setInitialValue(service);
                  onOpenModal();
                }}
              />
            )}
          </div>
        </div>
      </div>
      <ModalCalendar
        show={isModal}
        onHide={onHideModal}
        onSubmit={onSubmitBooking}
        onFinish={onFinish}
        onDelete={onDeleteBooking}
        btnLoading={btnLoading}
        initialValue={initialValue}
      />
      <ModalCalendarLock
        show={isModalLock}
        onHide={onHideModalLock}
        ListLock={ListLock}
        onSubmit={onSubmitLock}
        btnLoadingLock={btnLoadingLock}
        AuthCrStockID={AuthCrStockID}
      />
    </div>
  );
}

export default CalendarPage;