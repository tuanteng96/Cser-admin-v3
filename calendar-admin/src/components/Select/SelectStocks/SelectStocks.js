import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import PropTypes from "prop-types";

SelectStocks.propTypes = {
  allStock: PropTypes.bool,
};

SelectStocks.defaultProps = {
  allStock: true,
};

function SelectStocks({ value, allStock, ...props }) {
  const [StocksList, setStocksList] = useState([]);
  const {
    posHasRight,
    posIsAllStocks,
    posPermissionStocks,
    Stocks,
  } = useSelector(({ Auth }) => ({
    posHasRight: Auth?.rightsSum?.pos?.hasRight,
    posIsAllStocks: Auth?.rightsSum?.pos?.IsAllStock,
    posPermissionStocks: Auth?.rightsSum?.pos?.stocks,
    Stocks: Auth?.Stocks
      ? Auth?.Stocks.filter((x) => x.ParentID !== 0).map((o) => ({
          ...o,
          value: o.ID,
          label: o.Title,
        }))
      : [],
  }));

  useEffect(() => {
    setStocksList([]);
    let newStocks = [...Stocks];
    if (!posHasRight) {
      newStocks = [];
    } else {
      if (!posIsAllStocks) {
        newStocks = newStocks.filter(
          (o) =>
            posPermissionStocks &&
            posPermissionStocks.some((x) => o.ID === x.ID)
        );
      }
    }
    setStocksList(() =>
      newStocks
        .filter((o) => o.ID !== 778)
        .map((item) => ({
          ...item,
          label: item.Title || item.label,
          value: item.ID || item.value,
        }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posHasRight, posIsAllStocks, posPermissionStocks]);

  return (
    <Select
      placeholder="Chọn cơ cở"
      classNamePrefix="select"
      options={StocksList}
      className="select-control"
      value={StocksList.filter((item) => Number(value) === Number(item.value))}
      {...props}
    />
  );
}

export default SelectStocks;
