import React, { useState } from "react";
import Select from "react-select";

const getListType = () => {
  const data = [];
  for (let i = 1; i <= 10; i++) {
    data.push({
      label: "Loại " + i,
      value: i,
    });
  }
  return data;
};

function SelectType(props) {
  const [TypeList] = useState(getListType());
  if (!window.top?.GlobalConfig?.Admin?.thuong_ds_theo_loai) return <></>;
  return (
    <Select
      classNamePrefix="select"
      className={`select-control ml-10px w-150px`}
      options={TypeList}
      placeholder="Chọn loại"
      noOptionsMessage={() => "Không có lựa chọn"}
      isSearchable
      isClearable
      menuPosition="fixed"
      {...props}
    />
  );
}

export default SelectType;
