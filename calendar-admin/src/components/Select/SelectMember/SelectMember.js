import React from "react";
import { useSelector } from "react-redux";
import AsyncSelect from "react-select/async";
import CalendarCrud from "../../../App/modules/Calendar/_redux/CalendarCrud";
import { toUrlServer } from "../../../helpers/AssetsHelpers";

function SelectMember({ removeMembers, ...props }) {
  const { AuthCrStockID } = useSelector(({ Auth }) => ({
    AuthCrStockID: Auth.CrStockID,
  }));
  const loadOptions = (inputValue) =>
    new Promise(async (resolve, reject) => {
      const { data } = await CalendarCrud.getMembers(inputValue, AuthCrStockID);
      
      const result = data
        .map((item) => ({
          value: item.id,
          label: item.text,
          phone: item.suffix,
          Thumbnail: toUrlServer("/images/user.png"),
        }))
        .filter((x) =>
          removeMembers && removeMembers.length > 0
            ? !removeMembers.includes(x.value)
            : true
        );
      resolve(result);
    });
  return (
    <AsyncSelect
      key={JSON.stringify(removeMembers)}
      cacheOptions
      loadOptions={loadOptions}
      defaultOptions
      {...props}
    />
  );
}

export default SelectMember;
