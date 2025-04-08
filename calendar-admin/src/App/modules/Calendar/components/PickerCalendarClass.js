import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import scrollGridPlugin from "@fullcalendar/scrollgrid";
import FullCalendar from "@fullcalendar/react";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import { useMutation, useQuery } from "react-query";
import CalendarCrud from "../_redux/CalendarCrud";
import interactionPlugin from "@fullcalendar/interaction";

import moment from "moment";
import vi from "date-fns/locale/vi";
import { Form, Formik } from "formik";
import Swal from "sweetalert2";
import PickerClassManage from "./PickerClassManage";
import PickerCalendarMemberReport from "./PickerCalendarMemberReport";

function PickerCalendarClass({ children, TimeOpen, TimeClose }) {
  const { AuthCrStockID } = useSelector(({ Auth }) => ({
    AuthCrStockID: Auth.CrStockID,
  }));

  const [visible, setVisible] = useState(false);

  const [filters, setFilters] = useState({
    CrDate: null,
  });

  useEffect(() => {
    if (!visible) {
      setFilters({ CrDate: new Date() });
    }
  }, [visible]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["CalendarClass", filters],
    queryFn: async () => {
      let data = await CalendarCrud.getCalendarClass({
        StockID: [AuthCrStockID],
        To: null,
        From: null,
        Pi: 1,
        Ps: 1000,
      });
      let { Items } = await CalendarCrud.getCalendarClassMembers({
        ClassIDs: [],
        TeachIDs: [],
        StockID: [AuthCrStockID],
        DateStart: null,
        DateEnd: null,
        BeginFrom: moment(filters.CrDate)
          .clone()
          .startOf("week")
          .set({
            hour: "00",
            minute: "00",
            second: "00",
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        BeginTo: moment(filters.CrDate)
          .clone()
          .endOf("week")
          .set({
            hour: "23",
            minute: "59",
            second: "59",
          })
          .format("YYYY-MM-DD HH:mm:ss"),
        Pi: 1,
        Ps: 1000,
      });
      let Resources = [];
      let Events = [];

      for (let clss of data.Items) {
        if (clss.TimeSlot && clss.TimeSlot.length > 0) {
          for (let day of clss.TimeSlot) {
            if (day.Items && day.Items.length > 0) {
              let Date =
                day.Index !== 0
                  ? moment(filters.CrDate, "e")
                      .startOf("week")
                      .isoWeekday(day.Index)
                      .format("YYYY-MM-DD")
                  : moment(filters.CrDate, "e")
                      .startOf("week")
                      .isoWeekday(day.Index)
                      .add(7, "day")
                      .format("YYYY-MM-DD");

              Resources.push({
                id: clss.ID + "-" + day.Index,
                //Day: day.Title.charAt(0).toUpperCase() + day.Title.slice(1),
                Day: Date,
                Class: clss.Title,
                Index: clss.Order
              });

              if (Date === moment().format("YYYY-MM-DD")) {
                let newObjDate = {
                  start: moment()
                    .set({
                      hour: "00",
                      minute: "00",
                      second: "00",
                    })
                    .toDate(),
                  end: moment()
                    .set({
                      hour: "23",
                      minute: "59",
                      second: "59",
                    })
                    .toDate(),
                  display: "background",
                  className: ["fc-event-active", "fc-event-active-day"],
                  resourceIds: [clss.ID + "-" + day.Index],
                };

                Events.push(newObjDate);
              }

              for (let item of day.Items) {
                let newObj = {
                  Class: clss,
                  Day: day,
                  TimeFrom: item.from,
                  DateFrom:
                    day.Index !== 0
                      ? moment(filters.CrDate, "e")
                          .startOf("week")
                          .isoWeekday(day.Index)
                          .toDate()
                      : moment(filters.CrDate, "e")
                          .startOf("week")
                          .isoWeekday(day.Index)
                          .add(7, "day")
                          .toDate(),
                  start: moment()
                    .set({
                      hour: moment(item.from, "HH:mm").get("hour"),
                      minute: moment(item.from, "HH:mm").get("minute"),
                      second: moment(item.from, "HH:mm").get("second"),
                    })
                    .toDate(),
                  end: moment()
                    .set({
                      hour: moment(item.from, "HH:mm").get("hour"),
                      minute: moment(item.from, "HH:mm").get("minute"),
                      second: moment(item.from, "HH:mm").get("second"),
                    })
                    .add(clss.Minutes, "minutes")
                    .toDate(),
                  className: `!bg-[#d0d0d0] h-[130px]`,
                  resourceIds: [clss.ID + "-" + day.Index],
                };

                let index =
                  Items &&
                  Items.findIndex((o) => {
                    return (
                      o.OrderServiceClassID === clss.ID &&
                      moment(o.TimeBegin, "YYYY-MM-DD HH:mm").day() ===
                        day.Index &&
                      moment(o.TimeBegin, "YYYY-MM-DD HH:mm").isBetween(
                        moment(newObj.DateFrom).set({
                          hour: moment(newObj.TimeFrom, "HH:mm").get("hour"),
                          minute: moment(newObj.TimeFrom, "HH:mm").get(
                            "minute"
                          ),
                          second: moment(newObj.TimeFrom, "HH:mm").get(
                            "second"
                          ),
                        }),
                        moment(newObj.DateFrom).set({
                          hour: moment(newObj.TimeFrom, "HH:mm").get("hour"),
                          minute: moment(newObj.TimeFrom, "HH:mm").get(
                            "minute"
                          ),
                          second: moment(newObj.TimeFrom, "HH:mm").get(
                            "second"
                          ),
                        }),
                        null,
                        "[]"
                      )
                    );
                  });
                if (index > -1) {
                  let { Member } = Items[index];
                  if (Member.Status) {
                    newObj.className = `!bg-[#8951fc] h-[130px]`;
                  } else if (
                    Member?.Lists &&
                    Member?.Lists?.length > 0 &&
                    Member?.Lists?.length === clss.MemberTotal
                  ) {
                    newObj.className = `!bg-danger h-[130px]`;
                    newObj.Status = 1;
                  } else {
                    newObj.className = `!bg-success h-[130px]`;
                  }
                  newObj.ClassInfo = Items[index];
                }
                Events.push(newObj);
              }
            }
          }
        }
      }

      return { Resources, Events };
    },
    enabled: visible && Boolean(filters.CrDate),
    keepPreviousData: true,
  });

  const addMutation = useMutation({
    mutationFn: async (body) => {
      let rs = await CalendarCrud.CalendarClassMembersAddEdit(body);
      await refetch();
      return rs;
    },
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
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-xl font-medium">Bảng lịch lớp học</div>
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
                  const { values, setFieldValue } = formikProps;

                  return (
                    <Form className="flex gap-3">
                      <div className="w-[180px]">
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
                      </button>
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
                      <PickerCalendarMemberReport>
                        {({ open }) => (
                          <button
                            onClick={open}
                            type="button"
                            className="rounded-[4px] px-4 text-[#3F4254] bg-[#D1D3E0]"
                          >
                            Thống kê
                          </button>
                        )}
                      </PickerCalendarMemberReport>

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
            <div className="relative p-4 grow [&>*]:h-full lg:h-[calc(100%-73px)]">
              <PickerClassManage
                TimeOpen={TimeOpen}
                TimeClose={TimeClose}
                AuthCrStockID={AuthCrStockID}
              >
                {({ open }) => (
                  <FullCalendar
                    resourceOrder={"-Index"}
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
                    resources={data?.Resources || []}
                    resourceAreaColumns={[
                      {
                        group: true,
                        field: "Day",
                        headerContent: "",
                        width: "40%",
                        cellClassNames: ({ fieldValue }) => {
                          return (
                            fieldValue === moment().format("YYYY-MM-DD") &&
                            "bg-[#fffdf4]"
                          );
                        },
                        cellContent: function(arg) {
                          let { fieldValue, groupValue } = arg;
                          return (
                            <div>
                              <div className="capitalize">
                                {moment(
                                  fieldValue || groupValue,
                                  "YYYY-MM-DD"
                                ).format("dddd")}
                              </div>
                              <div>
                                {moment(
                                  fieldValue || groupValue,
                                  "YYYY-MM-DD"
                                ).format("DD-MM-YYYY")}
                              </div>
                            </div>
                          );
                        },
                      },
                      {
                        field: "Class",
                        headerContent: "Lớp học",
                        width: "60%",
                        cellClassNames: ({ resource }) => {
                          return (
                            resource?._resource?.extendedProps?.Day ===
                              moment().format("YYYY-MM-DD") && "bg-[#fffdf4]"
                          );
                        },
                      },
                    ]}
                    views={{
                      resourceTimelineDay: {
                        type: "resourceTimelineDay",
                        nowIndicator: true,
                        now: moment(new Date()).format("YYYY-MM-DD HH:mm"),
                        scrollTime: moment(new Date()).format("HH:mm"),
                        resourceAreaWidth: "350px",
                        slotMinWidth: 100,
                        stickyHeaderDates: true,
                        slotMinTime: TimeOpen,
                        slotMaxTime: TimeClose,
                        //buttonText: "Phòng",
                        //resourceAreaHeaderContent: () => "Lớp học / Giờ",
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
                    events={data?.Events || []}
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
                      let { extendedProps } = event._def;
                      if (extendedProps?.ClassInfo) {
                        open(extendedProps);
                      } else {
                        Swal.fire({
                          icon: "warning",
                          title: "Xác nhận tạo lớp ?",
                          html: `Bạn có chắc chắn muốn khởi tạo lớp này ?`,
                          confirmButtonText: "Xác nhận",
                          cancelButtonText: "Đóng",
                          showCloseButton: true,
                          showCancelButton: true,
                          customClass: {
                            confirmButton: "btn btn-success",
                            //cancelButton: "btn btn-danger",
                          },
                          showLoaderOnConfirm: true,
                          preConfirm: () => {
                            return new Promise(async (resolve, reject) => {
                              let newObj = {
                                ID: 0,
                                StockID: extendedProps?.Class?.StockID,
                                TimeBegin: extendedProps?.DateFrom
                                  ? moment(extendedProps?.DateFrom)
                                      .set({
                                        hour: moment(
                                          extendedProps?.TimeFrom,
                                          "HH:mm"
                                        ).get("hour"),
                                        minute: moment(
                                          extendedProps?.TimeFrom,
                                          "HH:mm"
                                        ).get("minute"),
                                        second: moment(
                                          extendedProps?.TimeFrom,
                                          "HH:mm"
                                        ).get("second"),
                                      })
                                      .format("YYYY-MM-DD HH:mm:ss")
                                  : null,
                                OrderServiceClassID: extendedProps?.Class?.ID,
                                TeacherID: "",
                                Member: {
                                  Lists: [],
                                  Status: "",
                                },
                                MemberID: 0,
                                Desc: "",
                              };
                              let { Inserted } = await addMutation.mutateAsync({
                                arr: [newObj],
                              });

                              resolve(
                                Inserted && Inserted.length > 0
                                  ? Inserted[0]
                                  : null
                              );
                            });
                          },
                          allowOutsideClick: () => !Swal.isLoading(),
                        }).then((result) => {
                          if (result.isConfirmed) {
                            let newExtendedProps = { ...extendedProps };
                            if (result.value) {
                              newExtendedProps["ClassInfo"] = result.value;
                            }
                            open(newExtendedProps);
                          }
                        });
                      }
                    }}
                    // dateClick={({ resource }) => {
                    //   let Items = data?.filter(
                    //     (x) =>
                    //       moment(x.CreateDate, "YYYY-MM-DD HH:mm").format(
                    //         "DD-MM-YYYY"
                    //       ) ===
                    //       moment(
                    //         resource?._resource?.extendedProps?.date
                    //       ).format("DD-MM-YYYY")
                    //   );
                    //   open({
                    //     StockID: AuthCrStockID,
                    //     CreateDate: moment(
                    //       resource?._resource?.extendedProps?.date
                    //     ).toDate(),
                    //     arr:
                    //       Items && Items.length > 0
                    //         ? Items.map((item) => ({
                    //             ID: item?.ID,
                    //             Config: {
                    //               from: moment(
                    //                 item?.Config?.from,
                    //                 "YYYY-MM-DD HH:mm"
                    //               ).toDate(),
                    //               to: moment(
                    //                 item?.Config?.to,
                    //                 "YYYY-MM-DD HH:mm"
                    //               ).toDate(),
                    //               MaxBook: item?.Config?.MaxBook || "",
                    //             },
                    //           }))
                    //         : [
                    //             {
                    //               ID: "",
                    //               Config: {
                    //                 from: "",
                    //                 to: "",
                    //                 MaxBook: "",
                    //               },
                    //             },
                    //           ],
                    //     deletes: [],
                    //   });
                    // }}
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
                        italicEl.innerHTML = `<div class="text-white h-full text-center">
                          <div class="text-[13px] font-semibold uppercase line-clamp-1">${
                            extendedProps?.Class?.Title
                          }</div>
                          <div class="mb-1">${
                            extendedProps?.TimeFrom
                          } - ${moment()
                          .set({
                            hour: moment(extendedProps?.TimeFrom, "HH:mm").get(
                              "hour"
                            ),
                            minute: moment(
                              extendedProps?.TimeFrom,
                              "HH:mm"
                            ).get("minute"),
                            second: moment(
                              extendedProps?.TimeFrom,
                              "HH:mm"
                            ).get("second"),
                          })
                          .add(extendedProps?.Class?.Minutes, "minutes")
                          .format("HH:mm")}</div>
                          <div>Tổng số học viên : ${extendedProps?.ClassInfo
                            ?.Member?.Lists?.length || 0} / ${
                          extendedProps?.Class?.MemberTotal
                        }</div>
                          <div>HLV: ${extendedProps?.ClassInfo?.Teacher
                            ?.FullName || "Chưa có"}</div>
                          ${
                            extendedProps?.ClassInfo
                              ? `<div class="mt-2">Điểm danh đến: ${extendedProps?.ClassInfo?.Member?.Lists?.filter(
                                  (x) => x.Status === "DIEM_DANH_DEN"
                                ).length ||
                                  0} / Vắng : ${extendedProps?.ClassInfo?.Member?.Lists?.filter(
                                  (x) => x.Status === "DIEM_DANH_KHONG_DEN"
                                ).length || 0}</div>`
                              : ""
                          }
                          
                        </div>`;
                      } else {
                        italicEl.innerHTML = `<div class="fc-title"></div>`;
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
                  />
                )}
              </PickerClassManage>

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

export default PickerCalendarClass;
