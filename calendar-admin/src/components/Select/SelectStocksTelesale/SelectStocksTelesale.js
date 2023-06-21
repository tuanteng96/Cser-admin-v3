import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";

function SelectStocksTelesale({ value, ...props }) {
  const { tele, teleAdv, Stocks } = useSelector(({ Auth }) => ({
    tele: Auth?.rightsSum?.tele,
    teleAdv: Auth?.rightsSum?.teleAdv,
    Stocks: Auth?.Stocks
      ? Auth?.Stocks.filter((x) => x.ParentID !== 0).map((o) => ({
          ...o,
          value: o.ID,
          label: o.Title,
        }))
      : [],
  }));
  const [StocksList, setStocksList] = useState([]);

  useEffect(() => {
    let newStocks = [...Stocks];
    if (tele?.hasRight || teleAdv?.hasRight) {
      if (!tele?.IsAllStock) {
        newStocks = newStocks.filter(
          (o) => tele?.stocks && tele?.stocks.some((x) => o.ID === x.ID)
        );
      }
    } else {
      newStocks = [];
    }
    setStocksList(newStocks);
  }, [tele, teleAdv, Stocks]);

  return (
    <Select
      placeholder="Chọn cơ cở"
      classNamePrefix="select"
      options={StocksList || []}
      className="select-control mb-8px"
      value={
        StocksList &&
        StocksList.filter((item) => Number(value) === Number(item.value))
      }
      {...props}
    />
  );
}

export default SelectStocksTelesale;
