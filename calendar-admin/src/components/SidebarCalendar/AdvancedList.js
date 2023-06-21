import React from "react";
import { useState } from "react";
import Select, { components } from "react-select";

const StatusMembers = [
  {
    value: "KHACH_CU",
    label: "Khách cũ",
  },
  {
    value: "KHACH_VANG_LAI_CO_TK",
    label: "Khách vãng lai ( Có tài khoản )",
  },
  {
    value: "KHACH_MOI",
    label: "Khách vãng lai ( Khách mới )",
  },
];

const StatusBooks = [
  {
    value: "DA_CHON",
    label: "Đã chọn nhân viên",
  },
  {
    value: "CHUA_CHON",
    label: "Chưa chọn nhân viên",
  },
];

const StatusAtHome = [
  {
    value: "TAI_NHA",
    label: "Tại nhà",
  },
  {
    value: "TAI_SPA",
    label: "Tại Spa",
  },
];

const Control = ({ children, ...props }) => {
  // @ts-ignore
  const { classIcon } = props.selectProps;

  return (
    <components.Control {...props}>
      <i
        className={classIcon}
        style={{ fontSize: "15px", color: "#5f6368", padding: "0 0 0 10px" }}
      ></i>
      {children}
    </components.Control>
  );
};

function AdvancedList({ formikProps }) {
  const { values, setFieldValue } = formikProps;
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="form-group form-group-ezs mb-0">
      {isOpen && (
        <div className="pb-8px">
          <Select
            classIcon="far fa-user-check"
            className="select-control mb-8px"
            classNamePrefix="select"
            isLoading={false}
            isClearable
            isSearchable
            //menuIsOpen={true}
            name="StatusMember"
            placeholder="Loại khách hàng"
            options={StatusMembers}
            value={values.StatusMember}
            onChange={(option) => setFieldValue("StatusMember", option, false)}
            components={{
              Control,
            }}
          />
          <Select
            classIcon="far fa-filter"
            className="select-control mb-8px"
            classNamePrefix="select"
            isLoading={false}
            isClearable
            isSearchable
            //menuIsOpen={true}
            name="StatusBook"
            placeholder="Loại nhân viên"
            options={StatusBooks}
            value={values.StatusBook}
            onChange={(option) => setFieldValue("StatusBook", option, false)}
            components={{
              Control,
            }}
          />
          <Select
            classIcon="far fa-ballot-check"
            className="select-control"
            classNamePrefix="select"
            isLoading={false}
            isClearable
            isSearchable
            //menuIsOpen={true}
            name="StatusAtHome"
            placeholder="Loại thực hiện"
            options={StatusAtHome}
            value={values.StatusAtHome}
            onChange={(option) => setFieldValue("StatusAtHome", option, false)}
            components={{
              Control,
            }}
          />
        </div>
      )}
      <label
        className="form-group-action mb-0 font-size-minn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Đóng xem thêm" : "Xem thêm ..."}
      </label>
    </div>
  );
}

export default AdvancedList;
