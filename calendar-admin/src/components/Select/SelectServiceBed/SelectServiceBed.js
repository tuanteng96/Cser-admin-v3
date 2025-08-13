import CalendarCrud from "../../../App/modules/Calendar/_redux/CalendarCrud";
import { AsyncPaginate } from "react-select-async-paginate";

function SelectServiceBed({ StockID = "", classWrap, ...props }) {
  const loadOptionsRooms = async (search) => {
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

    return {
      options: newValues.map((item) => ({
        ...item,
        options: item?.options
          ? item?.options
              .filter((option) =>
                option.label.toLowerCase().includes(search.toLowerCase())
              )
              .sort((a, b) => a?.source?.Order - b?.source?.Order)
          : [],
      })),
      hasMore: false,
    };
  };

  if (!window?.top?.GlobalConfig?.Admin?.isRooms) return <></>;

  return (
    <div className={classWrap}>
      <AsyncPaginate
        debounceTimeout={500}
        key={StockID}
        loadOptions={(v) => loadOptionsRooms(v, StockID)}
        cacheOptions
        classNamePrefix="select"
        noOptionsMessage={() => "Không có dữ liệu"}
        {...props}
      />
    </div>
  );
}

export default SelectServiceBed;
