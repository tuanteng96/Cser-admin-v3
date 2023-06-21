import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { components } from "react-select";
// import DatePicker from "react-datepicker";
import { Form, Formik, useFormikContext } from "formik";
import { useWindowSize } from "../../hooks/useWindowSize";
import StatusList from "./StatusList";
import AdvancedList from "./AdvancedList";
import { Dropdown } from "react-bootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import { AppContext } from "../../App/App";
import SelectStocksTelesale from "../Select/SelectStocksTelesale/SelectStocksTelesale";
import SelectStaffsService from "../Select/SelectStaffsService/SelectStaffsService";
import SelectMember from "../Select/SelectMember/SelectMember";
import SelectStaffsTelesale from "../Select/SelectStaffsTelesale/SelectStaffsTelesale";

SidebarCalendar.propTypes = {
  onOpenModal: PropTypes.func,
  onSubmit: PropTypes.func,
  filters: PropTypes.object,
  loading: PropTypes.bool,
};
SidebarCalendar.defaultProps = {
  onOpenModal: null,
  onSubmit: null,
  filters: null,
  loading: false,
};

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false,
};

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

// const CustomOption = ({ children, ...props }) => {
//   const { color } = props.data;
//   return (
//     <components.Option {...props}>
//       <div className="d-flex align-items-center">
//         <div
//           className="w-20px h-15px rounded-2px mr-2"
//           style={{ background: color }}
//         ></div>
//         {children}
//       </div>
//     </components.Option>
//   );
// };

const ValueChangeListener = () => {
  const { submitForm, values } = useFormikContext();

  useEffect(() => {
    if (values.From && values.To) {
      submitForm();
    }
  }, [values, submitForm]);

  return null;
};

const initialDefault = {
  MemberID: null,
  StockID: 0,
  From: new Date(), //yyyy-MM-dd
  To: null, //yyyy-MM-dd,
  Status: null,
  UserServiceIDs: null,
};

function SidebarCalendar({
  onOpenModal,
  onSubmit,
  filters,
  initialView,
  loading,
  onOpenFilter,
  onHideFilter,
  isFilter,
  headerTitle,
  onOpenModalLock,
}) {
  const [initialValues, setInitialValues] = useState(initialDefault);
  const { width } = useWindowSize();
  const { isTelesales } = useContext(AppContext);

  useEffect(() => {
    if (filters) {
      setInitialValues(filters);
    }
  }, [filters]);

  return (
    <div className="ezs-calendar__sidebar">
      <div className="header-sidebar p-15px">
        <div className="d-flex justify-content-between align-items-center">
          {!isTelesales && (
            <Dropdown>
              <Dropdown.Toggle className="btn btn-primary btn-sm h-42px btn-shadow px-15px">
                {width > 1200 ? "Tạo mới" : <i className="fal fa-plus"></i>}
              </Dropdown.Toggle>

              <Dropdown.Menu variant="dark">
                <Dropdown.Item
                  href="#"
                  onClick={() => {
                    window.top?.MemberEdit &&
                      window.top.MemberEdit({
                        Member: {
                          ID: 0,
                        },
                      });
                  }}
                >
                  Khách hàng mới
                </Dropdown.Item>
                <Dropdown.Item href="#" onClick={onOpenModal}>
                  Đặt lịch mới
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
          <div className="d-xl-none align-items-center font-size-lg font-weight-bolder">
            {headerTitle}
          </div>
          <button
            className="btn btn-info h-40px d-xl-none w-45px p-0 d-xl-none"
            onClick={onOpenFilter}
          >
            <i className="fas fa-sort-amount-down p-0 font-size-md"></i>
          </button>
        </div>
      </div>
      <div
        className={`sidebar-bg ${isFilter ? "show" : ""}`}
        onClick={onHideFilter}
      ></div>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {(formikProps) => {
          const { values, setFieldValue, handleBlur } = formikProps;
          return (
            <Form className={`${isFilter ? "show" : ""} sidebar-body`}>
              <PerfectScrollbar
                options={perfectScrollbarOptions}
                className="scroll"
                style={{ position: "relative", touchAction: "none" }}
              >
                <div className="px-15px">
                  <div className="form-group form-group-ezs mb-0 mt-12px">
                    {/* <label className="mb-1">Khách hàng</label> */}
                    <div>
                      {isTelesales && (
                        <SelectStocksTelesale
                          noOptionsMessage={() => "không có sơ sở"}
                          classIcon="far fa-map-marker-alt"
                          classNamePrefix="select"
                          value={values.StockID}
                          components={{
                            Control,
                          }}
                          //isLoading={true}
                          //isDisabled={true}
                          isSearchable
                          //menuIsOpen={true}
                          name="StockID"
                          placeholder="Chọn cơ sở"
                          onChange={(option) => {
                            setFieldValue(
                              "StockID",
                              option ? option.value : ""
                            );
                          }}
                          menuPosition="fixed"
                          onBlur={handleBlur}
                          menuPortalTarget={document.body}
                        />
                      )}
                      {!isTelesales && (
                        <SelectMember
                          classIcon="far fa-user-alt"
                          menuPlacement="bottom"
                          isMulti
                          className="select-control mb-8px"
                          classNamePrefix="select"
                          name="MemberID"
                          value={values.MemberID}
                          onChange={(option) =>
                            setFieldValue("MemberID", option, false)
                          }
                          isClearable
                          isSearchable
                          components={{
                            Option: CustomOptionStaff,
                            Control,
                          }}
                          placeholder="Khách hàng"
                          noOptionsMessage={({ inputValue }) =>
                            !inputValue
                              ? "Không có khách hàng"
                              : "Không tìm thấy khách hàng"
                          }
                          menuPortalTarget={document.body}
                        />
                      )}
                      {isTelesales ? (
                        <SelectStaffsTelesale
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
                            !inputValue
                              ? "Không có nhân viên"
                              : "Không tìm thấy nhân viên"
                          }
                          menuPortalTarget={document.body}
                        />
                      ) : (
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
                            !inputValue
                              ? "Không có nhân viên"
                              : "Không tìm thấy nhân viên"
                          }
                          menuPortalTarget={document.body}
                        />
                      )}
                    </div>
                  </div>
                  <AdvancedList formikProps={formikProps} />
                  <StatusList />
                  {!isTelesales && (
                    <div
                      className="font-size-xs font-weight-bold mt-15px text-primary text-decoration-underline cursor-pointer"
                      onClick={onOpenModalLock}
                    >
                      <i className="fas fa-tools font-size-xs pr-8px"></i>Cài
                      đặt khóa lịch
                    </div>
                  )}
                </div>
              </PerfectScrollbar>
              {width > 991 ? (
                <ValueChangeListener />
              ) : (
                <div className="sidebar-footer">
                  <div className="d-flex justify-content-between">
                    <button
                      type="submit"
                      className={`btn btn-primary btn-sm d-block ${
                        loading ? "spinner spinner-white spinner-right" : ""
                      } w-auto my-0 mr-0 h-auto`}
                      disabled={loading}
                    >
                      Lọc ngay
                    </button>
                    <button
                      type="button"
                      className={`btn btn-secondary w-auto my-0 mr-0 h-auto`}
                      onClick={onHideFilter}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              )}
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}

export default SidebarCalendar;
