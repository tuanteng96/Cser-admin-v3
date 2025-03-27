import React, { useState } from "react";
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

function PickerSettingBookOnline({ children, TimeOpen, TimeClose }) {
  const { AuthCrStockID } = useSelector(({ Auth }) => ({
    AuthCrStockID: Auth.CrStockID,
  }));

  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState({
    CrDate: new Date(),
    StockID: AuthCrStockID,
  });

  const { data, isLoading } = useQuery({
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
      let data = await CalendarCrud.getBooking({
        From: moment(filters.CrDate).format("YYYY-MM-DD"),
        To: moment(filters.CrDate).format("YYYY-MM-DD"),
        MemberID: "",
        StockID: AuthCrStockID,
        Status: "XAC_NHAN,CHUA_XAC_NHAN",
        UserServiceIDs: "",
        StatusMember: "",
        StatusBook: "",
        StatusAtHome: "",
        Tags: "",
      });

      let Lists = [
        // {
        //   start: "2025-03-27T10:00:00",
        //   end: "2025-03-27T16:00:00",
        //   resourceIds: [1],
        //   display: "inverse-background",
        //   extendedProps: {
        //     noEvent: true,
        //   },
        //   className: ["bg-danger"],
        // },
      ];

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
      return {
        resources: Array.from({ length: MaxBook }, (_, i) => ({
          id: i + 1,
          title: i + 1,
        })).concat([{ id: 0, title: "no" }]),
        Lists,
      };
    },
    enabled: visible,
    keepPreviousData: true,
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
                <div className="h-11 w-[1px] bg-gray-300 ml-4 mr-2"></div>
                <div
                  className="cursor-pointer h-11 flex items-center justify-center w-12"
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
            <div className="relative p-4 grow [&>*]:h-full">
              {console.log(data?.Lists)}
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
                    //ref={calendarRef}
                    themeSystem="unthemed"
                    //locale={viLocales}
                    initialDate={new Date()}
                    initialView="resourceTimelineDay"
                    schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
                    aspectRatio="3"
                    editable={false}
                    navLinks={true}
                    allDaySlot={false}
                    resources={data?.resources || []}
                    resourceOrder={null}
                    views={{
                      resourceTimelineDay: {
                        type: "resourceTimelineDay",
                        nowIndicator: true,
                        now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                        scrollTime: moment(new Date()).format("HH:mm"),
                        resourceAreaWidth: "80px",
                        slotMinWidth: 50,
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
                      const { event } = arg;
                      const { extendedProps } = event._def;

                      let italicEl = document.createElement("div");
                      italicEl.classList.add("fc-content");
                      let arrayOfDomNodes = [italicEl];
                      if (
                        typeof extendedProps !== "object" ||
                        Object.keys(extendedProps).length > 0
                      ) {
                        italicEl.innerHTML = `<div class="w-full h-full flex items-center justify-center">${extendedProps?.Config?.MaxBook}</div>`;
                      } else {
                        italicEl.innerHTML = ``;
                      }
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

export default PickerSettingBookOnline;
