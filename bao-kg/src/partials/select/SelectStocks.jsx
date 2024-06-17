import { useEffect, useState } from "react";
import Select from "react-select";

const SelectStocks = ({ value, ...props }) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  useEffect(() => {
    function getStocks(callback) {
      if (window.top?.Info) {
        callback && callback(window.top?.Info);
      } else {
        setTimeout(() => {
          getStocks(callback && callback);
        }, 50);
      }
    }
    getStocks((rs) => {
      if (rs.StockRights && rs.StockRights.length > 0) {
        setOptions(
          rs.StockRights.map((x) => ({
            ...x,
            value: x.ID,
            label: x.Title,
          }))
        );
        setLoading(false);
      }
    });
  }, []);

  return (
    <>
      <Select
        value={value ? options.filter(x => Number(x.value) === Number(value)) : ""}
        isDisabled={loading}
        isLoading={loading}
        options={options}
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({
            ...base,
            zIndex: 9999,
          }),
        }}
        menuPortalTarget={document.body}
        classNamePrefix="select"
        additional={{
          page: 1,
        }}
        placeholder="Chọn cơ sở"
        noOptionsMessage={() => "Không có cơ sở"}
        {...props}
      />
    </>
  );
};

export { SelectStocks };
