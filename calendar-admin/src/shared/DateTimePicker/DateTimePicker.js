import React from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import moment from "moment";
import "moment/locale/vi";
moment.locale("vi");

DateTimePicker.propTypes = {
  placeholderText: PropTypes.string,
  headerFormat: PropTypes.string,
};
DateTimePicker.defaultProps = {
  placeholderText: "",
  headerFormat: "hh:mm DD/MM/YYYY",
};

function DateTimePicker({
  className,
  selected,
  headerFormat,
  placeholderText,
  onChange,
  ...props
}) {
  return (
    <DatePicker
      {...props}
      className={className}
      selected={selected}
      headerFormat={headerFormat}
      onChange={(date) => onChange(date)}
      placeholderText={placeholderText}
    />
  );
}

export default DateTimePicker;
