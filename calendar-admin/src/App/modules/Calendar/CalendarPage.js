import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import listPlugin from "@fullcalendar/list";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ModalCalendar from "../../../components/ModalCalendar/ModalCalendar";
import SidebarCalendar from "../../../components/SidebarCalendar/SidebarCalendar";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

import "../../../_assets/sass/pages/_calendar.scss";
import CalendarCrud from "./_redux/CalendarCrud";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { AppContext } from "../../App";
import ModalCalendarLock from "../../../components/ModalCalendarLock/ModalCalendarLock";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import { useQuery } from "react-query";
import Swal from "sweetalert2";
import Select from "react-select";

import moment from "moment";
import "moment/locale/vi";
import ModalRoom from "../../../components/ModalRoom/ModalRoom";
import clsx from "clsx";
import DateTimePicker from "../../../shared/DateTimePicker/DateTimePicker";
import { Dropdown } from "react-bootstrap";
import PickerSettingCalendar from "../../../components/PickerSettingCalendar/PickerSettingCalendar";

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
    return "info";
  }
  if (Status === "doing") {
    return "success";
  }
  if (Status === "done") {
    return "secondary";
  }
};

function CalendarPage(props) {
  const {
    AuthCrStockID,
    TimeOpen,
    TimeClose,
    StocksList,
    isRooms,
  } = useSelector(({ Auth, JsonConfig }) => ({
    AuthCrStockID: Auth.CrStockID,
    StocksList: Auth?.Stocks.filter((x) => x.ParentID !== 0),
    TimeOpen: JsonConfig?.APP?.Working?.TimeOpen || "00:00:00",
    TimeClose: JsonConfig?.APP?.Working?.TimeClose || "23:59:00",
    isRooms: JsonConfig?.Admin?.isRooms,
    StockRights: Auth?.StockRights || [],
  }));

  const [isModal, setIsModal] = useState(false);
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
      ...(!window?.top?.GlobalConfig?.Admin?.isAdminBooks
        ? ["DANG_THUC_HIEN"]
        : []),
      // "THUC_HIEN_XONG",
    ],
    StockID: AuthCrStockID,
    Tags: "",
  });
  const [topCalendar, setTopCalendar] = useState({
    type: {
      value: "resourceTimeGridDay",
      label: "Nhân viên",
    },
    day: moment().toDate(),
  });

  const [initialValue, setInitialValue] = useState({});
  const [StaffFull, setStaffFull] = useState([]);
  // const [initialView, setInitialView] = useState(
  //   window.innerWidth > 767 ? "resourceTimeGridDay" : "timeGridDay"
  // );
  const [headerTitle, setHeaderTitle] = useState("");
  const [isModalLock, setIsModalLock] = useState(false);
  const [isModalRoom, setIsModalRoom] = useState(false);
  const { width } = useWindowSize();

  const [ListLock, setListLock] = useState({
    ListLocks: [],
  });
  const [btnLoadingLock, setBtnLoadingLock] = useState(false);
  const calendarRef = useRef("");
  const { isTelesales } = useContext(AppContext);

  useEffect(() => {
    if (topCalendar?.type?.value === "resourceTimeGridDay") {
      setFilters((prevState) => ({
        ...prevState,
        Status: prevState.Status
          ? [
              ...new Set([
                ...prevState.Status,
                ...(!window?.top?.GlobalConfig?.Admin?.isAdminBooks
                  ? ["THUC_HIEN_XONG"]
                  : []),
              ]),
            ]
          : prevState.Status,
      }));
    } else {
      setFilters((prevState) => ({
        ...prevState,
        Status: prevState.Status
          ? prevState.Status.filter((x) => x !== "THUC_HIEN_XONG")
          : prevState.Status,
      }));
    }
  }, [topCalendar?.type]);

  useEffect(() => {
    if (calendarRef?.current?.getApi()) {
      let calendarApi = calendarRef.current.getApi();
      calendarApi.changeView(topCalendar?.type?.value);
    }
  }, [topCalendar?.type, calendarRef]);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(topCalendar?.day);
    }
  }, [topCalendar?.day, calendarRef]);

  useEffect(() => {
    let params = {
      From: moment(moment(topCalendar?.day, "YYYY-MM-DD")),
      To: moment(moment(topCalendar?.day, "YYYY-MM-DD")),
    };
    switch (topCalendar?.type?.value) {
      case "dayGridMonth":
        params.From = params.From.startOf("month").format("YYYY-MM-DD");
        params.To = params.To.endOf("month").format("YYYY-MM-DD");
        break;
      case "timeGridWeek":
        params.From = params.From.clone()
          .weekday(0)
          .format("YYYY-MM-DD");
        params.To = params.To.clone()
          .weekday(6)
          .format("YYYY-MM-DD");
        break;
      default:
        params.From = params.From.format("YYYY-MM-DD");
        params.To = params.To.format("YYYY-MM-DD");
    }
    setFilters((prevState) => ({ ...prevState, ...params }));
  }, [topCalendar]);

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
      setStaffFull([{ id: 0, title: "Chưa chọn nhân viên" }, ...newData]);
    }

    getStaffFull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topCalendar?.type]);

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

  const ListRooms = useQuery({
    queryKey: ["ListRooms", AuthCrStockID],
    queryFn: async () => {
      let { data } = await CalendarCrud.getConfigName(`room`);
      let rs = [
        {
          RoomTitle: "Room Trống",
          id: 0,
          title: "Chưa chọn Room",
        },
      ];
      if (data && data.length > 0) {
        const result = JSON.parse(data[0].Value);
        let indexStock = result.findIndex((x) => x.StockID === AuthCrStockID);
        if (indexStock > -1 && result[indexStock]) {
          if (
            result[indexStock].ListRooms &&
            result[indexStock].ListRooms.length > 0
          ) {
            for (let Room of result[indexStock].ListRooms) {
              if (Room.Children && Room.Children.length > 0) {
                for (let cls of Room.Children) {
                  rs.push({
                    ...cls,
                    RoomTitle: Room.label,
                    title: cls.label,
                    id: cls.ID,
                  });
                }
              }
            }
          }
        }
      }
      return rs || [];
    },
  });

  const SettingCalendar = useQuery({
    queryKey: ["SettingCalendar", AuthCrStockID],
    queryFn: async () => {
      let { data } = await CalendarCrud.getConfigName(`ArticleRel`);
      let rs = {
        Tags: "",
        OriginalServices: [],
      };
      if (data && data.length > 0) {
        const result = JSON.parse(data[0].Value);
        if (result) {
          rs = result;
        }
      }
      return rs;
    },
    initialData: {
      Tags: "",
      OriginalServices: [],
    },
  });

  const getListLock = (callback) => {
    CalendarCrud.getConfigName(`giocam`)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const result = data[0].Value ? JSON.parse(data[0].Value) : "";
          let newValues = [];
          if (result && result.length > 0) {
            let StocksNews = StocksList;

            for (let stock of StocksNews) {
              let index = result.findIndex((x) => stock.ID === x.StockID);
              if (index > -1) {
                newValues.push(result[index]);
              } else {
                newValues.push({
                  StockID: stock.ID,
                  ListDisable: [],
                });
              }
            }
          } else {
            newValues = StocksList.map((o) => ({
              StockID: o.ID,
              ListDisable: [],
            }));
          }
          newValues = newValues.map((lock) => ({
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
                        moment(a.Date).valueOf() - moment(b.Date).valueOf()
                    )
                : [],
          }));

          setListLock({
            ListLocks: newValues,
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

    let Desc = "";
    if (window?.top?.GlobalConfig?.APP?.SL_khach && values.AmountPeople) {
      Desc =
        (Desc ? Desc + "\n" : "") +
        `Số lượng khách: ${values.AmountPeople.value}`;
    }
    if (values.TagSetting && values.TagSetting.length > 0) {
      Desc =
        (Desc ? Desc + "\n" : "") +
        `Tags: ${values.TagSetting.map((x) => x.value).toString()}`;
    }
    Desc = (Desc ? Desc + "\n" : "") + `Ghi chú: ${values.Desc}`;

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
      Desc,
      // Desc:
      //   window?.top?.GlobalConfig?.APP?.SL_khach && values.AmountPeople
      //     ? `Số lượng khách: ${values.AmountPeople.value}. \nGhi chú: ${values.Desc}`
      //     : values.Desc,
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
            EmptyPhone: true,
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
        if (
          window?.top?.GlobalConfig?.Admin?.kpiCancelFinish &&
          values?.CreateBy
        ) {
          let newData = {
            update: [
              {
                BookId: values?.ID,
                Status: window?.top?.GlobalConfig?.Admin?.kpiCancelFinish,
              },
            ],
          };
          await CalendarCrud.editTagsMember(newData);
        }
      }

      window.top.bodyEvent &&
        window.top.bodyEvent("ui_changed", {
          name: "cld_dat_lich_moi",
          mid: objBooking.MemberID || 0,
        });
      ListCalendars.refetch().then(() => {
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
    let Desc = "";
    if (window?.top?.GlobalConfig?.APP?.SL_khach && values.AmountPeople) {
      Desc =
        (Desc ? Desc + "\n" : "") +
        `Số lượng khách: ${values.AmountPeople.value}`;
    }
    if (values.TagSetting && values.TagSetting.length > 0) {
      Desc =
        (Desc ? Desc + "\n" : "") +
        `Tags: ${values.TagSetting.map((x) => x.value).toString()}`;
    }
    Desc = (Desc ? Desc + "\n" : "") + `Ghi chú: ${values.Desc}`;

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
      Desc,
      // Desc:
      //   window?.top?.GlobalConfig?.APP?.SL_khach && values.AmountPeople
      //     ? `Số lượng khách: ${values.AmountPeople.value}. \nGhi chú: ${values.Desc}`
      //     : values.Desc,
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
              EmptyPhone: true,
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

      if (window?.top?.GlobalConfig?.Admin?.kpiFinish && values?.CreateBy) {
        let newData = {
          update: [
            {
              BookId: values?.ID,
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
      ListCalendars.refetch().then(() => {
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
      if (window?.top?.GlobalConfig?.Admin?.kpiCancel && values?.CreateBy) {
        let newData = {
          update: [
            {
              BookId: values?.ID,
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
      ListCalendars.refetch().then(() => {
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
      console.log(error);
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnDelete: false,
      }));
    }
  };

  const getFiltersBooking = (values) => {
    setFilters(values);
  };

  const checkStar = (item) => {
    if (item?.Member?.MobilePhone !== "0000000000") return "";
    if (item?.Member?.MobilePhone === "0000000000" && item?.IsNew) return "**";
    else {
      return "*";
    }
  };

  const ListCalendars = useQuery({
    queryKey: ["ListCalendars", filters],
    queryFn: async () => {
      const newFilters = {
        ...filters,
        MemberID:
          filters.MemberID && Array.isArray(filters.MemberID)
            ? filters.MemberID.map((item) => item.value).toString()
            : "",
        From: filters.From,
        To: filters.To,
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
        Tags: filters?.Tags ? filters?.Tags.map((x) => x.value).toString() : "",
      };
      let data = await CalendarCrud.getBooking(newFilters);
      let dataOffline = [];
      if (topCalendar?.type?.value === "resourceTimeGridDay") {
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
      }

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
                className: `fc-event-solid-${getStatusClss(item.Status, item)}`,
                resourceIds:
                  topCalendar?.type?.value === "resourceTimelineDay"
                    ? [-10]
                    : item.UserServices &&
                      Array.isArray(item.UserServices) &&
                      item.UserServices.length > 0
                    ? item.UserServices.map((item) => item.ID)
                    : [0],
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
      let dataBooksAuto =
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
              className: `fc-event-solid-${getStatusClss(item.os.Status)} ${
                item?.os?.RoomStatus === "done" ? "bg-stripes" : ""
              }`,
              resourceIds:
                topCalendar?.type?.value === "resourceTimelineDay"
                  ? [item?.os?.RoomID || 0]
                  : item.staffs && Array.isArray(item.staffs)
                  ? item.staffs.map((staf) => staf.ID)
                  : [0],
            }))
          : [];
      return [...dataBooks, ...dataBooksAuto, ...dataOffline];
    },
    enabled: Boolean(filters && filters.From),
  });

  const onRefresh = (callback) =>
    ListCalendars.refetch().then(() => callback && callback());

  const onOpenModalLock = () => {
    setIsModalLock(true);
  };

  const onHideModalLock = () => {
    setIsModalLock(false);
    setBtnLoadingLock(false);
  };

  const onOpenModalRoom = () => {
    setIsModalRoom(true);
  };

  const onHideModalRoom = () => {
    setIsModalRoom(false);
  };

  const renderColor = (book) => {
    let rs = [];
    if (book.Roots && book.Roots.length > 0) {
      let { OriginalServices } = SettingCalendar.data;
      for (let i of OriginalServices) {
        if (book.Roots.findIndex((x) => x.ID === i.value) > -1) {
          rs.push(i);
        }
      }
    }
    if (book?.os) {
      let { OriginalServices } = SettingCalendar.data;
      for (let i of OriginalServices) {
        if (
          i.value === book?.os?.ProdServiceID ||
          i.value === book?.os?.ProdServiceID2
        ) {
          rs.push(i);
        }
      }
    }
    return rs
      .map(
        (x) =>
          `<div class="w-5px" style="background: ${x.color}; flex-grow: 1;"></div>`
      )
      .join("");
  };

  // const someMethod = () => {
  //   let calendarApi = calendarRef.current.getApi()
  //   console.log(calendarApi)
  //   calendarApi.prev()
  //   calendarApi.changeView("dayGridDay");
  // }

  return (
    <div className={`ezs-calendar`}>
      <div className="px-0 container-fluid h-100">
        <div className="d-flex flex-column flex-xl-row h-100">
          <SidebarCalendar
            filters={filters}
            onOpenModal={onOpenModal}
            onSubmit={getFiltersBooking}
            //initialView={initialView}
            initialView={topCalendar.view}
            loading={ListCalendars.isLoading}
            onOpenFilter={onOpenFilter}
            onHideFilter={onHideFilter}
            isFilter={isFilter}
            headerTitle={headerTitle}
            onOpenModalLock={onOpenModalLock}
            onOpenModalRoom={onOpenModalRoom}
            isRooms={isRooms}
            TagsList={
              SettingCalendar?.data?.Tags
                ? SettingCalendar?.data?.Tags.split(",").map((x) => ({
                    label: x,
                    value: x,
                  }))
                : []
            }
          />
          <div className="flex flex-col ezs-calendar__content">
            <div className="flex justify-between mb-4">
              <div className="flex flex-1 mr-2 md:mr-0">
                <button
                  type="button"
                  className={clsx(
                    "transition h-[40px] px-3 mr-[8px] hidden md:flex items-center rounded-sm font-medium bg-[#ede7fe] text-[#8561f9] hover:text-white hover:bg-[#8561f9]",
                    moment(topCalendar.day).format("DD-MM-YYYY") ===
                      moment().format("DD-MM-YYYY") && "opacity-60"
                  )}
                  onClick={() => {
                    setTopCalendar((prevState) => ({
                      ...prevState,
                      day: moment().toDate(),
                    }));
                  }}
                  disabled={
                    moment(topCalendar.day).format("DD-MM-YYYY") ===
                    moment().format("DD-MM-YYYY")
                  }
                >
                  Hôm nay
                </button>
                <div className="md:w-[250px] relative">
                  <DateTimePicker
                    selected={topCalendar.day}
                    dateFormat="EEE ,dd/MM/yyyy"
                    onChange={(val) => {
                      setTopCalendar((prevState) => ({
                        ...prevState,
                        day: val,
                      }));
                    }}
                    showMonthYearPicker={
                      topCalendar?.type?.value === "dayGridMonth"
                    }
                  />
                  <div className="absolute top-0 right-0 hidden h-full md:block">
                    <button
                      type="button"
                      className="bg-transparent w-[25px] h-full group"
                      onClick={() => {
                        if (topCalendar?.type?.value === "dayGridMonth") {
                          setTopCalendar((prevState) => ({
                            ...prevState,
                            day: moment(prevState.day)
                              .subtract(1, "months")
                              .toDate(),
                          }));
                        } else if (
                          topCalendar?.type?.value === "timeGridWeek"
                        ) {
                          setTopCalendar((prevState) => ({
                            ...prevState,
                            day: moment(prevState.day)
                              .subtract(1, "weeks")
                              .toDate(),
                          }));
                        } else {
                          setTopCalendar((prevState) => ({
                            ...prevState,
                            day: moment(prevState.day)
                              .subtract(1, "days")
                              .toDate(),
                          }));
                        }
                      }}
                    >
                      <i className="fa-regular fa-chevron-left text-[15px] group-hover:!text-primary"></i>
                    </button>
                    <button
                      type="button"
                      className="bg-transparent w-[25px] h-full group"
                      onClick={() => {
                        if (topCalendar?.type?.value === "dayGridMonth") {
                          setTopCalendar((prevState) => ({
                            ...prevState,
                            day: moment(prevState.day)
                              .add(1, "months")
                              .toDate(),
                          }));
                        } else if (
                          topCalendar?.type?.value === "timeGridWeek"
                        ) {
                          setTopCalendar((prevState) => ({
                            ...prevState,
                            day: moment(prevState.day)
                              .add(1, "weeks")
                              .toDate(),
                          }));
                        } else {
                          setTopCalendar((prevState) => ({
                            ...prevState,
                            day: moment(prevState.day)
                              .add(1, "days")
                              .toDate(),
                          }));
                        }
                      }}
                    >
                      <i className="fa-regular fa-chevron-right text-[15px] group-hover:!text-primary"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex">
                <Select
                  options={[
                    {
                      value: "dayGridMonth",
                      label: "Theo Tháng",
                      hidden: false,
                    },
                    {
                      value: "timeGridWeek",
                      label: "Theo Tuần",
                      hidden: false,
                    },
                    {
                      value: "timeGridDay",
                      label: "Theo Ngày",
                      hidden: false,
                    },
                    {
                      value: "listWeek",
                      label: "Danh sách",
                      hidden: false,
                    },
                    {
                      value: "resourceTimeGridDay",
                      label: "Nhân viên",
                      hidden: false,
                    },
                    {
                      value: "resourceTimelineDay",
                      label: "Buồng / Phòng",
                      hidden: !isRooms,
                    },
                  ].filter((x) => !x.hidden)}
                  value={topCalendar.type}
                  onChange={(val) => {
                    setTopCalendar((prevState) => ({
                      ...prevState,
                      type: val,
                    }));
                    // if (calendarRef?.current?.getApi()) {
                    //   let calendarApi = calendarRef.current.getApi();
                    //   calendarApi.changeView(val.value);
                    // }
                  }}
                  menuPosition="fixed"
                  styles={{
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                  menuPortalTarget={document.body}
                  isClearable={false}
                  className="select-control w-[165px] md:w-[200px] select-control-solid font-medium"
                  classNamePrefix="select"
                />
                <Dropdown className="w-auto ml-[8px]">
                  <Dropdown.Toggle className="!bg-[#ede7fe] hover:!bg-[#8561f9] !border-0 h-[40px] px-10px w-100 hide-icon-after no-after group">
                    <i className="fa-light fa-gear pr-0 text-[15px] !text-[#8561f9] group-hover:!text-white"></i>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-100" variant="dark">
                    {
                      <PickerSettingCalendar SettingCalendar={SettingCalendar}>
                        {({ open }) => (
                          <Dropdown.Item href="#" onClick={open}>
                            Cài đặt bảng lịch
                          </Dropdown.Item>
                        )}
                      </PickerSettingCalendar>
                    }

                    {!isTelesales && (
                      <Dropdown.Item href="#" onClick={onOpenModalLock}>
                        Cài đặt khóa lịch
                      </Dropdown.Item>
                    )}
                    {!isTelesales && isRooms && (
                      <Dropdown.Item href="#" onClick={onOpenModalRoom}>
                        Cài đặt phòng
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
            <div className={clsx("grow position-relative")}>
              {ListCalendars.isLoading && (
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

              <FullCalendar
                firstDay={1}
                handleWindowResize={true}
                ref={calendarRef}
                themeSystem="unthemed"
                locale={viLocales}
                initialDate={topCalendar.day}
                initialView={topCalendar?.type?.value} //timeGridDay
                schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                aspectRatio="3"
                editable={false}
                navLinks={true}
                allDaySlot={false}
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
                          <div
                            className={`date-mm ${isToday && "text-primary"}`}
                          >
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
                    dayMinWidth: width > 768 ? 300 : 200,
                    allDaySlot: false,
                    type: "resourceTimeline",
                    nowIndicator: true,
                    now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                    scrollTime: moment(new Date()).format("HH:mm"),
                    resourceAreaWidth: width > 768 ? "300px" : "200px",
                    stickyHeaderDates: true,
                    slotMinTime: TimeOpen,
                    slotMaxTime: TimeClose,
                    buttonText: "Nhân viên",
                    resourceAreaHeaderContent: () => "Nhân viên",
                    resourceLabelContent: ({ resource }) => {
                      return (
                        <div className="d-flex align-items-center flex-column">
                          {/* <div
                            className="p-1 border border-primary"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "100%",
                            }}
                          >
                            <div
                              className="w-100 h-100 d-flex align-items-center justify-content-center text-uppercase text-primary"
                              style={{
                                borderRadius: "100%",
                                background: "#e1f0ff",
                                fontSize: "13px",
                                fontWeight: "bold",
                              }}
                            >
                              {getLastFirst(resource._resource.title)}
                            </div>
                          </div> */}
                          <div className="capitalize title-staff">
                            {resource._resource.title}
                          </div>
                        </div>
                      );
                    },
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
                    dateClick: ({ resource, jsEvent, date }) => {
                      if (
                        isTelesales ||
                        jsEvent.target.classList.contains("fc-no-event")
                      )
                        return;
                      setInitialValue({
                        ...initialValue,
                        BookDate: date,
                        UserServiceIDs:
                          Number(resource._resource?.id) > 0
                            ? [
                                {
                                  value: resource._resource.id,
                                  label: resource._resource.title,
                                },
                              ]
                            : [],
                      });
                      onOpenModal();
                    },
                  },
                  resourceTimelineDay: {
                    type: "resourceTimelineDay",
                    nowIndicator: true,
                    now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                    scrollTime: moment(new Date()).format("HH:mm"),
                    resourceAreaWidth: width > 768 ? "220px" : "150px",
                    slotMinWidth: 50,
                    stickyHeaderDates: true,
                    slotMinTime: TimeOpen,
                    slotMaxTime: TimeClose,
                    buttonText: "Phòng",
                    resourceAreaHeaderContent: () => "Phòng",
                    slotLabelContent: ({ date, text }) => {
                      return (
                        <>
                          <span className="gird-time font-number text-primary">
                            {moment(date).format("HH:mm")}
                          </span>
                          <span className="font-size-min font-number w-55px d-block"></span>
                        </>
                      );
                    },
                  },
                  listWeek: {
                    type: "listWeek",
                    scrollTime: moment(new Date()).format("HH:mm"),
                    now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                  },
                }}
                plugins={[
                  dayGridPlugin,
                  interactionPlugin,
                  timeGridPlugin,
                  listPlugin,
                  resourceTimeGridPlugin,
                  resourceTimelinePlugin,
                  scrollGridPlugin,
                ]}
                resourceGroupField="RoomTitle"
                resources={
                  topCalendar?.type?.value === "resourceTimelineDay"
                    ? ListRooms.data
                    : StaffFull
                }
                resourceOrder={
                  topCalendar?.type?.value === "resourceTimelineDay"
                    ? "title"
                    : ""
                }
                events={ListCalendars?.data || []}
                // headerToolbar={{
                //   left: "prev,next today",
                //   center: "title",
                //   right: isRooms
                //     ? "dayGridMonth,timeGridWeek,timeGridDay,listWeek,resourceTimeGridDay,resourceTimelineDay"
                //     : "dayGridMonth,timeGridWeek,timeGridDay,listWeek,resourceTimeGridDay", //resourceTimeGridDay
                // }}
                headerToolbar={false}
                //selectable={true}
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
                  const { _def, extendedProps } = event;
                  if (extendedProps?.noEvent) return;

                  if (_def.extendedProps.os) {
                    if (
                      topCalendar?.type?.value === "resourceTimelineDay" &&
                      _def.extendedProps.os?.Status === "done" &&
                      _def.extendedProps.os?.RoomStatus !== "done"
                    ) {
                      let { ID, RoomID } = _def.extendedProps.os;
                      Swal.fire({
                        title: "Bàn đã dọn dẹp xong ?",
                        text:
                          "Xác nhận bàn đã dọn dẹp. Có thể tiếp nhận khách hàng !",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#3085d6",
                        cancelButtonColor: "#d33",
                        confirmButtonText: "Xác nhận",
                        cancelButtonText: "Huỷ",
                        showLoaderOnConfirm: true,
                        preConfirm: () =>
                          new Promise((resolve, reject) => {
                            CalendarCrud.updateRoom({
                              rooms: [
                                {
                                  ID: ID,
                                  RoomID: RoomID,
                                  RoomStatus: "done",
                                },
                              ],
                            }).then(() => onRefresh(() => resolve()));
                          }),
                        allowOutsideClick: () => !Swal.isLoading(),
                      }).then((result) => {
                        if (result.isConfirmed)
                          toast.success("Xác nhận thành công.");
                      });
                    } else {
                      window?.top?.BANGLICH_BUOI &&
                        window?.top?.BANGLICH_BUOI(
                          _def.extendedProps,
                          onRefresh
                        );
                    }
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
                      <div class="position-absolute h-100 top-0 left-0 d-flex flex-column">
                        ${renderColor(extendedProps)}
                      </div>
                    <div class="d-flex justify-content-between"><div><span class="fullname">${
                      extendedProps?.AtHome
                        ? `<i class="fas fa-home text-white font-size-xs"></i>`
                        : ""
                    } ${
                        extendedProps?.Star ? `(${extendedProps.Star})` : ""
                      } ${extendedProps?.MemberCurrent?.FullName ||
                        "Chưa xác định"}</span><span class="d-none d-md-inline"> - ${extendedProps
                        ?.MemberCurrent?.MobilePhone ||
                        "Chưa xác định"}</span></div><span class="${!extendedProps?.isBook &&
                        "d-none"}">${extendedProps?.BookCount?.Done ||
                        0}/${extendedProps?.BookCount?.Total || 0}</span></div>
                    <div class="d-flex">
                      <div class="w-35px">${moment(
                        extendedProps?.BookDate
                      ).format("HH:mm")} </div>
                      <div class="flex-1 text-truncate pl-5px"> - ${
                        extendedProps?.RootTitles
                          ? extendedProps?.RootMinutes ??
                            extendedProps?.os?.RootMinutes ??
                            60
                          : 30
                      }p - ${extendedProps?.RootTitles ||
                        "Không xác định"}</div>
                    </div>
                  </div>`;
                    } else {
                      italicEl.innerHTML = `<div class="fc-title">
                    <div><span class="fullname">${
                      extendedProps?.AtHome
                        ? `<i class="fas fa-home font-size-xs"></i>`
                        : ""
                    } ${
                        extendedProps?.Star ? `(${extendedProps.Star})` : ""
                      } ${extendedProps?.MemberCurrent.FullName ||
                        "Chưa xác định"}</span><span class="d-none d-md-inline"> - ${extendedProps
                        ?.MemberCurrent?.MobilePhone ||
                        "Chưa xác định"}</span><span> - ${
                        extendedProps?.RootTitles
                          ? extendedProps?.RootMinutes ??
                            extendedProps?.os?.RootMinutes ??
                            60
                          : 30
                      }p - ${extendedProps?.RootTitles ||
                        "Không xác định"}</span> <span class="${!extendedProps?.isBook &&
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
                eventDidMount={(arg) => {
                  const { view } = arg;

                  if (view.type === "listWeek") {
                    let today = document.querySelector(".fc-day-today");
                    let elScroll =
                      today?.parentElement?.parentElement?.parentElement;
                    if (elScroll) elScroll.scroll(0, today.offsetTop);
                  }
                }}
                datesSet={({ view, start, end, ...arg }) => {
                  //let calendarElm = document.querySelectorAll(".fc-view-harness");
                  // const newFilters = {
                  //   ...filters,
                  //   StockID: AuthCrStockID,
                  // };

                  // if (view.type === "dayGridMonth") {
                  //   const monthCurrent = moment(end).subtract(1, "month");
                  //   const startOfMonth = moment(monthCurrent)
                  //     .startOf("month")
                  //     .format("YYYY-MM-DD");
                  //   const endOfMonth = moment(monthCurrent)
                  //     .endOf("month")
                  //     .format("YYYY-MM-DD");
                  //   newFilters.From = startOfMonth;
                  //   newFilters.To = endOfMonth;
                  // }
                  // if (
                  //   view.type === "timeGridWeek" ||
                  //   view.type === "listWeek"
                  // ) {
                  //   newFilters.From = moment(start).format("YYYY-MM-DD");
                  //   newFilters.To = moment(end)
                  //     .subtract(1, "days")
                  //     .format("YYYY-MM-DD");
                  // }
                  // if (view.type === "timeGridDay") {
                  //   newFilters.From = moment(start).format("YYYY-MM-DD");
                  //   newFilters.To = moment(start).format("YYYY-MM-DD");
                  // }
                  // if (view.type === "resourceTimeGridDay") {
                  //   newFilters.From = moment(start).format("YYYY-MM-DD");
                  //   newFilters.To = moment(start).format("YYYY-MM-DD");
                  // }
                  // setFilters(newFilters);
                  if (calendarRef?.current) {
                    let calendarApi = calendarRef.current.getApi();
                    setHeaderTitle(
                      calendarApi.currentDataManager.data?.viewTitle
                    );
                  }
                }}
                noEventsContent={() =>
                  ListCalendars.isLoading ? <></> : "Không có dữ liệu"
                }
              />
            </div>
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
        TagsList={
          SettingCalendar?.data?.Tags
            ? SettingCalendar?.data?.Tags.split(",").map((x) => ({
                label: x,
                value: x,
              }))
            : []
        }
      />
      <ModalCalendarLock
        show={isModalLock}
        onHide={onHideModalLock}
        ListLock={ListLock}
        onSubmit={onSubmitLock}
        btnLoadingLock={btnLoadingLock}
        AuthCrStockID={AuthCrStockID}
      />
      <ModalRoom
        show={isModalRoom}
        onHide={onHideModalRoom}
        AuthCrStockID={AuthCrStockID}
        StocksList={StocksList}
      />
    </div>
  );
}

export default CalendarPage;
