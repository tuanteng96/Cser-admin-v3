import React, { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import listPlugin from "@fullcalendar/list";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import SidebarMassageCalendar from "../../../components/SidebarCalendar/SidebarMassageCalendar";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

import "../../../_assets/sass/pages/_calendar.scss";
import CalendarCrud from "./_redux/CalendarCrud";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { AppContext } from "../../App";
import ModalCalendarLock from "../../../components/ModalCalendarLock/ModalCalendarLock";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import { useQuery, useQueryClient } from "react-query";
import Swal from "sweetalert2";
import Select from "react-select";

import moment from "moment";
import "moment/locale/vi";
import ModalRoom from "../../../components/ModalRoom/ModalRoom";
import clsx from "clsx";
import DateTimePicker from "../../../shared/DateTimePicker/DateTimePicker";
import { Dropdown } from "react-bootstrap";
import PickerSettingCalendar from "../../../components/PickerSettingCalendar/PickerSettingCalendar";
import {
  PickerOfflineSchedule,
  PickerReportMassageV2,
  PickerReportStaffService,
} from "./components";
import { toAbsoluteUrl, toAbsoluteUser } from "../../../helpers/AssetsHelpers";
import ModalMassageCalendar from "../../../components/ModalCalendar/ModalMassageCalendar";
import MassageResourceCurrentDay from "./components/MassageResourceCurrentDay";

moment.locale("vi");

//var todayDate = moment().startOf("day");
// var YM = todayDate.format("YYYY-MM");
// var YESTERDAY = todayDate
//   .clone()
//   .subtract(1, "day")
//   .format("YYYY-MM-DD");
//var TODAY = todayDate.format("YYYY-MM-DD");
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

const formatTimeOpenClose = ({ Text, InitialTime, Date }) => {
  let Times = {
    ...InitialTime,
    TimeAdd: 0,
  };

  let CommonTime = Array.from(Text.matchAll(/\[([^\][]*)]/g), (x) => x[1]);

  if (CommonTime && CommonTime.length > 0) {
    let CommonTimeJs = CommonTime[0].split(";");
    Times.TimeOpen = CommonTimeJs[0];
    Times.TimeClose = CommonTimeJs[1];
    if (CommonTimeJs.length > 1) {
      Times.TimeAdd = Number(CommonTimeJs[2]);
    }
  }

  let PrivateTime = Array.from(Text.matchAll(/{+([^}]+)}+/g), (x) => x[1]);
  PrivateTime = PrivateTime.filter((x) => x.split(";").length > 2).map((x) => ({
    DayName: x.split(";")[0],
    TimeOpen: x.split(";")[1],
    TimeClose: x.split(";")[2],
    TimeAdd: x.split(";").length > 2 ? Number(x.split(";")[3]) : 0,
  }));
  if (Date) {
    let index = PrivateTime.findIndex(
      (x) => x.DayName === moment(Date, "DD/MM/YYYY").format("ddd")
    );

    if (index > -1) {
      Times.TimeOpen = PrivateTime[index].TimeOpen;
      Times.TimeClose = PrivateTime[index].TimeClose;
      Times.TimeAdd = PrivateTime[index].TimeAdd;
    }
  }

  return Times;
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

function CalendarMassagePage(props) {
  const queryClient = useQueryClient();
  const {
    AuthCrStockID,
    GTimeOpen,
    GTimeClose,
    StocksList,
    isRooms,
    Stocks,
    GlobalConfig,
    checkout_time,
  } = useSelector(({ Auth, JsonConfig }) => ({
    AuthCrStockID: Auth.CrStockID,
    StocksList: Auth?.Stocks.filter((x) => x.ParentID !== 0),
    GTimeOpen: JsonConfig?.APP?.Working?.TimeOpen || "00:00:00",
    GTimeClose: JsonConfig?.APP?.Working?.TimeClose || "23:59:59",
    isRooms: JsonConfig?.Admin?.isRooms,
    SettingBookOnline: JsonConfig?.Admin?.SettingBookOnline,
    lop_hoc_pt: JsonConfig?.Admin?.lop_hoc_pt,
    GlobalConfig: JsonConfig,
    StockRights: Auth?.StockRights || [],
    Stocks: Auth?.Stocks
      ? Auth?.Stocks.filter((x) => x.ParentID !== 0).map((o) => ({
          ...o,
          value: o.ID,
          label: o.Title,
        }))
      : [],
    checkout_time: Boolean(JsonConfig?.Admin?.checkout_time),
  }));

  let optionsCalendar = [
    {
      value: "dayGridMonth",
      label: "Theo Tháng",
      hidden: true,
    },
    {
      value: "timeGridWeek",
      label: "Theo Tuần",
      hidden: true,
    },
    {
      value: "timeGridDay",
      label: "Theo Ngày",
      hidden: true,
    },
    {
      value: "listWeek",
      label: "Danh sách",
      hidden: true,
    },
    {
      value: "resourceTimeGridDay",
      label: "Xem theo nhân viên",
      hidden: false,
    },
    {
      value: "resourceTimelineDay",
      label: "Xem theo phòng",
      hidden: !isRooms,
    },
    {
      value: "resourceCurrentDay",
      label: "Xem lịch hiện tại",
      hidden: false,
    },
  ];

  const [TimeOpen, setTimeOpen] = useState(GTimeOpen);
  const [TimeClose, setTimeClose] = useState(GTimeClose);

  const [isModal, setIsModal] = useState(false);
  const [btnLoading, setBtnLoading] = useState({
    isBtnBooking: false,
    isBtnDelete: false,
    isBtnFinish: false,
  });
  const [isFilter, setIsFilter] = useState(false);
  const [isSidebar, setIsSidebar] = useState(false);

  const [filters, setFilters] = useState({
    Status: [
      "XAC_NHAN",
      "XAC_NHAN_TU_DONG",
      "CHUA_XAC_NHAN",
      ...(!GlobalConfig?.Admin?.isAdminBooks ? ["DANG_THUC_HIEN"] : []),
      ...(GlobalConfig?.Admin?.PosStatus
        ? [...GlobalConfig?.Admin?.PosStatus]
        : []),
      // "THUC_HIEN_XONG",
    ],
    StockID: AuthCrStockID,
    Tags: "",
  });
  const [topCalendar, setTopCalendar] = useState({
    type: GlobalConfig?.Admin?.PosActiveCalendar
      ? optionsCalendar.filter(
          (x) => x.value === GlobalConfig?.Admin?.PosActiveCalendar
        )[0]
      : {
          value: "resourceCurrentDay", //resourceTimeGridDay
          label: "Xem lịch hiện tại", //
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
    if (width < 1200) setIsSidebar(true);
    else {
      setIsSidebar(false);
    }
  }, [width]);

  useEffect(() => {
    if (topCalendar?.type?.value === "resourceTimeGridDay") {
      setFilters((prevState) => ({
        ...prevState,
        Status: prevState.Status
          ? [
              ...new Set([
                ...prevState.Status,
                "XAC_NHAN",
                "XAC_NHAN_TU_DONG",
                "CHUA_XAC_NHAN",
                ...(!GlobalConfig?.Admin?.isAdminBooks
                  ? ["DANG_THUC_HIEN"]
                  : []),
                ...(GlobalConfig?.Admin?.PosStatus
                  ? [...GlobalConfig?.Admin?.PosStatus]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topCalendar?.type]);

  useEffect(() => {
    if (
      calendarRef?.current?.getApi &&
      topCalendar?.type?.value !== "resourceCurrentDay"
    ) {
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
        params.From = params.From.format("YYYY-MM-DD");
        params.To = params.To.add(6, "day").format("YYYY-MM-DD");
        break;
      case "resourceCurrentDay":
        params.From = moment().format("YYYY-MM-DD");
        params.To = moment()
          .add(6, "day")
          .format("YYYY-MM-DD");
        break;
      default:
        params.From = params.From.format("YYYY-MM-DD");
        params.To = params.To.format("YYYY-MM-DD");
    }
    setFilters((prevState) => ({
      ...prevState,
      ...params,
      day:
        topCalendar?.type?.value === "resourceCurrentDay"
          ? moment().toDate()
          : prevState.day,
    }));
  }, [topCalendar?.type, topCalendar?.day]);

  //Get Staff Full
  useEffect(() => {
    async function getStaffFull() {
      const { data } = await CalendarCrud.getStaffs({
        StockID: AuthCrStockID,
        All: true,
      });
      const newData =
        Array.isArray(data) && data.length > 0
          ? data.map((item) => ({
              ...item,
              id: item.id,
              title: item.text,
              order: item?.source?.Order || 0,
            }))
          : [];
      setStaffFull([
        ...newData,
        { id: 0, title: "Chưa chọn", photo: null, order: 100000 },
      ]);
    }

    getStaffFull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topCalendar?.type]);

  useEffect(() => {
    if (calendarRef?.current?.getApi) {
      let calendarApi = calendarRef.current.getApi();
      setHeaderTitle(calendarApi.currentDataManager.data?.viewTitle);
    }
  }, [calendarRef]);

  useEffect(() => {
    if (AuthCrStockID && Stocks) {
      let index = Stocks.findIndex((x) => x.ID === Number(AuthCrStockID));

      if (index > -1) {
        let StockI = Stocks[index].KeySEO;
        if (StockI) {
          let TimesObj = formatTimeOpenClose({
            Text: StockI,
            InitialTime: {
              TimeOpen: GTimeOpen,
              TimeClose: GTimeClose,
            },
            Date: moment(topCalendar.day).format("DD/MM/YYYY"),
          });

          let newTimeOpen = moment(TimesObj.TimeOpen, "HH:mm:ss");

          setTimeOpen(
            moment()
              .set({
                hour: newTimeOpen.get("hour"),
                minute: newTimeOpen.get("minute"),
                second: newTimeOpen.get("second"),
              })
              .subtract(TimesObj?.TimeAdd || 0, "minutes")
              .format("HH:mm:ss")
          );
          let newTimeClose = moment(TimesObj.TimeClose, "HH:mm:ss");

          setTimeClose(
            moment()
              .set({
                hour: newTimeClose.get("hour"),
                minute: newTimeClose.get("minute"),
                second: newTimeClose.get("second"),
              })
              .add(TimesObj?.TimeAdd || 0, "minutes")
              .format("HH:mm:ss")
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AuthCrStockID, Stocks, topCalendar.day]);

  const ListRooms = useQuery({
    queryKey: ["ListRooms", AuthCrStockID],
    queryFn: async () => {
      let { data } = await CalendarCrud.getConfigName(`room`);
      let rs = [
        {
          RoomTitle: "0Phòng Trống",
          id: 0,
          title: "Chưa chọn phòng",
          order: 10000,
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
                for (let [i, cls] of Room.Children.entries()) {
                  rs.push({
                    ...cls,
                    RoomTitle: "1" + Room.label,
                    title: cls.label,
                    id: cls.ID,
                    order: i + 1,
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

  window.top.OsRooms = ListRooms?.data || [];

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

  const BanTimeCalendar = useQuery({
    queryKey: ["BanTimeCalendar", AuthCrStockID],
    queryFn: async () => {
      let { data } = await CalendarCrud.getConfigName(`giocam`);
      let newValues = [];
      if (data && data.length > 0) {
        const result = data[0].Value ? JSON.parse(data[0].Value) : "";

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
      }
      return newValues;
    },
    onSuccess: (data) => {
      setListLock({
        ListLocks: data,
      });
    },
  });

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
      .then(async (response) => {
        await ListCalendars.refetch();
        await BanTimeCalendar.refetch();
        onHideModalLock();
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
    return "Cập nhật lịch thành công !";
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
    Desc =
      (Desc ? Desc + "\n" : "") +
      `Ghi chú: ${values.Desc ? values.Desc.replace(/\n\r?/g, "</br>") : ""}`;

    let Members = {
      ...values.MemberID,
    };

    const objBooking = {
      ...values,
      MemberID: values?.MemberID?.value || "",
      RootIdS: values.RootIdS
        ? values.RootIdS.map((item) => item.value).toString()
        : "",
      Roots: values.RootIdS,
      UserServiceIDs:
        values.UserServiceIDs && values.UserServiceIDs.length > 0
          ? values.UserServiceIDs.map((item) => item.value).toString()
          : "",
      BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
      Status: values.Status ? values.Status : "XAC_NHAN",
      Desc,
      IsAnonymous: values.MemberID?.PassersBy || false,
      TreatmentJson: values?.TreatmentJson
        ? JSON.stringify(values?.TreatmentJson)
        : "",
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

        if (newMember?.member) Members = { ...newMember?.member };
      } else if (!values.MemberID) {
        let NextMember = await CalendarCrud.getNextMember();
        if (NextMember?.Member) {
          objBooking.MemberID = NextMember?.Member?.ID || 0;

          let FullName = NextMember?.Member?.FullName || "";

          if (!values.ID) {
            let newFullName = NextMember?.Member?.ID;
            if (values?.TreatmentJson?.label) {
              newFullName =
                NextMember?.Member?.ID + " - " + values?.TreatmentJson?.label;
            }
            let memberUpdate = {
              ...NextMember?.Member,
              Birth: NextMember?.Member?.BirthDate
                ? moment(NextMember?.Member.BirthDate, "YYYY-MM-DD").format(
                    "DD/MM/YYYY"
                  )
                : "",
              FullName: newFullName,
            };

            let rsMUpdate = await CalendarCrud.addEditMember({
              member: memberUpdate,
            });
            FullName = rsMUpdate?.Member?.FullName;
          }
          if (NextMember?.Member) Members = { ...NextMember?.Member, FullName };
        } else {
          toast.error("Xảy ra lỗi khi tạo khách hàng.");
          setBtnLoading((prevState) => ({
            ...prevState,
            isBtnBooking: false,
          }));
          return;
        }
      }

      if (
        values?.ID &&
        (values?.Status === "XAC_NHAN" || values?.Status === "KHACH_DEN")
      ) {
        let CrMember = await CalendarCrud.clientsId({
          pi: 1,
          ps: 1,
          Key: "#" + objBooking.MemberID,
        });
        if (CrMember?.data && CrMember.data.length > 0) {
          let CrMemberItem = CrMember?.data[0];
          let memberUpdate = {
            ...CrMemberItem,
            Birth: CrMemberItem?.BirthDate
              ? moment(CrMemberItem.BirthDate, "YYYY-MM-DD").format(
                  "DD/MM/YYYY"
                )
              : "",
            FullName: values?.TreatmentJson?.label
              ? CrMemberItem?.FullName.split(" - ")[0] +
                " - " +
                values?.TreatmentJson?.label
              : CrMemberItem?.FullName.split(" - ")[0],
          };

          let rsMUpdate = await CalendarCrud.addEditMember({
            member: memberUpdate,
          });
          Members = { ...CrMemberItem, FullName: rsMUpdate?.Member?.FullName };
        }
      }

      let History = {
        ...(values?.History || {}),
        Edit: values?.History?.Edit
          ? [
              ...values?.History?.Edit,
              {
                CreateDate: moment().format("HH:mm DD-MM-YYYY"),
                Staff: {
                  ID: window?.top?.Info?.User?.ID,
                  FullName: window?.top?.Info?.User?.FullName,
                },
                Booking: {
                  ...objBooking,
                  Members,
                  UserServices: values.UserServiceIDs,
                },
              },
            ]
          : [
              {
                CreateDate: moment().format("HH:mm DD-MM-YYYY"),
                Staff: {
                  ID: window?.top?.Info?.User?.ID,
                  FullName: window?.top?.Info?.User?.FullName,
                },
                Booking: {
                  ...objBooking,
                  Members,
                  UserServices: values.UserServiceIDs,
                },
              },
            ],
      };

      objBooking.History = History;

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

      window?.top?.OnMemberBook &&
        window?.top?.OnMemberBook({
          Member: Members,
          booking: objBooking,
          action: "ADD_EDIT",
        });
      await queryClient.invalidateQueries({
        queryKey: ["ListCurrentCalendars"],
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

  const onGuestsArrive = async (values, { setFieldError, setFieldTouched }) => {
    if (!values?.RootIdS || values.RootIdS.length === 0) {
      setFieldError("RootIdS", "Vui lòng chọn dịch vụ thực hiện.");
      setFieldTouched("RootIdS", true);
      return;
    }

    setBtnLoading((prevState) => ({
      ...prevState,
      isBtnGuestsArrive: true,
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
    Desc =
      (Desc ? Desc + "\n" : "") +
      `Ghi chú: ${values.Desc ? values.Desc.replace(/\n\r?/g, "</br>") : ""}`;

    const objBooking = {
      ...values,
      MemberID: values?.MemberID?.value || "",
      RootIdS: values.RootIdS.map((item) => item.value).toString(),
      Roots: values.RootIdS,
      UserServiceIDs:
        values.UserServiceIDs && values.UserServiceIDs.length > 0
          ? values.UserServiceIDs.map((item) => item.value).toString()
          : "",
      BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
      Status: "KHACH_DEN",
      Desc,
      TreatmentJson: values?.TreatmentJson
        ? JSON.stringify(values?.TreatmentJson)
        : "",
      IsAnonymous: values.MemberID?.PassersBy || false,
      // Desc:
      //   window?.top?.GlobalConfig?.APP?.SL_khach && values.AmountPeople
      //     ? `Số lượng khách: ${values.AmountPeople.value}. \nGhi chú: ${values.Desc}`
      //     : values.Desc,
    };

    const CurrentStockID = Cookies.get("StockID");
    const u_id_z4aDf2 = Cookies.get("u_id_z4aDf2");

    let Members = {
      ...values.MemberID,
    };

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

        if (newMember?.member) Members = { ...newMember?.member };
      } else if (!values.MemberID) {
        let NextMember = await CalendarCrud.getNextMember();
        if (NextMember?.Member) {
          objBooking.MemberID = NextMember?.Member?.ID || 0;

          let FullName = NextMember?.Member?.FullName || "";
          
          if (!values.ID) {
            let newFullName = NextMember?.Member?.ID;

            if (values?.TreatmentJson?.label) {
              newFullName =
                NextMember?.Member?.ID + " - " + values?.TreatmentJson?.label;
            }
            let memberUpdate = {
              ...NextMember?.Member,
              Birth: NextMember?.Member?.BirthDate
                ? moment(NextMember?.Member.BirthDate, "YYYY-MM-DD").format(
                    "DD/MM/YYYY"
                  )
                : "",
              FullName: newFullName,
            };

            let rsMUpdate = await CalendarCrud.addEditMember({
              member: memberUpdate,
            });
            FullName = rsMUpdate?.Member?.FullName;
          }
          if (NextMember?.Member) Members = { ...NextMember?.Member, FullName };
        } else {
          toast.error("Xảy ra lỗi khi tạo khách hàng.");
          setBtnLoading((prevState) => ({
            ...prevState,
            isBtnGuestsArrive: false,
          }));
          return;
        }
      }

      var bodyFormCheckIn = new FormData();
      bodyFormCheckIn.append("cmd", "checkin");
      bodyFormCheckIn.append("mid", objBooking.MemberID);
      bodyFormCheckIn.append("desc", "");
      let rsCheckIn = await CalendarCrud.checkinMember(bodyFormCheckIn);
      if (rsCheckIn?.mc?.ID && values.RootIdS && values.RootIdS.length > 0) {
        var bodyFormOrder = new FormData();
        bodyFormOrder.append("CheckInID", rsCheckIn?.mc?.ID);
        bodyFormOrder.append(
          "arr",
          JSON.stringify(values.RootIdS.map((x) => ({ id: x.value, qty: 1 })))
        );

        await CalendarCrud.addOrderCheckIn(bodyFormOrder);
      }
      let History = {
        ...(values?.History || {}),
        Edit: values?.History?.Edit
          ? [
              ...values?.History?.Edit,
              {
                CreateDate: moment().format("HH:mm DD-MM-YYYY"),
                Staff: {
                  ID: window?.top?.Info?.User?.ID,
                  FullName: window?.top?.Info?.User?.FullName,
                },
                Booking: {
                  ...objBooking,
                  Members,
                  UserServices: values.UserServiceIDs,
                },
              },
            ]
          : [
              {
                CreateDate: moment().format("HH:mm DD-MM-YYYY"),
                Staff: {
                  ID: window?.top?.Info?.User?.ID,
                  FullName: window?.top?.Info?.User?.FullName,
                },
                Booking: {
                  ...objBooking,
                  Members,
                  UserServices: values.UserServiceIDs,
                },
              },
            ],
      };

      objBooking.History = History;

      if (
        values?.ID &&
        (values?.Status === "XAC_NHAN" || values?.Status === "KHACH_DEN")
      ) {
        let CrMember = await CalendarCrud.clientsId({
          pi: 1,
          ps: 1,
          Key: "#" + objBooking.MemberID,
        });
        if (CrMember?.data && CrMember.data.length > 0) {
          let CrMemberItem = CrMember?.data[0];
          let memberUpdate = {
            ...CrMemberItem,
            Birth: CrMemberItem?.BirthDate
              ? moment(CrMemberItem.BirthDate, "YYYY-MM-DD").format(
                  "DD/MM/YYYY"
                )
              : "",
            FullName: values?.TreatmentJson?.label
              ? CrMemberItem?.FullName.split(" - ")[0] +
                " - " +
                values?.TreatmentJson?.label
              : CrMemberItem?.FullName.split(" - ")[0],
          };

          let rsMUpdate = await CalendarCrud.addEditMember({
            member: memberUpdate,
          });
          Members = {
            ...CrMemberItem,
            FullName: rsMUpdate?.Member?.FullName,
          };
        }
      }

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
              Insert: true,
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
      window?.top?.OnMemberBook &&
        window?.top?.OnMemberBook({
          Member: Members,
          booking: objBooking,
          action: "ADD_EDIT",
        });
      await queryClient.invalidateQueries({
        queryKey: ["ListCurrentCalendars"],
      });
      ListCalendars.refetch().then(() => {
        window.top.location.href = `/admin/?mdl=store&act=sell#mp:${objBooking.MemberID}`;
        toast.success(getTextToast(values.Status), {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
        setBtnLoading((prevState) => ({
          ...prevState,
          isBtnGuestsArrive: false,
        }));
        onHideModal();
      });
    } catch (error) {
      console.log(error);
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnGuestsArrive: false,
      }));
    }
  };

  const onFinish = async (values) => {
    setBtnLoading((prevState) => ({
      ...prevState,
      isBtnFinish: true,
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
    Desc =
      (Desc ? Desc + "\n" : "") +
      `Ghi chú: ${values.Desc ? values.Desc.replace(/\n\r?/g, "</br>") : ""}`;

    const objBooking = {
      ...values,
      MemberID: values.MemberID.value,
      RootIdS: values.RootIdS.map((item) => item.value).toString(),
      Roots: values.RootIdS,
      UserServiceIDs:
        values.UserServiceIDs && values.UserServiceIDs.length > 0
          ? values.UserServiceIDs.map((item) => item.value).toString()
          : "",
      BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
      Status: "KHACH_DEN",
      Desc,
      TreatmentJson: values?.TreatmentJson
        ? JSON.stringify(values?.TreatmentJson)
        : "",
      // Desc:
      //   window?.top?.GlobalConfig?.APP?.SL_khach && values.AmountPeople
      //     ? `Số lượng khách: ${values.AmountPeople.value}. \nGhi chú: ${values.Desc}`
      //     : values.Desc,
    };

    const CurrentStockID = Cookies.get("StockID");
    const u_id_z4aDf2 = Cookies.get("u_id_z4aDf2");

    let Members = {
      ...values.MemberID,
    };

    try {
      if (values?.IsMemberCurrent?.IsAnonymous) {
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
              isBtnFinish: false,
            }));
            return;
          }
          objBooking.MemberID = newMember?.member?.ID;
          Members = { ...newMember?.member };
        } else {
          objBooking.MemberID = values?.IsMemberCurrent?.MemberPhone.ID;
          Members = { ...values?.IsMemberCurrent?.MemberPhone };
        }
      }

      var bodyFormCheckIn = new FormData();
      bodyFormCheckIn.append("cmd", "checkin");
      bodyFormCheckIn.append("mid", objBooking.MemberID);
      bodyFormCheckIn.append("desc", "");
      let rsCheckIn = await CalendarCrud.checkinMember(bodyFormCheckIn);
      if (rsCheckIn?.mc?.ID && values.RootIdS && values.RootIdS.length > 0) {
        var bodyFormOrder = new FormData();
        bodyFormOrder.append("CheckInID", rsCheckIn?.mc?.ID);
        bodyFormOrder.append(
          "arr",
          JSON.stringify(values.RootIdS.map((x) => ({ id: x.value, qty: 1 })))
        );

        await CalendarCrud.addOrderCheckIn(bodyFormOrder);
      }
      let History = {
        ...(values?.History || {}),
        Edit: values?.History?.Edit
          ? [
              ...values?.History?.Edit,
              {
                CreateDate: moment().format("HH:mm DD-MM-YYYY"),
                Staff: {
                  ID: window?.top?.Info?.User?.ID,
                  FullName: window?.top?.Info?.User?.FullName,
                },
                Booking: {
                  ...objBooking,
                  Members,
                  UserServices: values.UserServiceIDs,
                },
              },
            ]
          : [
              {
                CreateDate: moment().format("HH:mm DD-MM-YYYY"),
                Staff: {
                  ID: window?.top?.Info?.User?.ID,
                  FullName: window?.top?.Info?.User?.FullName,
                },
                Booking: {
                  ...objBooking,
                  Members,
                  UserServices: values.UserServiceIDs,
                },
              },
            ],
      };

      objBooking.History = History;

      if (
        values?.ID &&
        (values?.Status === "XAC_NHAN" || values?.Status === "KHACH_DEN")
      ) {
        let CrMember = await CalendarCrud.clientsId({
          pi: 1,
          ps: 1,
          Key: "#" + objBooking.MemberID,
        });
        if (CrMember?.data && CrMember.data.length > 0) {
          let CrMemberItem = CrMember?.data[0];
          let memberUpdate = {
            ...CrMemberItem,
            Birth: CrMemberItem?.BirthDate
              ? moment(CrMemberItem.BirthDate, "YYYY-MM-DD").format(
                  "DD/MM/YYYY"
                )
              : "",
            FullName: values?.TreatmentJson?.label
              ? CrMemberItem?.FullName.split(" - ")[0] +
                " - " +
                values?.TreatmentJson?.label
              : CrMemberItem?.FullName.split(" - ")[0],
          };

          let rsMUpdate = await CalendarCrud.addEditMember({
            member: memberUpdate,
          });
          Members = { ...CrMemberItem, FullName: rsMUpdate?.Member?.FullName };
        }
      }

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
              Insert: true,
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
      window?.top?.OnMemberBook &&
        window?.top?.OnMemberBook({
          Member: Members,
          booking: objBooking,
          action: "ADD_EDIT",
        });
      await queryClient.invalidateQueries({
        queryKey: ["ListCurrentCalendars"],
      });
      ListCalendars.refetch().then(() => {
        window.top.location.href = `/admin/?mdl=store&act=sell#mp:${objBooking.MemberID}`;
        toast.success(getTextToast(values.Status), {
          position: toast.POSITION.TOP_RIGHT,
          autoClose: 1500,
        });
        setBtnLoading((prevState) => ({
          ...prevState,
          isBtnFinish: false,
        }));
        onHideModal();
      });
    } catch (error) {
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnFinish: false,
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
          Roots: values.RootIdS,
          UserServiceIDs:
            values.UserServiceIDs && values.UserServiceIDs.length > 0
              ? values.UserServiceIDs.map((item) => item.value).toString()
              : "",
          BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
          Status: "TU_CHOI",
          TreatmentJson: values?.TreatmentJson
            ? JSON.stringify(values?.TreatmentJson)
            : "",
          History: {
            ...(values?.History || {}),
            Edit: values?.History?.Edit
              ? [
                  ...values?.History?.Edit,
                  {
                    CreateDate: moment().format("HH:mm DD-MM-YYYY"),
                    Staff: {
                      ID: window?.top?.Info?.User?.ID,
                      FullName: window?.top?.Info?.User?.FullName,
                    },
                    Booking: {
                      ...values,
                    },
                  },
                ]
              : [
                  {
                    CreateDate: moment().format("HH:mm DD-MM-YYYY"),
                    Staff: {
                      ID: window?.top?.Info?.User?.ID,
                      FullName: window?.top?.Info?.User?.FullName,
                    },
                    Booking: {
                      ...values,
                    },
                  },
                ],
          },
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
      window?.top?.OnMemberBook &&
        window?.top?.OnMemberBook({
          Member: values.MemberID,
          booking: {
            ...values,
            MemberID: values.MemberID.value,
            RootIdS: values.RootIdS.map((item) => item.value).toString(),
            Roots: values.RootIdS,
            UserServiceIDs:
              values.UserServiceIDs && values.UserServiceIDs.length > 0
                ? values.UserServiceIDs.map((item) => item.value).toString()
                : "",
            BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
            Status: "TU_CHOI",
          },
          action: "DELETE",
        });
      await queryClient.invalidateQueries({
        queryKey: ["ListCurrentCalendars"],
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
    queryKey: [
      "ListCalendarsMassage",
      { ListLock, filters, View: topCalendar?.type?.value },
    ],
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
      let data = await CalendarCrud.getBooking({
        ...newFilters,
        IsMassage: checkout_time,
      });
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

      if (ListLock && ListLock?.ListLocks.length > 0) {
        let LockCrIndex = ListLock?.ListLocks.findIndex(
          (x) => x.StockID === filters.StockID
        );
        if (LockCrIndex > -1 && ListLock?.ListLocks[LockCrIndex].ListDisable) {
          for (let DateDisable of ListLock?.ListLocks[LockCrIndex]
            .ListDisable) {
            if (
              moment(DateDisable.Date).format("YYYY-MM-DD") === filters.From
            ) {
              for (let TimeClose of DateDisable.TimeClose) {
                let timeStart = moment(TimeClose.Start, "HH:mm");
                let timeEnd = moment(TimeClose.End, "HH:mm");

                dataOffline.push({
                  start: moment(DateDisable.Date)
                    .set({
                      hour: timeStart.get("hour"),
                      minute: timeStart.get("minute"),
                      second: "00",
                    })
                    .toDate(),
                  end: moment(DateDisable.Date)
                    .set({
                      hour: timeEnd.get("hour"),
                      minute: timeEnd.get("minute"),
                      second: "00",
                    })
                    .toDate(),
                  display: "background",
                  className: ["fc-no-event fc-no-event-lock"],
                });
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
                    .add(item.RootMinutes ?? 90, "minutes")
                    .toDate(),
                  title: item.RootTitles,
                  className: `fc-event-solid-${getStatusClss(
                    item.Status,
                    item
                  )}`,
                  resourceIds:
                    topCalendar?.type?.value === "resourceTimelineDay"
                      ? [TreatmentJson?.ID || TreatmentJson?.value || 0]
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
                };
              })
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
                .add(item.os.RootMinutes ?? 90, "minutes")
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
                  : item.staffs &&
                    Array.isArray(item.staffs) &&
                    item.staffs.length > 0
                  ? item.staffs.map((staf) => staf.ID)
                  : [0],
            }))
          : [];

      if (topCalendar?.type?.value === "resourceTimelineDay") {
        dataBooks = dataBooks.filter(
          (x) =>
            dataBooksAuto.findIndex((o) => o?.Member?.ID === x?.Member?.ID) ===
            -1
        );
      }

      return [...dataBooks, ...dataBooksAuto, ...dataOffline];
    },
    enabled:
      Boolean(filters && filters.From) &&
      topCalendar?.type?.value !== "resourceCurrentDay",
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
          `<div class="w-[32px] h-[32px] border-2 border-white rounded-full dark:border-gray-800" style="background: ${x.color};"></div>`
      )
      .join("");
  };

  return (
    <div className={`ezs-calendar`}>
      <div className="px-0 container-fluid h-100">
        <div className="d-flex flex-column flex-xl-row h-100">
          {isSidebar && (
            <SidebarMassageCalendar
              filters={filters}
              onOpenModal={onOpenModal}
              onSubmit={getFiltersBooking}
              //initialView={initialView}
              //initialView={topCalendar.view}
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
          )}

          <div
            className={clsx(
              "flex flex-col ezs-calendar__content",
              !isSidebar && "!w-full"
            )}
          >
            <div className="flex justify-between mb-4">
              <div className="flex flex-1 mr-2 md:mr-0">
                <button
                  className="mr-[8px] rounded-[4px] w-[42px] items-center justify-center hidden xl:flex"
                  type="button"
                  onClick={() => setIsSidebar(!isSidebar)}
                >
                  <i className="fa-regular fa-magnifying-glass text-[15px] mt-1 text-gray-700" />
                </button>
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
                    disabled={topCalendar?.type?.value === "resourceCurrentDay"}
                  />
                  <div className="absolute top-0 right-0 hidden h-full md:block">
                    <button
                      type="button"
                      className="bg-transparent w-[25px] h-full group disabled:opacity-60"
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
                      disabled={
                        topCalendar?.type?.value === "resourceCurrentDay"
                      }
                    >
                      <i className="fa-regular fa-chevron-left text-[15px] group-hover:!text-primary"></i>
                    </button>
                    <button
                      type="button"
                      className="bg-transparent w-[25px] h-full group disabled:opacity-60"
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
                      disabled={
                        topCalendar?.type?.value === "resourceCurrentDay"
                      }
                    >
                      <i className="fa-regular fa-chevron-right text-[15px] group-hover:!text-primary"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex">
                <PickerReportStaffService>
                  {(ReportStaff) => (
                    <PickerReportMassageV2>
                      {(Report) => (
                        <PickerOfflineSchedule>
                          {(OfflineSchedule) => (
                            <Select
                              options={[
                                ...optionsCalendar,
                                {
                                  value: "PickerOfflineSchedule",
                                  label: "Lịch nghỉ",
                                },
                                {
                                  value: "PickerReportStaffService",
                                  label: "Bảng xếp Tour",
                                },
                                {
                                  value: "PickerReportMassage",
                                  label: "Thống kê",
                                },
                              ].filter((x) => !x.hidden)}
                              value={topCalendar.type}
                              onChange={(val) => {
                                if (val?.value === "PickerOfflineSchedule") {
                                  OfflineSchedule.open();
                                } else if (
                                  val?.value === "PickerReportMassage"
                                ) {
                                  Report?.open();
                                } else if (
                                  val?.value === "PickerReportStaffService"
                                ) {
                                  ReportStaff?.open();
                                } else {
                                  setTopCalendar((prevState) => ({
                                    ...prevState,
                                    type: val,
                                  }));
                                }
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
                              className="select-control w-[165px] md:w-[230px] select-control-solid font-medium"
                              classNamePrefix="select"
                            />
                          )}
                        </PickerOfflineSchedule>
                      )}
                    </PickerReportMassageV2>
                  )}
                </PickerReportStaffService>

                {topCalendar?.type?.value === "resourceCurrentDay" && (
                  <button
                    type="button"
                    className="rounded-[4px] w-11 ml-2 text-primary"
                    onClick={() => {
                      queryClient.invalidateQueries({
                        queryKey: ["ListCurrentCalendars"],
                      });
                    }}
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
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                  </button>
                )}

                <Dropdown className="w-auto ml-[8px]">
                  <Dropdown.Toggle className="!bg-[#ede7fe] hover:!bg-[#8561f9] !border-0 h-[40px] px-10px w-100 hide-icon-after no-after group">
                    <i className="fa-light fa-gear pr-0 text-[15px] !text-[#8561f9] group-hover:!text-white"></i>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="w-[200px]" variant="dark">
                    {
                      <PickerSettingCalendar SettingCalendar={SettingCalendar}>
                        {({ open }) => (
                          <Dropdown.Item href="#" onClick={open}>
                            Cài đặt bảng lịch
                          </Dropdown.Item>
                        )}
                      </PickerSettingCalendar>
                    }
                    <Dropdown.Item href="#" onClick={onOpenModalRoom}>
                      Cài đặt phòng
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>

                <button
                  className="btn btn-primary btn-sm h-[40px] px-15px ml-[8px] !hidden xl:!block"
                  type="button"
                  onClick={onOpenModal}
                >
                  {width > 1200 ? (
                    "Tạo đặt lịch mới"
                  ) : (
                    <i className="fal fa-plus !pr-0"></i>
                  )}
                </button>
              </div>
            </div>

            {topCalendar?.type?.value !== "resourceCurrentDay" && (
              <div className={clsx("grow position-relative fc-massage")}>
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
                  initialView={
                    topCalendar?.type?.value === "resourceCurrentDay"
                      ? "resourceTimeGridDay"
                      : topCalendar?.type?.value
                  } //timeGridDay
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
                      duration: { days: width > 991 ? 7 : 3 },
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
                      dayMinWidth: 130,
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
                          <div className="flex flex-col items-center">
                            <div className="p-1 border rounded-full w-14 h-14 font-inter border-primary">
                              <div className="cursor-pointer aspect-square">
                                <img
                                  className="object-cover object-top w-full h-full rounded-full"
                                  src={toAbsoluteUser(
                                    resource?._resource?.extendedProps?.photo,
                                    "/"
                                  )}
                                  alt={resource._resource.title}
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
                                  onClick={() => {
                                    let Photos = [
                                      {
                                        src: toAbsoluteUser(
                                          resource?._resource?.extendedProps
                                            ?.photo,
                                          "/"
                                        ),
                                      },
                                    ];
                                    let newPhotoJSON = resource?._resource
                                      ?.extendedProps?.source?.PhotoJSON
                                      ? JSON.parse(
                                          resource?._resource?.extendedProps
                                            ?.source?.PhotoJSON
                                        )
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
                                              resource?._resource?.extendedProps
                                                ?.photo,
                                              "/"
                                            ),
                                          },
                                          type: "image",
                                        });
                                    }
                                  }}
                                />
                              </div>

                              {/* <div className="flex items-center justify-center w-full h-full rounded-full bg-[#e2f0ff] text-primary">
                              T
                            </div> */}
                            </div>
                            <div className="mt-2 capitalize title-staff">
                              {resource._resource.title}
                            </div>
                          </div>
                        );
                      },
                      // resourceLabelContent: ({ resource }) => {
                      //   return (
                      //     <div className="d-flex align-items-center flex-column">

                      //       <div className="capitalize title-staff">
                      //         {resource._resource.title}
                      //       </div>
                      //     </div>
                      //   );
                      // },
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
                      slotMinWidth: 80,
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
                      ? "-RoomTitle"
                      : "order"
                  }
                  resourceGroupLabelContent={(arg) => {
                    return { html: `${arg.groupValue.slice(1)}` };
                  }}
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
                    const { _def, extendedProps } = event;
                    if (_def.extendedProps.os && isTelesales) return;
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
                    // let AmountPeople = 0;
                    // if (extendedProps.Desc) {
                    //   let descSplit = extendedProps.Desc.split("\n");
                    //   for (let i of descSplit) {
                    //     if (i.includes("Số lượng khách:")) {
                    //       let SL = Number(i.match(/\d+/)[0]);
                    //       AmountPeople = Number(SL);
                    //     }
                    //   }
                    // }
                    if (
                      typeof extendedProps !== "object" ||
                      Object.keys(extendedProps).length > 0
                    ) {
                      // let Room = extendedProps?.TreatmentJson
                      //   ? JSON.parse(extendedProps?.TreatmentJson)
                      //   : null;
                      if (view.type !== "listWeek") {
                        italicEl.innerHTML = `<div class="fc-title${
                          topCalendar?.type?.value === "resourceTimelineDay"
                            ? " flex justify-between"
                            : ""
                        }">
                      <div class="${
                        topCalendar?.type?.value === "resourceTimelineDay"
                          ? ""
                          : " mb-px"
                      }">
                        <div>${extendedProps?.Member?.FullName || ""}</div>
                        <div class="flex">
                          <div>${moment(extendedProps.BookDate).format(
                            "HH:mm"
                          )}</div>
                          <div class="px-1">-</div>
                          <div>${moment(extendedProps.BookDate)
                            .add(
                              extendedProps?.RootMinutes ??
                                extendedProps?.os?.RootMinutes ??
                                60,
                              "minutes"
                            )
                            .format("HH:mm")}</div>
                        </div>
                      </div>
                      <div class="flex items-center justify-between${
                        topCalendar?.type?.value === "resourceTimelineDay"
                          ? " gap-2.5"
                          : ""
                      }">
                        <div class="flex -space-x-4 rtl:space-x-reverse${
                          renderColor(extendedProps) === "" ? " hidden" : ""
                        }">${renderColor(extendedProps)}</div>
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
                          0}/${extendedProps?.BookCount?.Total ||
                          0}</span></div>
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
            )}

            {topCalendar?.type?.value === "resourceCurrentDay" && (
              <MassageResourceCurrentDay
                setInitialValue={(val) => setInitialValue(val)}
                onOpenModal={onOpenModal}
              />
            )}
          </div>
        </div>
      </div>

      <ModalMassageCalendar
        show={isModal}
        onHide={onHideModal}
        onSubmit={onSubmitBooking}
        onFinish={onFinish}
        onDelete={onDeleteBooking}
        onGuestsArrive={onGuestsArrive}
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
        isTelesales={isTelesales}
      />
      <ModalCalendarLock
        show={isModalLock}
        onHide={onHideModalLock}
        ListLock={ListLock}
        onSubmit={onSubmitLock}
        btnLoadingLock={btnLoadingLock}
        AuthCrStockID={AuthCrStockID}
        refetch={BanTimeCalendar.refetch}
        isLoading={BanTimeCalendar.isLoading}
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

export default CalendarMassagePage;
