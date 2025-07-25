import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { isArray } from "lodash";
import { useSelector } from "react-redux";
import Select from "react-select";
import CalendarCrud from "../../../App/modules/Calendar/_redux/CalendarCrud";
import { toUrlServer } from "../../../helpers/AssetsHelpers";

SelectStaffsService.propTypes = {
  onChange: PropTypes.func,
};

const CustomOptionStaff = ({ children, components, ...props }) => {
  const { Thumbnail, label } = props.data;
  return (
    <components.Option {...props}>
      <div className="d-flex align-items-center">
        {Thumbnail && (
          <div className="overflow-hidden w-20px h-20px mr-8px rounded-circle d-flex align-items-center justify-content-center">
            <img className="w-100" src={Thumbnail} alt={label} />
          </div>
        )}

        {children}
      </div>
    </components.Option>
  );
};

function SelectStaffsService({
  onChange,
  value,
  isLoading,
  adv,
  StockID = "",
  ...props
}) {
  const { posHasRight, posIsAllStocks, posPermissionStocks } = useSelector(
    ({ Auth }) => ({
      posHasRight: Auth?.rightsSum?.pos?.hasRight,
      posIsAllStocks: Auth?.rightsSum?.pos?.IsAllStock,
      posPermissionStocks: Auth?.rightsSum?.pos?.stocks,
    })
  );

  const [loading, setLoading] = useState(false);
  const [ListOption, setListOption] = useState([]);

  useEffect(() => {
    getAllStaffs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllStaffs = async () => {
    setLoading(true);
    const { data } = await CalendarCrud.getStaffs({
      All: true,
      StockID: StockID,
      key: "",
    });
    const { Items } = {
      Items: data || [],
    };
    let newData = [];
    if (posHasRight && Items && isArray(Items)) {
      for (let key of Items) {
        const { group, groupid, text, id } = key;
        const index = newData.findIndex((item) => item.groupid === groupid);
        if (index > -1) {
          newData[index].options.push({
            label: text,
            value: id,
            ...key,
            Thumbnail: toUrlServer("/images/user.png"),
          });
        } else {
          const newItem = {};
          newItem.label = group;
          newItem.groupid = groupid;
          newItem.options = [
            {
              label: text,
              value: id,
              ...key,
              Thumbnail: toUrlServer("/images/user.png"),
            },
          ];
          newData.push(newItem);
        }
      }

      if (!posIsAllStocks) {
        newData = newData.filter(
          (o) =>
            posPermissionStocks &&
            posPermissionStocks.some((x) => x.ID === o.groupid)
        );
      }
    }
    setLoading(false);
    setListOption(newData.map((item) => ({
      ...item, 
      options: item?.options ? item?.options.sort((a,b) => a?.source?.Order - b?.source?.Order) : []
    })));
  };

  return (
    <Select
      isLoading={isLoading || loading}
      classNamePrefix="select"
      options={ListOption}
      placeholder="Chọn nhân viên"
      value={value}
      onChange={onChange}
      noOptionsMessage={({ inputValue }) => "Không có nhân viên"}
      components={{
        Option: CustomOptionStaff,
      }}
      {...props}
    />
  );
}

export default SelectStaffsService;
