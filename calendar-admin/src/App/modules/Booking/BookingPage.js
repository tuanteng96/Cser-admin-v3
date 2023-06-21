import React, { Fragment, useEffect, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import Select, { components } from "react-select";
import AsyncSelect from "react-select/async";
import CalendarCrud from "../Calendar/_redux/CalendarCrud";
import { toUrlServer } from "../../../helpers/AssetsHelpers";
import DatePicker from "react-datepicker";
import { useSelector } from "react-redux";
import "../../../_assets/sass/pages/_booking.scss";
import Cookies from "js-cookie";

import moment from "moment";
import "moment/locale/vi";
import SelectStocks from "../../../components/Select/SelectStocks/SelectStocks";
import SelectStaffsService from "../../../components/Select/SelectStaffsService/SelectStaffsService";
moment.locale("vi");

const StatusArr = [
  {
    value: "XAC_NHAN",
    label: "Đã xác nhận",
    color: "#3699FF",
  },
  {
    value: "KHACH_DEN",
    label: "Hoàn thành",
    color: "#1bc5bd",
  },
  {
    value: "KHACH_KHONG_DEN",
    label: "Khách không đến",
    color: "#F64E60",
  },
];

const CustomOptionStaff = ({ children, ...props }) => {
  const { Thumbnail, label } = props.data;
  return (
    <components.Option {...props}>
      <div className="d-flex align-items-center">
        <div className="w-20px h-20px mr-3 rounded-circle overflow-hidden d-flex align-items-center justify-content-center">
          <img className="w-100" src={Thumbnail} alt={label} />
        </div>
        {children}
      </div>
    </components.Option>
  );
};

const initialDefault = {
  MemberID: null,
  RootIdS: "",
  BookDate: new Date(),
  Desc: "",
  StockID: 0,
  UserServiceIDs: "",
  AtHome: false,
};
function BookingPage() {
  const [initialValues, setInitialValues] = useState(initialDefault);
  const [btnLoading, setBtnLoading] = useState({
    isBtnBooking: false,
    isBtnDelete: false,
  });
  const { AuthCrStockID, Book, BookMember } = useSelector(
    ({ Auth, Booking }) => ({
      AuthCrStockID: Auth.CrStockID,
      Book: Booking.Book,
      BookMember: Booking.Member,
    })
  );

  useEffect(() => {
    if (Book.ID > 0) {
      setInitialValues((prevState) => ({
        ...prevState,
        ID: Book.ID,
        MemberID: {
          label: Book.Member.FullName,
          value: Book.Member.ID,
        },
        RootIdS: Book.Roots.map((item) => ({
          ...item,
          value: item.ID,
          label: item.Title,
        })),
        Status: Book.Status,
        BookDate: Book.BookDate,
        StockID: Book.StockID,
        Desc: Book.Desc,
        UserServiceIDs: Book.UserServices.map((item) => ({
          ...item,
          value: item.ID,
          label: item.FullName,
        })),
        AtHome: Book.AtHome
      }));
    } else {
      setInitialValues((prevState) => ({
        ...prevState,
        StockID: AuthCrStockID,
        MemberID: {
          value: BookMember.ID,
          label: BookMember.FullName,
        },
        Status: "XAC_NHAN",
      }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Book, BookMember, AuthCrStockID]);

  const loadOptionsStaff = (inputValue, callback, stockID) => {
    const filters = {
      key: inputValue,
      StockID: stockID,
    };
    setTimeout(async () => {
      const { data } = await CalendarCrud.getStaffs(filters);
      const dataResult = data.map((item) => ({
        value: item.id,
        label: item.text,
        Thumbnail: toUrlServer("/images/user.png"),
      }));
      callback(dataResult);
    }, 300);
  };

  const loadOptionsServices = (inputValue, callback, stockID, MemberID) => {
    const filters = {
      Key: inputValue,
      StockID: stockID,
      MemberID: MemberID?.value,
    };
    setTimeout(async () => {
      const { lst } = await CalendarCrud.getRootServices(filters);
      const dataResult = lst.map((item) => ({
        value: item.ID,
        label: item.Title,
      }));
      callback(dataResult);
    }, 300);
  };

  const renderFooterModal = (Status, formikProps) => {
    const { submitForm, setFieldValue } = formikProps;
    if (!Status) {
      return (
        <Fragment>
          <button
            type="submit"
            className={`btn btn-sm btn-primary mr-2 ${
              btnLoading.isBtnBooking
                ? "spinner spinner-white spinner-right"
                : ""
            } w-auto my-0 mr-0 h-auto`}
            disabled={btnLoading.isBtnBooking}
          >
            Đặt lịch
          </button>
        </Fragment>
      );
    }
    if (Status === "CHUA_XAC_NHAN") {
      return (
        <Fragment>
          <button
            type="submit"
            className={`btn btn-sm btn-primary mr-2 ${
              btnLoading.isBtnBooking
                ? "spinner spinner-white spinner-right"
                : ""
            } w-auto my-0 mr-0 h-auto`}
            disabled={btnLoading.isBtnBooking}
            onClick={() => {
              setFieldValue("Status", "XAC_NHAN", submitForm()); //submitForm()
            }}
          >
            Xác nhận
          </button>
        </Fragment>
      );
    }
    if (Status === "XAC_NHAN") {
      return (
        <Fragment>
          <button
            type="submit"
            className={`btn btn-sm btn-primary mr-2 ${
              btnLoading.isBtnBooking
                ? "spinner spinner-white spinner-right"
                : ""
            } w-auto my-0 mr-0 h-auto`}
            disabled={btnLoading.isBtnBooking}
          >
            Lưu
          </button>
        </Fragment>
      );
    }
    return (
      <Fragment>
        <button
          type="submit"
          className={`btn btn-sm btn-primary mr-2 ${
            btnLoading.isBtnBooking ? "spinner spinner-white spinner-right" : ""
          } w-auto my-0 mr-0 h-auto`}
          disabled={btnLoading.isBtnBooking}
        >
          Lưu
        </button>
      </Fragment>
    );
  };

  const onSubmitBooking = async (values) => {
    setBtnLoading((prevState) => ({
      ...prevState,
      isBtnBooking: true,
    }));
    const CurrentStockID = Cookies.get("StockID");
    const u_id_z4aDf2 = Cookies.get("u_id_z4aDf2");

    const dataPost = {
      booking: [
        {
          ...values,
          MemberID: values.MemberID.value,
          RootIdS: values.RootIdS.map((item) => item.value).toString(),
          UserServiceIDs:
            values.UserServiceIDs && values.UserServiceIDs.length > 0
              ? values.UserServiceIDs.map((item) => item.value).toString()
              : "",
          BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
        },
      ],
    };
    try {
      await CalendarCrud.postBooking(dataPost, {
        CurrentStockID,
        u_id_z4aDf2,
      });
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnBooking: false,
      }));
      window.top?.bodyEvent &&
        window.top?.bodyEvent("ui_changed", {
          name: "s_dat_lich",
          mid: values.MemberID.value,
        });
      window.top.toastr.success("Đặt lịch thành công.", "", { timeOut: 2000 });
      window?.top?.MemberBookInfo && window.top.MemberBookInfo.callback();
    } catch (error) {
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnBooking: false,
      }));
    }
  };

  const onDelete = async (values) => {
    setBtnLoading((prevState) => ({
      ...prevState,
      isBtnDelete: true,
    }));
    const CurrentStockID = Cookies.get("StockID");
    const u_id_z4aDf2 = Cookies.get("u_id_z4aDf2");

    const dataPost = {
      booking: [
        {
          ...values,
          MemberID: values.MemberID.value,
          RootIdS: values.RootIdS.map((item) => item.value).toString(),
          UserServiceIDs:
            values.UserServiceIDs && values.UserServiceIDs.length > 0
              ? values.UserServiceIDs.map((item) => item.value).toString()
              : "",
          BookDate: moment(values.BookDate).format("YYYY-MM-DD HH:mm"),
          Status: "TU_CHOI",
        },
      ],
    };

    try {
      await CalendarCrud.postBooking(dataPost, {
        CurrentStockID,
        u_id_z4aDf2,
      });
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnDelete: false,
      }));
      window.top?.bodyEvent &&
        window.top?.bodyEvent("ui_changed", {
          name: "s_huy_lich",
          mid: values.MemberID.value,
        });
      window.top.toastr.success("Hủy lịch thành công.", "", { timeOut: 2000 });
      window?.top?.MemberBookInfo && window.top.MemberBookInfo.callback();
    } catch (error) {
      setBtnLoading((prevState) => ({
        ...prevState,
        isBtnDelete: false,
      }));
    }
  };

  const CalendarSchema = Yup.object().shape({
    BookDate: Yup.string().required("Vui lòng chọn ngày đặt lịch."),
    MemberID: Yup.object()
      .nullable()
      .required("Vui lòng chọn khách hàng"),
    RootIdS: Yup.array()
      .required("Vui lòng chọn dịch vụ.")
      .nullable(),
    // UserServiceIDs: Yup.array()
    //   .required("Vui lòng chọn nhân viên.")
    //   .nullable(),
    StockID: Yup.string().required("Vui lòng chọn cơ sở."),
  });
  return (
    <div className="booking">
      <Formik
        initialValues={initialValues}
        validationSchema={CalendarSchema}
        onSubmit={onSubmitBooking}
        enableReinitialize
      >
        {(formikProps) => {
          const {
            errors,
            touched,
            values,
            handleChange,
            handleBlur,
            setFieldValue,
          } = formikProps;
          return (
            <Form className="h-100 d-flex flex-column">
              <div className="booking-body">
                {values.ID && (
                  <div className="form-group form-group-ezs px-6 pt-3 border-bottom m-0 pb-4">
                    <label className="mb-1">Trạng thái</label>
                    <Select
                      className={`select-control ${
                        errors.Status && touched.Status
                          ? "is-invalid solid-invalid"
                          : ""
                      }`}
                      classNamePrefix="select"
                      isLoading={false}
                      isClearable={false}
                      isSearchable={false}
                      //menuIsOpen={true}
                      name="Status"
                      value={StatusArr.filter(
                        (item) => item.value === values.Status
                      )}
                      onChange={(option) =>
                        setFieldValue("Status", option ? option.value : "")
                      }
                      onBlur={handleBlur}
                      options={StatusArr}
                      placeholder="Chọn trạng thái"
                      menuPosition="fixed"
                    />
                  </div>
                )}

                <div className="form-group form-group-ezs px-6 pt-3">
                  <label className="mb-1 d-flex justify-content-between">
                    Thời gian / Cơ sở
                    {/* <span className="btn btn-label btn-light-primary label-inline cursor-pointer">
                      Lặp lại
                    </span> */}
                  </label>
                  <DatePicker
                    name="BookDate"
                    selected={values.BookDate ? new Date(values.BookDate) : ""}
                    onChange={(date) => setFieldValue("BookDate", date)}
                    onBlur={handleBlur}
                    className={`form-control ${
                      errors.BookDate && touched.BookDate
                        ? "is-invalid solid-invalid"
                        : ""
                    }`}
                    shouldCloseOnSelect={false}
                    dateFormat="dd/MM/yyyy h:mm aa"
                    placeholderText="Chọn thời gian"
                    timeInputLabel="Thời gian"
                    showTimeSelect
                  />
                  <SelectStocks
                    className={`select-control mt-2 ${
                      errors.StockID && touched.StockID
                        ? "is-invalid solid-invalid"
                        : ""
                    }`}
                    classNamePrefix="select"
                    value={values.StockID}
                    //isLoading={true}
                    //isDisabled={true}
                    //isClearable
                    isSearchable
                    //menuIsOpen={true}
                    name="StockID"
                    placeholder="Chọn cơ sở"
                    onChange={(option) => {
                      setFieldValue("StockID", option ? option.value : "");
                    }}
                    menuPosition="fixed"
                    onBlur={handleBlur}
                  />
                </div>
                <div className="form-group form-group-ezs border-top px-6 pt-3">
                  <label className="mb-1">Dịch vụ</label>
                  <AsyncSelect
                    key={`${
                      values.MemberID && values.MemberID.value
                        ? values.MemberID.value
                        : "No-Member"
                    }-${values.StockID}`}
                    menuPosition="fixed"
                    isMulti
                    className={`select-control ${
                      errors.RootIdS && touched.RootIdS
                        ? "is-invalid solid-invalid"
                        : ""
                    }`}
                    classNamePrefix="select"
                    isLoading={false}
                    isDisabled={false}
                    isClearable
                    isSearchable
                    //menuIsOpen={true}
                    value={values.RootIdS}
                    onChange={(option) => setFieldValue("RootIdS", option)}
                    name="RootIdS"
                    placeholder="Chọn dịch vụ"
                    cacheOptions
                    loadOptions={(v, callback) =>
                      loadOptionsServices(
                        v,
                        callback,
                        values.StockID,
                        values.MemberID
                      )
                    }
                    defaultOptions
                    noOptionsMessage={({ inputValue }) =>
                      !inputValue
                        ? "Không có dịch vụ"
                        : "Không tìm thấy dịch vụ"
                    }
                  />

                  <div className="d-flex align-items-center justify-content-between mt-3">
                    <label className="mr-3">Sử dụng dịch vụ tại nhà</label>
                    <span className="switch switch-sm switch-icon">
                      <label>
                        <input
                          type="checkbox"
                          name="AtHome"
                          onChange={(evt) =>
                            setFieldValue("AtHome", evt.target.checked)
                          }
                          onBlur={handleBlur}
                          checked={values.AtHome}
                        />
                        <span />
                      </label>
                    </span>
                  </div>
                </div>
                <div className="form-group form-group-ezs px-6 pt-3 border-top">
                  <label className="mb-1">Nhân viên thực hiện</label>
                  <SelectStaffsService
                    className={`select-control ${
                      errors.UserServiceIDs && touched.UserServiceIDs
                        ? "is-invalid solid-invalid"
                        : ""
                    }`}
                    classNamePrefix="select"
                    isLoading={false}
                    isDisabled={false}
                    isClearable
                    isSearchable
                    isMulti
                    menuPosition="fixed"
                    //menuIsOpen={true}
                    name="UserServiceIDs"
                    value={values.UserServiceIDs}
                    onChange={(option) =>
                      setFieldValue("UserServiceIDs", option)
                    }
                    placeholder="Chọn nhân viên"
                    components={{
                      Option: CustomOptionStaff,
                    }}
                    noOptionsMessage={({ inputValue }) =>
                      !inputValue
                        ? "Không có nhân viên"
                        : "Không tìm thấy nhân viên"
                    }
                  />
                  <textarea
                    name="Desc"
                    value={values.Desc}
                    className="form-control mt-2"
                    rows="5"
                    placeholder="Nhập ghi chú"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  ></textarea>
                </div>
              </div>
              <div className="px-6 py-5 border-top booking-footer">
                {renderFooterModal(initialValues.Status, formikProps)}
                {values.ID && (
                  <button
                    type="button"
                    className={`btn btn-sm btn-danger mr-2 ${
                      btnLoading.isBtnDelete
                        ? "spinner spinner-white spinner-right"
                        : ""
                    } w-auto my-0 mr-0 h-auto`}
                    disabled={btnLoading.isBtnDelete}
                    onClick={() => onDelete(values)}
                  >
                    Hủy lịch
                  </button>
                )}
              </div>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
export default BookingPage;
