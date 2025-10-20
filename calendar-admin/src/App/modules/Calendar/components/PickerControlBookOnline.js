import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import FullCalendar from "@fullcalendar/react";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import PickerAddEditBookOnline from "./PickerAddEditBookOnline";
import { useQuery } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import interactionPlugin from "@fullcalendar/interaction";

import moment from "moment";
import vi from "date-fns/locale/vi";

const getStatusClass = (Status, item) => {
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

const checkStar = (item) => {
  if (item?.Member?.MobilePhone !== "0000000000") return "";
  if (item?.Member?.MobilePhone === "0000000000" && item?.IsNew) return "**";
  else {
    return "*";
  }
};

function missingItems(arr, n) {
  let missingItems = [];
  for (let i = 1; i <= n; i++) if (!arr.includes(i)) missingItems.push(i);
  return missingItems;
}

function PickerSettingBookOnline({ children, TimeOpen, TimeClose }) {
  const { AuthCrStockID, SettingBookOnlineMinutes } = useSelector(
    ({ Auth, JsonConfig }) => ({
      AuthCrStockID: Auth.CrStockID,
      SettingBookOnlineMinutes: JsonConfig?.Admin?.SettingBookOnlineMinutes,
    })
  );

  const calendarRef = useRef("");

  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState({
    CrDate: new Date(),
    StockID: AuthCrStockID,
  });

  useEffect(() => {
    if (visible) {
      setFilters({
        CrDate: new Date(),
        StockID: AuthCrStockID,
      });
    } else {
      setFilters({
        CrDate: null,
        StockID: AuthCrStockID,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(filters.CrDate);
    }
  }, [filters.CrDate, calendarRef]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["SettingControlOnline", filters],
    queryFn: async () => {
      let { list } = await CalendarCrud.getListBookConfig({
        StockID: filters.StockID || AuthCrStockID,
        From: moment(filters.CrDate).format("YYYY-MM-DD"),
        To: moment(filters.CrDate).format("YYYY-MM-DD"),
        pi: 1,
        ps: 1000,
      });
      let { data: Stafss } = await CalendarCrud.getListStaff(AuthCrStockID);
      let { books, osList } = await CalendarCrud.getBooking({
        From: moment(filters.CrDate).format("YYYY-MM-DD"),
        To: moment(filters.CrDate).format("YYYY-MM-DD"),
        MemberID: "",
        StockID: AuthCrStockID,
        Status: "XAC_NHAN,DANG_THUC_HIEN,THUC_HIEN_XONG,CHUA_XAC_NHAN",
        UserServiceIDs: "",
        StatusMember: "",
        StatusBook: "",
        StatusAtHome: "",
        Tags: "",
      });
      let newBooks = [
        ...(books || []),
        ...(osList || []).map((x) => ({
          ...x,
          BookDate: x.os.BookDate,
          RootTitles: x.os.ProdService2 || x.os.ProdService,
          RootMinutes: x.os.RootMinutes,
          Member: x.member,
          Status: x.os.Status,
        })),
      ]
        .sort((left, right) =>
          moment.utc(left.BookDate).diff(moment.utc(right.BookDate))
        )
        .map((x) => ({ ...x, Index: x.Status === "CHUA_XAC_NHAN" ? 0 : 1 }))
        .sort((a, b) => b.Index - a.Index);

      let Lists = [];

      let MaxBook = Stafss.length;
      if (list && list.length > 0) {
        MaxBook = Math.max(...list.map((x) => Number(x.Config.MaxBook)));

        for (let item of list) {
          let newObj = {
            start: moment(item.Config.from, "YYYY-MM-DD HH:mm").toDate(),
            end: moment(item.Config.to, "YYYY-MM-DD HH:mm").toDate(),
            display: "background",
            resourceIds: Array.from(
              { length: item.Config.MaxBook },
              (_, i) => i + 1
            ),
            className: ["fc-event-active"],
          };
          Lists.push(newObj);
        }
      }

      let Resources = Array.from({ length: MaxBook }, (_, i) => ({
        id: i + 1,
        title: i + 1,
      }));

      if (newBooks && newBooks.length > 0) {
        for (let book of newBooks) {
          // let index = list.findIndex((x) =>
          //   moment(
          //     moment(book.BookDate, "YYYY-MM-DD HH:mm").format("HH:mm"),
          //     "HH:mm"
          //   ).isBetween(
          //     moment(
          //       moment(x.Config.from, "YYYY-MM-DD HH:mm").format("HH:mm"),
          //       "HH:mm"
          //     ),
          //     moment(
          //       moment(x.Config.to, "YYYY-MM-DD HH:mm").format("HH:mm"),
          //       "HH:mm"
          //     ),
          //     null,
          //     "[]"
          //   )
          // );
          // Tìm mốc thời gian trong cài đặt

          let crList = Lists.filter(
            (x) =>
              !x.display &&
              moment(
                moment(book.BookDate, "YYYY-MM-DD HH:mm").format("HH:mm"),
                "HH:mm"
              ).isBetween(
                moment(
                  moment(x.start, "YYYY-MM-DD HH:mm").format("HH:mm"),
                  "HH:mm"
                ),
                moment(
                  moment(x.end, "YYYY-MM-DD HH:mm")
                    .subtract(SettingBookOnlineMinutes || 0, "minutes")
                    .format("HH:mm"),
                  "HH:mm"
                ),
                null,
                "[)"
              )
          );

          if (book.Status === "CHUA_XAC_NHAN") {
            crList = Lists.filter(
              (x) =>
                !x.display &&
                (moment(
                  moment(x.start, "YYYY-MM-DD HH:mm").format("HH:mm"),
                  "HH:mm"
                ).isBetween(
                  moment(
                    moment(book.BookDate, "YYYY-MM-DD HH:mm").format("HH:mm"),
                    "HH:mm"
                  ),
                  moment(
                    moment(book.BookDate, "YYYY-MM-DD HH:mm")
                      .add(book.RootMinutes || 60, "minutes")
                      .subtract(SettingBookOnlineMinutes || 0, "minutes")
                      .format("HH:mm"),
                    "HH:mm"
                  ),
                  null,
                  "[)"
                ) ||
                  moment(
                    moment(book.BookDate, "YYYY-MM-DD HH:mm").format("HH:mm"),
                    "HH:mm"
                  ).isBetween(
                    moment(
                      moment(x.start, "YYYY-MM-DD HH:mm").format("HH:mm"),
                      "HH:mm"
                    ),
                    moment(
                      moment(x.end, "YYYY-MM-DD HH:mm")
                        .subtract(SettingBookOnlineMinutes || 0, "minutes")
                        .format("HH:mm"),
                      "HH:mm"
                    ),
                    null,
                    "[)"
                  ))
            );
          }

          if (crList && crList.length > 0) {
            let ArrMaxBook = Math.max(...crList.map((x) => x.resourceIds[0]));

            let missNumber = missingItems(
              crList.map((x) => x.resourceIds[0]),
              Resources.length
            );

            let resourceId = ArrMaxBook + 1;

            if (missNumber && missNumber.length > 0) {
              resourceId = missNumber[0];
            }

            let newObj;
            if (
              ArrMaxBook < Resources.length &&
              missNumber &&
              missNumber.length > 0
            ) {
              newObj = {
                ...book,
                start: moment(book.BookDate, "YYYY-MM-DD HH:mm").toDate(),
                end: moment(book.BookDate, "YYYY-MM-DD HH:mm")
                  .add(book.RootMinutes || 60, "minutes")
                  .toDate(),
                title: book.RootTitles,
                className: `fc-event-solid-${getStatusClass(
                  book.Status,
                  book
                )}`,
                resourceIds: [resourceId],
                MemberCurrent: {
                  FullName:
                    book?.IsAnonymous ||
                    book.Member?.MobilePhone === "0000000000"
                      ? book?.FullName
                      : book?.Member?.FullName,
                  MobilePhone:
                    book?.IsAnonymous ||
                    book.Member?.MobilePhone === "0000000000"
                      ? book?.Phone
                      : book?.Member?.MobilePhone,
                },
                Star: checkStar(book),
                isBook: true,
              };
            } else {
              //add thêm resources nếu quá chiều dài max
              Resources.push({
                id: resourceId,
                title: resourceId,
              });
              newObj = {
                ...book,
                start: moment(book.BookDate, "YYYY-MM-DD HH:mm").toDate(),
                end: moment(book.BookDate, "YYYY-MM-DD HH:mm")
                  .add(book.RootMinutes || 60, "minutes")
                  .toDate(),
                title: book.RootTitles,
                className: `fc-event-solid-${getStatusClass(
                  book.Status,
                  book
                )}`,
                resourceIds: [resourceId],
                MemberCurrent: {
                  FullName:
                    book?.IsAnonymous ||
                    book.Member?.MobilePhone === "0000000000"
                      ? book?.FullName
                      : book?.Member?.FullName,
                  MobilePhone:
                    book?.IsAnonymous ||
                    book.Member?.MobilePhone === "0000000000"
                      ? book?.Phone
                      : book?.Member?.MobilePhone,
                },
                Star: checkStar(book),
                isBook: true,
              };
            }
            Lists.push(newObj);
          } else {
            let newObj = {
              ...book,
              start: moment(book.BookDate, "YYYY-MM-DD HH:mm").toDate(),
              end: moment(book.BookDate, "YYYY-MM-DD HH:mm")
                .add(book.RootMinutes || 60, "minutes")
                .toDate(),
              title: book.RootTitles,
              className: `fc-event-solid-${getStatusClass(book.Status, book)}`,
              resourceIds: [1],
              MemberCurrent: {
                FullName:
                  book?.IsAnonymous || book.Member?.MobilePhone === "0000000000"
                    ? book?.FullName
                    : book?.Member?.FullName,
                MobilePhone:
                  book?.IsAnonymous || book.Member?.MobilePhone === "0000000000"
                    ? book?.Phone
                    : book?.Member?.MobilePhone,
              },
              Star: checkStar(book),
              isBook: true,
            };
            Lists.push(newObj);
          }
        }
      }
      return {
        Resources,
        Lists,
      };
    },
    enabled: Boolean(filters.CrDate) && visible,
    keepPreviousData: true,
    onSuccess: () => {},
  });

  const onHide = () => setVisible(false);

  return (
    <>
      {children({
        open: () => setVisible(true),
      })}
      {visible &&
        createPortal(
          <div className="fixed top-0 left-0 z-[1003] bg-white !h-full w-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3.5 border-b">
              <div className="text-xl font-medium">
                Kiểm soát đặt lịch Online
              </div>
              <div className="flex">
                <div>
                  <DatePicker
                    locale={vi}
                    selected={filters.CrDate ? new Date(filters.CrDate) : null}
                    onChange={(date) =>
                      setFilters((prevState) => ({
                        ...prevState,
                        CrDate: date,
                      }))
                    }
                    className="!h-11 form-control !rounded-[4px]"
                    shouldCloseOnSelect={true}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn tháng"
                  />
                </div>
                <button
                  type="button"
                  className="rounded-[4px] w-11 ml-3 text-primary"
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
                <div className="h-11 w-[1px] bg-gray-300 ml-4 mr-2"></div>
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
            <div className="relative p-4 grow [&>*]:h-full lg:h-[calc(100%-73px)]">
              <PickerAddEditBookOnline
                TimeOpen={TimeOpen}
                TimeClose={TimeClose}
                AuthCrStockID={AuthCrStockID}
              >
                {({ open }) => (
                  <FullCalendar
                    viewClassNames="fc-setting-book-online"
                    firstDay={1}
                    handleWindowResize={true}
                    ref={calendarRef}
                    themeSystem="unthemed"
                    //locale={viLocales}
                    initialDate={new Date()}
                    initialView="resourceTimelineDay"
                    schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                    aspectRatio="3"
                    editable={false}
                    navLinks={true}
                    allDaySlot={false}
                    resources={data?.Resources || []}
                    resourceOrder={null}
                    views={{
                      resourceTimelineDay: {
                        type: "resourceTimelineDay",
                        nowIndicator: true,
                        now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                        scrollTime: moment(new Date()).format("HH:mm"),
                        resourceAreaWidth: "80px",
                        slotMinWidth: 120,
                        stickyHeaderDates: true,
                        // slotMinTime: TimeOpen,
                        // slotMaxTime: TimeClose,
                        //buttonText: "Phòng",
                        resourceAreaHeaderContent: () => "Giờ",
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
                    }}
                    plugins={[
                      resourceTimelinePlugin,
                      scrollGridPlugin,
                      interactionPlugin,
                    ]}
                    //resourceGroupField="RoomTitle"
                    events={data?.Lists || []}
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
                    eventClick={({ event }) => {
                      let Items = data?.filter(
                        (x) =>
                          moment(x.CreateDate, "YYYY-MM-DD HH:mm").format(
                            "DD-MM-YYYY"
                          ) ===
                          moment(
                            event?._def?.extendedProps?.CreateDate,
                            "YYYY-MM-DD HH:mm"
                          ).format("DD-MM-YYYY")
                      );
                      open({
                        StockID: AuthCrStockID,
                        CreateDate: moment(
                          event?._def?.extendedProps?.CreateDate,
                          "YYYY-MM-DD HH:mm"
                        ).toDate(),
                        arr:
                          Items && Items.length > 0
                            ? Items.map((item) => ({
                                ID: item?.ID,
                                Config: {
                                  from: moment(
                                    item?.Config?.from,
                                    "YYYY-MM-DD HH:mm"
                                  ).toDate(),
                                  to: moment(
                                    item?.Config?.to,
                                    "YYYY-MM-DD HH:mm"
                                  ).toDate(),
                                  MaxBook: item?.Config?.MaxBook || "",
                                },
                              }))
                            : [
                                {
                                  ID: "",
                                  Config: {
                                    from: "",
                                    to: "",
                                    MaxBook: "",
                                  },
                                },
                              ],
                        deletes: [],
                      });
                    }}
                    dateClick={({ resource }) => {
                      let Items = data?.filter(
                        (x) =>
                          moment(x.CreateDate, "YYYY-MM-DD HH:mm").format(
                            "DD-MM-YYYY"
                          ) ===
                          moment(
                            resource?._resource?.extendedProps?.date
                          ).format("DD-MM-YYYY")
                      );
                      open({
                        StockID: AuthCrStockID,
                        CreateDate: moment(
                          resource?._resource?.extendedProps?.date
                        ).toDate(),
                        arr:
                          Items && Items.length > 0
                            ? Items.map((item) => ({
                                ID: item?.ID,
                                Config: {
                                  from: moment(
                                    item?.Config?.from,
                                    "YYYY-MM-DD HH:mm"
                                  ).toDate(),
                                  to: moment(
                                    item?.Config?.to,
                                    "YYYY-MM-DD HH:mm"
                                  ).toDate(),
                                  MaxBook: item?.Config?.MaxBook || "",
                                },
                              }))
                            : [
                                {
                                  ID: "",
                                  Config: {
                                    from: "",
                                    to: "",
                                    MaxBook: "",
                                  },
                                },
                              ],
                        deletes: [],
                      });
                    }}
                    eventContent={(arg) => {
                      const { event, view } = arg;
                      const { extendedProps } = event._def;
                      let italicEl = document.createElement("div");
                      italicEl.classList.add("fc-content");

                      let AmountPeople = 1;
                      if (extendedProps.Desc) {
                        let descSplit = extendedProps.Desc.split("\n");
                        for (let i of descSplit) {
                          if (i.includes("Số lượng khách:")) {
                            let SL = Number(i.match(/\d+/)[0]);
                            AmountPeople = Number(SL);
                          }
                        }
                      }
                      if (
                        typeof extendedProps !== "object" ||
                        Object.keys(extendedProps).length > 0
                      ) {
                        if (view.type !== "listWeek") {
                          italicEl.innerHTML = `<div class="fc-title">
                                            
                                          <div class="d-flex justify-content-between"><div><span class="fullname">${
                                            AmountPeople > 1
                                              ? `[${AmountPeople}]`
                                              : ``
                                          } ${
                            extendedProps?.AtHome
                              ? `<i class="fas fa-home text-white font-size-xs"></i>`
                              : ""
                          } ${
                            extendedProps?.Star ? `(${extendedProps.Star})` : ""
                          } ${extendedProps?.MemberCurrent?.FullName ||
                            "Chưa xác định"}</span><span class="d-none d-md-inline"> - ${extendedProps
                            ?.MemberCurrent?.MobilePhone ||
                            "Chưa xác định"} - ${extendedProps.ID ||
                            extendedProps?.os
                              ?.ID}</span></div><span class="${(window?.top?.GlobalConfig?.Admin?.toi_uu_bang_lich || !extendedProps?.isBook) &&
                            "d-none"}">${extendedProps?.BookCount?.Done ||
                            0}/${extendedProps?.BookCount?.Total ||
                            0}</span></div>
                                          <div class="d-flex">
                                            <div class="w-35px">${moment(
                                              extendedProps?.BookDate
                                            ).format("HH:mm")} </div>
                                            <div class="flex-1 text-truncate pl-5px"> - ${
                                              extendedProps?.RootTitles
                                                ? extendedProps?.RootMinutes ??
                                                  extendedProps?.os
                                                    ?.RootMinutes ??
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
                            "Chưa xác định"} - ${
                            extendedProps.ID
                          }</span><span class="d-none d-md-inline"> - ${extendedProps
                            ?.MemberCurrent?.MobilePhone ||
                            "Chưa xác định"}</span><span> - ${
                            extendedProps?.RootTitles
                              ? extendedProps?.RootMinutes ??
                                extendedProps?.os?.RootMinutes ??
                                60
                              : 30
                          }p - ${extendedProps?.RootTitles ||
                            "Không xác định"}</span> <span class="${(window?.top?.GlobalConfig?.Admin?.toi_uu_bang_lich || !extendedProps?.isBook) &&
                            "d-none"}">- ${extendedProps?.BookCount?.Done ||
                            0}/${extendedProps?.BookCount?.Total ||
                            0}</span></div>
                                        </div>`;
                        }
                      } else {
                        italicEl.innerHTML = `<div class="fc-title"></div>`;
                      }
                      let arrayOfDomNodes = [italicEl];
                      return {
                        domNodes: arrayOfDomNodes,
                      };
                    }}
                    // dayHeaderDidMount={(arg) => {
                    //   const { view, el, isToday, date } = arg;
                    // }}
                    // eventDidMount={(arg) => {
                    //   const { view } = arg;
                    // }}
                    //datesSet={({ view, start, end }) => {}}
                    noEventsContent={() =>
                      isLoading ? <></> : "Không có dữ liệu"
                    }
                  />
                )}
              </PickerAddEditBookOnline>

              {(isLoading || isFetching) && (
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

export default PickerSettingBookOnline;
