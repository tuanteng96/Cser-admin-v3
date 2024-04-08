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
        "w-full px-3 h-[40px] transition border-[1px] rounded-sm outline-none border-[#f3f6f9] bg-[#f3f6f9] font-medium focus:bg-[#EBEDF3]"
      )}
      popperContainer={CalendarContainer}
      timeIntervals={5}
      {...props}
    />
  );
}

export default DateTimePicker;
