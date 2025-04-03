import React from "react";
import AsyncSelect from "react-select/async";
import CalendarCrud from "../../../App/modules/Calendar/_redux/CalendarCrud";

function SelectProdServiceCard(props) {
  
  const loadOptions = (inputValue) =>
    new Promise(async (resolve, reject) => {
      const { data } = await CalendarCrud.getCardServices({ Key: inputValue });
      const result = data.map((item) => ({
        value: item.id,
        label: item.text,
      }));
      resolve(result);
    });
  return (
    <AsyncSelect
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      {...props}
    />
  );
}

export default SelectProdServiceCard;
