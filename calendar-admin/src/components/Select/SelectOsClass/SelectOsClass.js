import React from "react";
import Select from "react-select";
import CalendarCrud from "../../../App/modules/Calendar/_redux/CalendarCrud";
import { useQuery } from "react-query";

function SelectOsClass({ enabled = true, StockID = "", ...props }) {
  const { isLoading, data } = useQuery({
    queryKey: ["OsClass", StockID],
    queryFn: async () => {
      let data = await CalendarCrud.getCalendarClass({
        StockID: StockID,
        To: null,
        From: null,
        Pi: 1,
        Ps: 1000,
      });

      return data?.Items
        ? data?.Items.map((x) => ({
            label: x.Title,
            value: x.ID,
          }))
        : [];
    },
    enabled: enabled,
  });

  return (
    <Select
      isLoading={isLoading}
      isDisabled={isLoading}
      classNamePrefix="select"
      options={data || []}
      noOptionsMessage={() => "Không có lớp"}
      {...props}
    />
  );
}

export default SelectOsClass;
