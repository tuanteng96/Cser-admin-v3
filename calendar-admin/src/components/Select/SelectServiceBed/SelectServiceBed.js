import React from "react";
import Select from "react-select";
import CalendarCrud from "../../../App/modules/Calendar/_redux/CalendarCrud";
import { useQuery } from "react-query";

function SelectServiceBed({ StockID = "", classWrap, ...props }) {
  
  const { isLoading, data } = useQuery({
    queryKey: ["SelectServiceBed", StockID],
    queryFn: async () => {
      let { data } = await CalendarCrud.getConfigName(`room`);
      const result = data && data[0].Value ? JSON.parse(data[0].Value) : [];

      let newValues = [];

      if (StockID) {
        let index =
          result &&
          result.findIndex((x) => Number(x.StockID) === Number(StockID));

        if (
          index > -1 &&
          result[index].ListRooms &&
          result[index].ListRooms.length > 0
        ) {
          newValues = result[index].ListRooms.map((x) => ({
            label: x.label,
            groupid: x.ID,
            options:
              x.Children && x.Children.length > 0
                ? x.Children.map((o) => ({
                    ID: o.ID,
                    label: o.label,
                    value: o.ID,
                  }))
                : [],
          }));
        }
      }
      return newValues || [];
    },
  });

  if (!window?.top?.GlobalConfig?.Admin?.isRooms || !data || data.length === 0)
    return <></>;

  return (
    <div className={classWrap}>
      <Select
        key={StockID}
        isLoading={isLoading}
        isDisabled={isLoading}
        classNamePrefix="select"
        options={data || []}
        noOptionsMessage={() => "Không có lớp"}
        {...props}
      />
    </div>
  );
}

export default SelectServiceBed;
