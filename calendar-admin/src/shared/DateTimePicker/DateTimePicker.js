import React from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "moment/locale/vi";
import clsx from "clsx";
import Portal from "react-overlays/cjs/Portal";
import vi from "date-fns/locale/vi";

moment.locale("vi");

const CalendarContainer = ({ children }) => {
  const el = document.getElementById("calendar-portal");

  return <Portal container={el}>{children}</Portal>;
};

function DateTimePicker(props) {
  return (
    <DatePicker
      locale={vi}
      className={clsx(
        "w-full px-3 py-3 transition bg-white border rounded outline-none disabled:bg-gray-200 disabled:border-gray-200 border-gray-300 dark:border-graydark-400 focus:border-primary dark:focus:border-primary"
      )}
      popperContainer={CalendarContainer}
      timeIntervals={5}
      {...props}
    />
  );
}

export default DateTimePicker;
