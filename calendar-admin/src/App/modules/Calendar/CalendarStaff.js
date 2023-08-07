import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./../../../_assets/sass/pages/_calendar-staff.scss";
import { ScrollSync, ScrollSyncPane } from "react-scroll-sync";

import moment from "moment";
import "moment/locale/vi";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useSelector } from "react-redux";
moment.locale("vi");

CalendarStaff.propTypes = {
  height: PropTypes.number,
};

var minWidthCell = 220;
var minWidthCellMobile = 135;
var minHeightHeader = 40;

const lineTimeArray = (TimeOpen, TimeClose, TimeCurrent) => {
  const [hourOpen, minuteOpen, secondsOpen] = TimeOpen.split(":");
  const [hourClose, minuteClose, secondsClose] = TimeClose.split(":");

  var now = moment(TimeCurrent);
  var timeStart = now
    .set({
      hour: hourOpen,
      minute: minuteOpen,
      second: secondsOpen,
    })
    .toString();
  var timeEnd = now
    .set({
      hour: hourClose,
      minute: minuteClose,
      second: secondsClose,
    })
    .toString();
  const newArr = [
    {
      Time: timeStart,
      TimeEvent: [
        { Time: timeStart },
        {
          Time: moment(timeStart)
            .add(30, "minutes")
            .toDate(),
        },
      ],
    },
  ];

  while (
    moment(newArr[newArr.length - 1].Time).diff(timeEnd, "minutes") < -60
  ) {
    let newTime = moment(newArr[newArr.length - 1].Time)
      .add(60, "minutes")
      .toDate();
    newArr.push({
      Time: newTime,
      TimeEvent: [
        { Time: newTime },
        {
          Time: moment(newTime)
            .add(30, "minutes")
            .toDate(),
        },
      ],
    });
  }
  return {
    lineTime: newArr,
    timeStart,
    timeEnd,
  };
};

function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.overflow = "scroll"; // forcing scrollbar to appear
  outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
  document.body.appendChild(outer);

  // Creating inner element and placing it in the container
  const inner = document.createElement("div");
  outer.appendChild(inner);

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer);

  return scrollbarWidth;
}

const getTimeMax = (arr, TimeClose) => {
  if (!arr || arr.length === 0) return TimeClose;
  let NewTimeClose = "";
  const newArray = arr && arr.map((item) => moment(item.end));
  NewTimeClose = moment.max(newArray);
  const TimeCloseCr = moment(TimeClose, "HH:mm:ss");
  const TimeCloseMx = moment(
    moment(NewTimeClose).format("HH:mm:ss"),
    "HH:mm:ss"
  );
  const isTimeMax =
    TimeCloseCr.isBefore(TimeCloseMx) &&
    TimeCloseMx.isBefore(moment("23:59:59", "HH:mm:ss"));
  if (!isTimeMax) return TimeClose;
  const Remainder = 59 - (NewTimeClose.minute() % 59);
  return moment(NewTimeClose)
    .add(Remainder, "minutes")
    .format("HH:mm:ss");
};

const getTimeMin = (arr, TimeOpen) => {
  if (!arr || arr.length === 0) return TimeOpen;
  let NewTimeOpen = "";
  const newArray = arr && arr.map((item) => moment(item.start));
  NewTimeOpen = moment.min(newArray);
  const TimeOpenCr = moment(TimeOpen, "HH:mm:ss");
  const TimeOpenMin = moment(
    moment(NewTimeOpen).format("HH:mm:ss"),
    "HH:mm:ss"
  );
  const isTimeMin =
    TimeOpenMin.isBefore(TimeOpenCr) &&
    moment("00:00:00", "HH:mm:ss").isBefore(TimeOpenMin);
  if (!isTimeMin) return TimeOpen;
  const Remainder = NewTimeOpen.minute();
  return moment(NewTimeOpen)
    .subtract(Remainder, "minutes")
    .format("HH:mm:ss");
};

function CalendarStaff({
  loading,
  height,
  resources,
  events,
  dateClick,
  eventClick,
  StaffOffline,
  filters,
}) {
  const { TimeOpen, TimeClose } = useSelector(({ JsonConfig }) => ({
    TimeOpen: JsonConfig?.APP?.Working?.TimeOpen || "00:00:00",
    TimeClose: JsonConfig?.APP?.Working?.TimeClose || "23:59:00",
  }));
  const { lineTime, timeStart, timeEnd } = lineTimeArray(TimeOpen, TimeClose);
  const [newResources, setNewResources] = useState(resources);
  const [ConfigTime, setConfigTime] = useState({
    lineTime,
    timeStart,
    timeEnd,
  });
  const { width } = useWindowSize();

  useEffect(() => {
    setNewResources(() =>
      resources.map((item) => ({
        ...item,
        Services: events.filter(
          (event) =>
            (event.staffs && event.staffs.some((o) => o.ID === item.id)) ||
            (event.UserServices &&
              event.UserServices.some((o) => o.ID === item.id)) ||
            (item.id === 0 && event.resourceIds.includes(item.id))
        ),
      }))
    );
  }, [events, resources]);

  useEffect(() => {
    const {
      lineTime: lineTimeUpdate,
      timeStart: timeStartUpdate,
      timeEnd: timeEndUpdate,
    } = lineTimeArray(
      getTimeMin(events, TimeOpen),
      getTimeMax(events, TimeClose),
      filters.From
    );

    setConfigTime({
      lineTime: lineTimeUpdate,
      timeStart: timeStartUpdate,
      timeEnd: timeEndUpdate,
    });
  }, [filters, TimeOpen, TimeClose, events]);

  const getStyleEvent = (service) => {
    const { serviceStart, serviceEnd } = {
      serviceStart: service.start,
      serviceEnd: service.end,
    };
    const { timeStartDay, timeEndDay } = {
      timeStartDay: ConfigTime.timeStart,
      timeEndDay: ConfigTime.timeEnd,
    };

    var TotalSeconds = moment(timeEndDay).diff(moment(timeStartDay), "seconds");

    const TotalTimeStart = moment(serviceStart).diff(
      moment(timeStartDay),
      "seconds"
    ); // Số phút từ 00 => Thời gian bắt đầu dịch vụ

    const TotalTimeService = moment(serviceEnd).diff(
      moment(serviceStart),
      "seconds"
    );

    const minTimeService =
      TotalTimeService > 60 * 60 ? TotalTimeService : 60 * 60;

    const styles = {
      top: `${(TotalTimeStart / TotalSeconds) * 100}%`,
      height: `${(minTimeService / TotalSeconds) * 100}%`,
    };
    return styles;
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

  const RenderStaffOff = ({ id }) => {
    const ListOffCurrent = StaffOffline.filter((item) => item.UserID === id);
    if (ListOffCurrent.length === 0) {
      return "";
    }
    return ListOffCurrent.map((item, index) => (
      <div
        className="w-100 bg-stripes zindex-9 cursor-no-drop position-absolute left-0"
        style={getStyleOff(item)}
        key={index}
      ></div>
    ));
  };

  const getStyleOff = ({ From, To }) => {
    const { timeStartDay, timeEndDay } = {
      timeStartDay: ConfigTime.timeStart,
      timeEndDay: ConfigTime.timeEnd,
    };
    let newFrom = "";
    let newTo = "";
    newFrom =
      moment(timeStartDay).diff(From) > 0 &&
      moment(timeStartDay).format("DD-MM-YYYY") !==
        moment(From).format("DD-MM-YYYY")
        ? timeStartDay
        : From;
    newTo = moment(timeEndDay).diff(To) < 0 ? timeEndDay : To;
    var TotalSeconds = moment(timeEndDay).diff(moment(timeStartDay), "seconds");
    const TotalTimeStart = moment(newFrom).diff(
      moment(timeStartDay),
      "seconds"
    ); // Số phút từ 00 => Thời gian bắt đầu dịch vụ
    const TotalTimeOff = moment(newTo).diff(moment(newFrom), "seconds");
    const styles = {
      top: `${(TotalTimeStart / TotalSeconds) * 100}%`,
      height: `${(TotalTimeOff / TotalSeconds) * 100}%`,
    };
    return styles;
  };

  const getStyleErrorTop = () => {
    const styles = {};
    var TotalSeconds = moment(ConfigTime.timeEnd).diff(
      moment(ConfigTime.timeStart),
      "seconds"
    );
    const TimeOpenCr = moment(TimeOpen, "HH:mm:ss");
    const timeOpenFm = moment(
      moment(ConfigTime.timeStart).format("HH:mm:ss"),
      "HH:mm:ss"
    );
    const TotalTime = TimeOpenCr.diff(timeOpenFm, "seconds");
    if (TotalTime > 0) {
      styles.width = "100%";
      styles.height = `${(TotalTime / TotalSeconds) * 100}%`;
      styles.top = 0;
      styles.position = "absolute";
    } else {
      styles.display = "none";
    }
    return styles;
  };

  const getStyleErrorBottom = () => {
    const styles = {};
    var TotalSeconds = moment(ConfigTime.timeEnd).diff(
      moment(ConfigTime.timeStart),
      "seconds"
    );
    const TimeCloseCr = moment(TimeClose, "HH:mm:ss");
    const timeEndFm = moment(
      moment(ConfigTime.timeEnd).format("HH:mm:ss"),
      "HH:mm:ss"
    );
    const TotalTime = timeEndFm.diff(TimeCloseCr, "seconds");
    if (TotalTime > 0) {
      styles.width = "100%";
      styles.height = `${(TotalTime / TotalSeconds) * 100}%`;
      styles.bottom = 0;
      styles.position = "absolute";
    } else {
      styles.display = "none";
    }
    return styles;
  };

  const getStyleTimeCurrent = () => {
    const styles = {};
    var TotalSeconds = moment(ConfigTime.timeEnd).diff(
      moment(ConfigTime.timeStart),
      "seconds"
    );
    const TotalTime = moment().diff(moment(ConfigTime.timeStart), "seconds");
    styles.top = `${(TotalTime / TotalSeconds) * 100}%`;
    if (
      moment().format("DD-MM-YYYY") !==
        moment(filters.From).format("DD-MM-YYYY") ||
      (TotalTime / TotalSeconds) * 100 > 100
    ) {
      styles.display = "none";
    }
    return styles;
  };

  return (
    <ScrollSync>
      <div
        style={{ height: `${height}px` }}
        className="flex-grow-1 calendar-staff d-flex"
      >
        <div className="calendar-staff-time">
          <div className="time-header border-bottom">
            <span>GMT+07</span>
          </div>
          <ScrollSyncPane>
            <div
              className="time-body"
              style={{
                height: `calc(100% - ${getScrollbarWidth()}px - ${minHeightHeader}px)`,
              }}
            >
              <div className="position-relative d-flex flex-column min-h-100">
                {ConfigTime.lineTime &&
                  ConfigTime.lineTime.map((item, index) => (
                    <div
                      className={`line-body ${
                        ConfigTime.lineTime.length - 1 !== index
                          ? "border-bottom"
                          : ""
                      }`}
                      key={index}
                    >
                      <span className="font-size-min gird-time font-number">
                        {moment(item.Time).format("HH A")}
                      </span>
                      {item.TimeEvent.map((o, i) => (
                        <div className="line-item" key={i}></div>
                      ))}
                    </div>
                  ))}
                <div
                  className="timegrid-now-indicator-arrow position-absolute w-100 left-0"
                  style={getStyleTimeCurrent()}
                ></div>
              </div>
            </div>
          </ScrollSyncPane>
        </div>
        <div className="calendar-staff-content">
          <ScrollSyncPane>
            <div
              className="staff-header border-bottom"
              style={{ width: `calc(100% - ${getScrollbarWidth()}px)` }}
            >
              {resources &&
                resources.map((item, index) => (
                  <div className="staff-resources" key={index}>
                    <div className="name">{item.title}</div>
                  </div>
                ))}
            </div>
          </ScrollSyncPane>
          <ScrollSyncPane>
            <div className="staff-body">
              <div
                className="d-flex min-h-100 position-relative"
                style={{
                  minWidth: `${newResources.length *
                    (width > 767 ? minWidthCell : minWidthCellMobile)}px`,
                }}
              >
                {newResources &&
                  newResources.map((staff, index) => (
                    <div className="staff-slot" key={index}>
                      {ConfigTime.lineTime &&
                        ConfigTime.lineTime.map((item, idx) => (
                          <div
                            className={`staff-label ${
                              ConfigTime.lineTime.length - 1 === idx
                                ? "border-bottom-0"
                                : ""
                            }`}
                            key={idx}
                          >
                            {item.TimeEvent.map((o, i) => (
                              <div
                                className="staff-line"
                                onClick={() => {
                                  dateClick({
                                    BookDate: o.Time,
                                    UserServiceIDs: [
                                      {
                                        label: staff.title,
                                        value: staff.id,
                                      },
                                    ],
                                  });
                                }}
                                key={i}
                              ></div>
                            ))}
                          </div>
                        ))}
                      {staff.Services &&
                        staff.Services.map((service, x) => (
                          <div
                            className={`fc-event zindex-11`}
                            style={getStyleEvent(service)}
                            key={x}
                            onClick={() => eventClick(service)}
                          >
                            <div
                              className={`fc-bg bg-${getStatusClss(
                                service?.Status || service?.os?.Status,
                                service
                              )}`}
                            >
                              <div className="d-flex justify-content-between">
                                <div>
                                  <span className="fullname">
                                    {service.AtHome ? (
                                      <i className="fas fa-home text-white font-size-xs"></i>
                                    ) : (
                                      ""
                                    )}{" "}
                                    {service.Star ? `(${service.Star})` : ""}
                                    {service.MemberCurrent.FullName}
                                  </span>
                                  <span className="d-none d-md-inline">
                                    {" "}
                                    - {service.MemberCurrent?.MobilePhone}
                                  </span>
                                </div>
                                {service?.isBook && (
                                  <div>
                                    {service?.BookCount?.Done || 0}/
                                    {service?.BookCount?.Total || 0}
                                  </div>
                                )}
                              </div>
                              <div className="d-flex">
                                <div className="w-35px">
                                  {moment(service.BookDate).format("HH:mm")}{" "}
                                </div>
                                <div className="flex-1 text-truncate">
                                  -{" "}
                                  {service.RootTitles
                                    ? service.RootMinutes ??
                                      service?.os?.RootMinutes ??
                                      60
                                    : 30}
                                  p - {service.RootTitles || "Không xác định"}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      {/* Danh sách giờ nghỉ */}
                      {RenderStaffOff(staff)}
                      {/* Danh sách giờ nghỉ */}

                      {/* Giờ phát sinh */}
                      <div
                        className="error-time-work bg-stripes bg-stripes-danger zindex-10"
                        style={getStyleErrorTop()}
                      ></div>
                      <div
                        className="error-time-work bg-stripes bg-stripes-danger zindex-10"
                        style={getStyleErrorBottom()}
                      ></div>
                      {/* Giờ phát sinh */}
                    </div>
                  ))}
                {/* Giờ hiện tại */}
                <div
                  className="timegrid-now-indicator-line border-top border-danger position-absolute w-100 left-0"
                  style={getStyleTimeCurrent()}
                ></div>
                {/* Giờ hiện tại */}
              </div>
            </div>
          </ScrollSyncPane>
        </div>
        <div
          className={`overlay-layer bg-dark-o-10 ${
            loading ? "overlay-block" : ""
          }`}
        >
          <div className="spinner spinner-primary"></div>
        </div>
      </div>
    </ScrollSync>
  );
}

export default CalendarStaff;
