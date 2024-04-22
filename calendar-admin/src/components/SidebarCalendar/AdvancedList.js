import React from "react";
import { useState } from "react";
import Select, { components } from "react-select";
import SelectStaffsService from "../Select/SelectStaffsService/SelectStaffsService";
import SelectMember from "../Select/SelectMember/SelectMember";

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

const CustomOptionStaff = ({ children, ...props }) => {
  const { Thumbnail, label } = props.data;
  return (
    <components.Option {...props}>
      <div className="d-flex align-items-center">
        <div className="w-20px h-20px mr-2 rounded-circle overflow-hidden d-flex align-items-center justify-content-center">
          <img className="w-100" src={Thumbnail} alt={label} />
        </div>
        {children}
      </div>
    </components.Option>
  );
};

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

function AdvancedList({ formikProps, TagsList }) {
  const { values, setFieldValue } = formikProps;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="d-flex border-[1px] rounded-sm !border-[#D1D3E0]">
        <SelectMember
          classIcon="fa-regular fa-magnifying-glass"
          menuPlacement="bottom"
          isMulti
          className="select-control select-border-none flex-1"
          classNamePrefix="select"
          name="MemberID"
          value={values.MemberID}
          onChange={(option) => setFieldValue("MemberID", option, false)}
          isClearable
          isSearchable
          components={{
            Option: CustomOptionStaff,
            Control,
            DropdownIndicator: () => null,
            IndicatorSeparator: () => null,
          }}
          placeholder="Tìm kiếm"
          noOptionsMessage={({ inputValue }) =>
            !inputValue ? "Không có khách hàng" : "Không tìm thấy khách hàng"
          }
          menuPortalTarget={document.body}
        />
        <div
          className="d-flex align-items-center justify-content-center cursor-pointer"
          style={{
            width: "35px",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className="fa-regular fa-ellipsis-vertical"></i>
          <div
            style={{
              backgroundColor: "#E4E6EF",
            }}
          ></div>
        </div>
      </div>
      <div className="form-group form-group-ezs mb-0">
        {isOpen && (
          <div className="pb-8px mt-[8px]">
            <SelectStaffsService
              classIcon="far fa-user-cog"
              menuPlacement="bottom"
              isMulti
              className="select-control mb-8px"
              classNamePrefix="select"
              isClearable
              isSearchable
              //menuIsOpen={true}
              name="UserServiceIDs"
              value={values.UserServiceIDs}
              onChange={(option) =>
                setFieldValue("UserServiceIDs", option, false)
              }
              placeholder="Nhân viên"
              components={{
                Option: CustomOptionStaff,
                Control,
              }}
              noOptionsMessage={({ inputValue }) =>
                !inputValue ? "Không có nhân viên" : "Không tìm thấy nhân viên"
              }
              menuPortalTarget={document.body}
            />
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
              onChange={(option) =>
                setFieldValue("StatusMember", option, false)
              }
              components={{
                Control,
              }}
              menuPortalTarget={document.body}
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
              menuPortalTarget={document.body}
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
              onChange={(option) =>
                setFieldValue("StatusAtHome", option, false)
              }
              components={{
                Control,
              }}
              menuPortalTarget={document.body}
            />
            <Select
              classIcon="far fa-ballot-check"
              isMulti
              isClearable
              classNamePrefix="select"
              className="mt-2 select-control"
              options={TagsList}
              placeholder="Chọn tags"
              value={values.Tags}
              onChange={(value) => setFieldValue("Tags", value)}
              blurInputOnSelect={true}
              noOptionsMessage={() => "Không có dữ liệu."}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                menuPortal: (base) => ({
                  ...base,
                  zIndex: 9999,
                }),
              }}
              components={{
                Control,
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default AdvancedList;
