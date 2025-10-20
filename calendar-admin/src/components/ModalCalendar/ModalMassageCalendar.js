import React, { Fragment, useEffect, useState } from "react";
import PropTypes from "prop-types";
import Select, { components } from "react-select";
import AsyncCreatableSelect from "react-select/async-creatable";
import AsyncSelect from "react-select/async";
import { Dropdown, Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useSelector } from "react-redux";
import moment from "moment";
import CalendarCrud from "../../App/modules/Calendar/_redux/CalendarCrud";
import { toUrlServer } from "../../helpers/AssetsHelpers";
import ModalCreateMember from "../ModalCreateMember/ModalCreateMember";
import SelectStaffsService from "../Select/SelectStaffsService/SelectStaffsService";
import SelectStocks from "../Select/SelectStocks/SelectStocks";
import { toast } from "react-toastify";
import { NumericFormat } from "react-number-format";
import clsx from "clsx";
import SelectServiceBed from "../Select/SelectServiceBed/SelectServiceBed";
import { useRoles } from "../../hooks/useRoles";
moment.locale("vi");

ModalMassageCalendar.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  onSubmit: PropTypes.func,
};
ModalMassageCalendar.defaultProps = {
  show: false,
  onHide: null,
  onSubmit: null,
};

function getUniqueListBy(arr, key) {
  return [...new Map(arr.map((item) => [item[key], item])).values()];
}

const CustomOptionStaff = ({ children, ...props }) => {
  const { Thumbnail, label } = props.data;
  return (
    <components.Option {...props}>
      <div className="d-flex align-items-center">
        {Thumbnail && (
          <div className="mr-3 overflow-hidden w-20px h-20px rounded-circle d-flex align-items-center justify-content-center">
            <img className="w-100" src={Thumbnail} alt={label} />
          </div>
        )}

        {children}
      </div>
    </components.Option>
  );
};

const CustomOptionMember = ({ children, ...props }) => {
  const { Thumbnail, label, suffix } = props.data;
  return (
    <components.Option {...props}>
      <div className="d-flex align-items-center">
        {Thumbnail && (
          <div className="mr-3 overflow-hidden w-20px h-20px rounded-circle d-flex align-items-center justify-content-center">
            <img className="w-100" src={Thumbnail} alt={label} />
          </div>
        )}
        <div
          className={clsx(
            label === "Đặt lịch cho khách vãng lai" && "text-success"
          )}
        >
          {children}
          {label !== "Khách vãng lai" &&
            label !== "Đặt lịch cho khách vãng lai" && (
              <>
                <span className="pl-[5px]">
                  - <span className="text-[13px]">{suffix}</span>
                </span>
              </>
            )}
        </div>
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
  AmountPeople: {
    label: "1 khách",
    value: 1,
  },
  TagSetting: "",
  FullName: "",
  Phone: "",
  TreatmentJson: "",
};

function ModalMassageCalendar({
  show,
  onHide,
  onSubmit,
  onFinish,
  onGuestsArrive,
  btnLoading,
  initialValue,
  onDelete,
  TagsList,
  isTelesales,
}) {
  const { AuthCrStockID, TimeOpen, TimeClose } = useSelector(
    ({ Auth, JsonConfig }) => ({
      AuthStocks: Auth.Stocks.filter(
        (item) => item.ParentID !== 0
      ).map((item) => ({ ...item, value: item.ID, label: item.Title })),
      AuthCrStockID: Auth.CrStockID,
      TimeOpen: JsonConfig?.APP?.Working?.TimeOpen || "00:00:00",
      TimeClose: JsonConfig?.APP?.Working?.TimeClose || "23:59:00",
    })
  );
  const [initialValues, setInitialValues] = useState({
    ...initialDefault,
    StockID: initialValue.StockID,
  });
  const [isModalCreate, setIsModalCreate] = useState(false);
  const [initialCreate, setInitialCreate] = useState({
    FullName: "",
    Phone: "",
    PassersBy: false, // Khách vãng lai
  });

  const [loading, setLoading] = useState(false);

  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  useEffect(() => {
    if (show) {
      if (initialValue.ID) {
        let newDesc = initialValue.Desc;
        let AmountPeople = {
          label: "1 khách",
          value: 1,
        };
        let TagSetting = [];
        let descSplit = newDesc.split("\n");

        for (let i of descSplit) {
          if (i.includes("Số lượng khách:")) {
            let SL = Number(i.match(/\d+/)[0]);
            AmountPeople = {
              label: SL + " khách",
              value: SL,
            };
          }
          if (i.includes("Tags:")) {
            let newTagSetting = i.replaceAll("Tags: ", "");
            TagSetting = newTagSetting
              .split(",")
              .map((x) => ({ label: x, value: x }));
          }
          if (i.includes("Ghi chú:")) {
            newDesc = i.replaceAll("Ghi chú: ", "");
          }
        }
        setInitialValues((prevState) => ({
          ...prevState,
          ID: initialValue.ID,
          MemberID: {
            label: initialValue.Member.FullName,
            text: initialValue.FullName || initialValue.Member.FullName,
            value: initialValue.Member.ID,
            suffix: initialValue.Phone || initialValue.Member.MobilePhone,
          },
          FullName: initialValue?.FullName || "",
          Phone: initialValue?.Phone || "",
          RootIdS: initialValue.Roots
            ? initialValue.Roots.map((item) => ({
                ...item,
                value: item.ID,
                label: item.Title,
              }))
            : "",
          Status: initialValue.Status,
          BookDate: initialValue.BookDate,
          StockID: initialValue.StockID,
          Desc: newDesc.replaceAll("</br>", "\n"),
          UserServiceIDs: initialValue.UserServices
            ? initialValue.UserServices.map((item) => ({
                ...item,
                value: item.ID,
                label: item.FullName,
              }))
            : [],
          AtHome: initialValue.AtHome,
          IsMemberCurrent: getIsMember(initialValue),
          CreateBy: initialValue?.CreateBy || "",
          TeleTags: initialValue?.Member?.TeleTags || "",
          AmountPeople,
          TagSetting,
          TreatmentJson: initialValue?.TreatmentJson
            ? JSON.parse(initialValue?.TreatmentJson)
            : "",
          History: initialValue?.HistoryJSON
            ? JSON.parse(initialValue?.HistoryJSON)
            : "",
        }));
      } else {
        setInitialValues((prevState) => ({
          ...prevState,
          StockID: AuthCrStockID,
          BookDate: initialValue?.BookDate ? initialValue.BookDate : new Date(),
          UserServiceIDs: initialValue?.UserServiceIDs || [],
          TreatmentJson: initialValue?.TreatmentJson || null,
        }));
      }
    } else {
      setInitialValues({ ...initialDefault, StockID: AuthCrStockID });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, initialValue]);

  const getIsMember = (member) => {
    const objMember = {
      IsAnonymous: false,
    };
    if (member?.Member?.MobilePhone === "0000000000") {
      objMember.IsAnonymous = true;
      objMember.MemberCreate = {
        FullName: member?.FullName,
        Phone: member?.Phone,
      };
      objMember.MemberPhone = member?.MemberPhone;
    } else {
      objMember.MemberID = member?.Member?.ID;
    }
    return objMember;
  };

  const loadOptionsCustomer = (inputValue, callback) => {
    setTimeout(async () => {
      const { data } = await CalendarCrud.getMembers(
        inputValue,
        "",
        inputValue === "" ? 0 : ""
      );
      let dataResult = data.map((item) => ({
        ...item,
        value: item.id,
        label:
          inputValue === "" && item.text === "Khách vãng lai"
            ? "Đặt lịch cho khách vãng lai"
            : item.text,
        Thumbnail: toUrlServer("/images/user.png"),
      }));

      dataResult = getUniqueListBy(dataResult, "value");

      callback(dataResult);
    }, 300);
  };

  const loadOptionsServices = (inputValue, callback, stockID, MemberID) => {
    const filters = {
      Key: inputValue,
      StockID: stockID,
      MemberID: MemberID?.value || "",
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

  const getTitleModal = (Status, formikProps) => {
    const { setFieldValue } = formikProps;
    let isAuto =
      initialValue?.Desc &&
      initialValue?.Desc?.toUpperCase().indexOf("TỰ ĐỘNG ĐẶT LỊCH") > -1;
    if (!Status) {
      return "Đặt lịch dịch vụ";
    }
    if (Status === "CHUA_XAC_NHAN") {
      return <span className="text-warning">Chưa xác nhận</span>;
    }
    return (
      <Dropdown>
        <Dropdown.Toggle
          className={`bg-transparent p-0 border-0 modal-dropdown-title ${
            Status === "XAC_NHAN"
              ? isAuto
                ? "text-primary1"
                : "text-primary"
              : ""
          } ${
            Status === "KHACH_KHONG_DEN" || Status === "TU_CHOI"
              ? "text-danger"
              : ""
          } ${Status === "KHACH_DEN" ? "text-success" : ""}`}
          id="dropdown-custom-1"
        >
          <span>
            {Status === "XAC_NHAN"
              ? isAuto
                ? "Đặt lịch dự kiến"
                : "Đã xác nhận"
              : ""}
            {Status === "KHACH_KHONG_DEN" ? "Khách không đến" : ""}
            {Status === "KHACH_DEN" ? "Khách có đến" : ""}
            {Status === "TU_CHOI" ? "Khách hủy lịch" : ""}
          </span>
        </Dropdown.Toggle>
        <Dropdown.Menu className="super-colors">
          <Dropdown.Item
            className="font-weight-bold"
            eventKey="1"
            active={Status === "XAC_NHAN"}
            onClick={() => setFieldValue("Status", "XAC_NHAN", false)}
          >
            {isAuto ? "Đặt lịch dự kiến" : "Đã xác nhận"}
          </Dropdown.Item>
          <Dropdown.Item
            className="font-weight-bold"
            eventKey="2"
            active={Status === "KHACH_KHONG_DEN"}
            onClick={() => setFieldValue("Status", "KHACH_KHONG_DEN", false)}
          >
            Khách không đến
          </Dropdown.Item>
          <Dropdown.Item
            className="font-weight-bold"
            eventKey="3"
            active={Status === "KHACH_DEN"}
            onClick={() => setFieldValue("Status", "KHACH_DEN", false)}
          >
            Khách có đến
          </Dropdown.Item>
          <Dropdown.Item
            className="font-weight-bold"
            eventKey="4"
            active={Status === "TU_CHOI"}
            onClick={() => setFieldValue("Status", "TU_CHOI", false)}
          >
            Khách hủy lịch
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const CalendarSchema = Yup.object().shape({
    BookDate: Yup.string().required("Vui lòng chọn ngày đặt lịch."),
    // MemberID: Yup.object()
    //   .nullable()
    //   .required("Vui lòng chọn khách hàng"),
    RootIdS: Yup.array()
      .required("Vui lòng chọn dịch vụ.")
      .nullable(),
    // UserServiceIDs: Yup.array()
    //   .required("Vui lòng chọn nhân viên.")
    //   .nullable(),
    StockID: Yup.string().required("Vui lòng chọn cơ sở."),
  });

  const onChangeStatusTele = () => {
    setLoading(true);
    let newData = {
      update: [
        {
          BookId: initialValue?.ID,
          Status: window?.top?.GlobalConfig?.Admin?.kpiChot,
        },
      ],
    };
    CalendarCrud.editTagsMember(newData).then((res) => {
      setLoading(false);
      toast.success("Cập nhật thành công !", {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 1500,
      });
    });
  };

  return (
    <Fragment>
      <Modal
        size="md"
        dialogClassName="modal-max-sm modal-content-right"
        show={show}
        onHide={onHide}
        scrollable={true}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={CalendarSchema}
          onSubmit={onSubmit}
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
                <Modal.Header className="open-close" closeButton>
                  <Modal.Title className="text-uppercase">
                    {getTitleModal(values.Status, formikProps)}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                  <div className="px-6 pt-3 mb-3 form-group form-group-ezs">
                    {/* <label className="mb-1 d-none d-md-block">Khách hàng</label> */}
                    <AsyncCreatableSelect
                      className={`select-control ${
                        errors.MemberID && touched.MemberID
                          ? "is-invalid solid-invalid"
                          : ""
                      }`}
                      classNamePrefix="select"
                      isLoading={false}
                      isDisabled={false}
                      isClearable
                      isSearchable
                      //menuIsOpen={true}
                      name="MemberID"
                      value={values.MemberID}
                      onChange={(option) => {
                        setFieldValue("MemberID", option);
                      }}
                      onBlur={handleBlur}
                      placeholder="Chọn khách hàng"
                      components={{
                        Option: CustomOptionMember,
                      }}
                      onCreateOption={(inputValue) => {
                        const initValue = { ...initialCreate };
                        if (/^-?\d+$/.test(inputValue)) {
                          initValue.Phone = inputValue;
                          initValue.FullName = "";
                        } else {
                          initValue.Phone = "";
                          initValue.FullName = inputValue;
                        }
                        setInitialCreate(initValue);
                        setIsModalCreate(true);
                      }}
                      formatCreateLabel={(inputValue) => (
                        <span className="text-primary">
                          Không thấy - Tạo mới "{inputValue}"
                        </span>
                      )}
                      menuPosition="fixed"
                      cacheOptions
                      loadOptions={loadOptionsCustomer}
                      defaultOptions
                      noOptionsMessage={({ inputValue }) =>
                        !inputValue
                          ? "Không có khách hàng"
                          : "Không tìm thấy khách hàng"
                      }
                      isValidNewOption={(
                        inputValue,
                        selectValue,
                        selectOptions
                      ) => inputValue && selectOptions.length === 0}
                    />

                    {values.MemberID && (
                      <div className="grid grid-cols-2 gap-2 mt-2 font-size-xs">
                        <div className="mr-4">
                          Khách hàng :
                          {values.MemberID?.label === "Khách vãng lai" ||
                          values.MemberID?.label ===
                            "Đặt lịch cho khách vãng lai" ? (
                            <div className="mt-1">
                              <input
                                name="FullName"
                                value={values.FullName}
                                className="form-control"
                                placeholder="Nhập tên"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                autoComplete="off"
                              ></input>
                            </div>
                          ) : (
                            <div
                              className="font-bold cursor-pointer text-primary"
                              onClick={() =>
                                (window.top.location.href = `/admin/?mdl=store&act=sell#mp:${values.MemberID?.value}`)
                              }
                            >
                              {values.MemberID?.text}
                            </div>
                          )}
                        </div>
                        <div>
                          Số điện thoại :
                          {values.MemberID?.label === "Khách vãng lai" ||
                          values.MemberID?.label ===
                            "Đặt lịch cho khách vãng lai" ? (
                            <div className="mt-1">
                              <NumericFormat
                                allowLeadingZeros
                                name="Phone"
                                value={values.Phone}
                                className="form-control"
                                placeholder="Nhập số điện thoại"
                                onValueChange={(val) =>
                                  setFieldValue("Phone", val.value)
                                }
                                autoComplete="off"
                              />
                            </div>
                          ) : (
                            <div
                              className="font-bold cursor-pointer text-primary"
                              onClick={() =>
                                (window.top.location.href = `/admin/?mdl=store&act=sell#mp:${values.MemberID?.value}`)
                              }
                            >
                              {values.MemberID?.suffix}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 pt-3 mb-3 form-group form-group-ezs border-top">
                    <label className="mb-1 d-none d-md-flex justify-content-between">
                      Thời gian / Cơ sở
                      {/* <span className="cursor-pointer btn btn-label btn-light-primary label-inline">
                      Lặp lại
                    </span> */}
                    </label>

                    <DatePicker
                      minDate={adminTools_byStock?.hasRight ? null : new Date()}
                      minTime={
                        new Date(
                          new Date().setHours(
                            moment(TimeOpen, "HH:mm:ss").format("HH"),
                            moment(TimeOpen, "HH:mm:ss").format("mm"),
                            0,
                            0
                          )
                        )
                      }
                      maxTime={
                        new Date(
                          new Date().setHours(
                            moment(TimeClose, "HH:mm:ss").format("HH"),
                            moment(TimeClose, "HH:mm:ss").format("mm"),
                            0,
                            0
                          )
                        )
                      }
                      name="BookDate"
                      selected={
                        values.BookDate ? new Date(values.BookDate) : ""
                      }
                      onChange={(date) => setFieldValue("BookDate", date)}
                      onBlur={handleBlur}
                      className={`form-control ${
                        errors.BookDate && touched.BookDate
                          ? "is-invalid solid-invalid"
                          : ""
                      }`}
                      shouldCloseOnSelect={false}
                      dateFormat="dd/MM/yyyy HH:mm"
                      placeholderText="Chọn thời gian"
                      timeInputLabel="Thời gian"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
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
                  <div className="px-6 pt-3 mb-3 form-group form-group-ezs border-top">
                    <label className="mb-1 d-none d-md-block">Dịch vụ</label>
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
                    {window?.top?.GlobalConfig?.APP?.Booking?.AtHome && (
                      <div className="mt-3 d-flex align-items-center justify-content-between">
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
                    )}
                  </div>
                  <div className="px-6 pt-3 mb-3 form-group form-group-ezs border-top">
                    <label className="mb-1 d-none d-md-block">
                      Nhân viên thực hiện
                    </label>
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
                    <SelectServiceBed
                      StockID={values.StockID}
                      classWrap="mt-2"
                      className={`select-control ${
                        errors.TreatmentJson && touched.TreatmentJson
                          ? "is-invalid solid-invalid"
                          : ""
                      }`}
                      classNamePrefix="select"
                      isClearable
                      isSearchable
                      noOptionsMessage={({ inputValue }) =>
                        !inputValue
                          ? "Không có giường"
                          : "Không tìm thấy giường"
                      }
                      value={values.TreatmentJson}
                      onChange={(option) =>
                        setFieldValue("TreatmentJson", option)
                      }
                      placeholder="Chọn phòng"
                    />
                    {window?.top?.GlobalConfig?.APP?.SL_khach && (
                      <Select
                        //isSearchable
                        isClearable
                        classNamePrefix="select"
                        className="mt-2 select-control"
                        options={Array(10)
                          .fill()
                          .map((_, x) => ({
                            label: x + 1 + " khách",
                            value: x + 1,
                          }))}
                        placeholder="Chọn số khách"
                        value={values.AmountPeople}
                        onChange={(value) =>
                          setFieldValue("AmountPeople", value)
                        }
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
                      />
                    )}

                    <Select
                      //isSearchable
                      isMulti
                      isClearable
                      classNamePrefix="select"
                      className="mt-2 select-control"
                      options={TagsList}
                      placeholder="Chọn tags"
                      value={values.TagSetting}
                      onChange={(value) => setFieldValue("TagSetting", value)}
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
                    />

                    <textarea
                      name="Desc"
                      value={values.Desc}
                      className="mt-2 form-control"
                      rows="2"
                      placeholder="Nhập ghi chú"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    ></textarea>
                  </div>
                  {values?.ID && (
                    <div className="px-6 pt-3 mb-3 form-group form-group-ezs border-top d-flex">
                      <div className="flex-1">
                        <label className="mb-1 d-none d-md-block">
                          Nhân viên tạo
                        </label>
                        <div className="mt-2px">
                          {initialValue?.UserName ? (
                            <span className="text-uppercase font-weight-bolder">
                              {initialValue?.UserName}
                            </span>
                          ) : (
                            <span className="font-weight-bolder">
                              Đặt lịch Online
                            </span>
                          )}
                        </div>
                        <div className="font-size-xs">
                          {moment(initialValue.CreateDate).format(
                            "HH:mm DD/MM/YYYY"
                          )}
                        </div>
                      </div>
                      {!values?.IsMemberCurrent?.IsAnonymous && (
                        <div className="w-120px">
                          <label className="mb-1 d-none d-md-block">
                            Chỉ số Booking
                          </label>
                          <div className="mt-2px font-weight-bolder">
                            {initialValue?.BookCount?.Done || 0}
                            <span className="px-2px">/</span>
                            {initialValue?.BookCount?.Total || 0}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Modal.Body>
                {!isTelesales && initialValues.Status !== "CHUA_XAC_NHAN" && (
                  <Modal.Footer className="justify-content-between">
                    <div className="d-flex w-100">
                      <div className="flex-1">
                        {!values?.ID && (
                          <div className="gap-2 d-flex w-100">
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={onHide}
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className={`btn btn-sm btn-primary flex-1 ${
                                btnLoading.isBtnBooking
                                  ? "spinner spinner-white spinner-right"
                                  : ""
                              } w-auto my-0 mr-0 h-auto`}
                              disabled={btnLoading.isBtnBooking}
                            >
                              Đặt lịch ngay
                            </button>
                            <button
                              onClick={() =>
                                onGuestsArrive(values, formikProps)
                              }
                              type="button"
                              className={`btn btn-sm btn-success flex-1 ${
                                btnLoading.isBtnGuestsArrive
                                  ? "spinner spinner-white spinner-right"
                                  : ""
                              } w-auto my-0 mr-0 h-auto`}
                              disabled={btnLoading.isBtnGuestsArrive}
                            >
                              Khách đến
                            </button>
                          </div>
                        )}
                        {values?.ID && (
                          <div className="w-100 d-flex">
                            {initialValues.Status === "CHUA_XAC_NHAN" ? (
                              <>
                                <button
                                  type="submit"
                                  className={`btn btn-sm btn-primary mr-2 flex-1 ${
                                    btnLoading.isBtnBooking
                                      ? "spinner spinner-white spinner-right"
                                      : ""
                                  } w-auto my-0 mr-0 h-auto`}
                                  disabled={btnLoading.isBtnBooking}
                                  onClick={() => {
                                    setFieldValue(
                                      "Status",
                                      "XAC_NHAN",
                                      formikProps.submitForm()
                                    ); //submitForm()
                                  }}
                                >
                                  Xác nhận
                                </button>
                                <button
                                  type="button"
                                  className={`btn btn-sm btn-danger ${
                                    btnLoading.isBtnDelete
                                      ? "spinner spinner-white spinner-right"
                                      : ""
                                  } w-auto my-0 mr-0 h-auto`}
                                  disabled={btnLoading.isBtnDelete}
                                  onClick={() => onDelete(values)}
                                >
                                  Hủy lịch
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="submit"
                                  className={`btn btn-sm btn-success text-truncate flex-1 ${
                                    btnLoading.isBtnBooking &&
                                    values.Status !== "KHACH_KHONG_DEN" &&
                                    values.Status !== "TU_CHOI" &&
                                    values.Status !== "KHACH_DEN"
                                      ? "spinner spinner-white spinner-right"
                                      : ""
                                  } w-auto my-0 mr-0 h-auto`}
                                  disabled={
                                    btnLoading.isBtnBooking &&
                                    values.Status !== "KHACH_KHONG_DEN" &&
                                    values.Status !== "TU_CHOI" &&
                                    values.Status !== "KHACH_DEN"
                                  }
                                >
                                  Cập nhật
                                </button>
                                {initialValue.Status !== "KHACH_DEN" && (
                                  <>
                                    <Dropdown>
                                      <Dropdown.Toggle
                                        className={`btn btn-danger hide-icon-after text-truncate ml-2 ${((btnLoading.isBtnBooking &&
                                          values.Status ===
                                            "KHACH_KHONG_DEN") ||
                                          btnLoading.isBtnDelete) &&
                                          "spinner spinner-white spinner-right"}`}
                                        disabled={
                                          (btnLoading.isBtnBooking &&
                                            values.Status ===
                                              "KHACH_KHONG_DEN") ||
                                          btnLoading.isBtnDelete
                                        }
                                      >
                                        Hủy
                                        {((btnLoading.isBtnBooking &&
                                          values.Status ===
                                            "KHACH_KHONG_DEN") ||
                                          btnLoading.isBtnDelete) && (
                                          <div
                                            className="spinner-border"
                                            role="status"
                                          ></div>
                                        )}
                                      </Dropdown.Toggle>

                                      <Dropdown.Menu
                                        className="w-100"
                                        variant="dark"
                                      >
                                        <Dropdown.Item
                                          href="#"
                                          onClick={() => {
                                            setFieldValue(
                                              "Status",
                                              "KHACH_KHONG_DEN",
                                              formikProps.submitForm()
                                            );
                                          }}
                                        >
                                          Khách không đến
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                          className="text-danger"
                                          href="#"
                                          onClick={() => onDelete(values)}
                                        >
                                          Khách hủy lịch
                                        </Dropdown.Item>
                                      </Dropdown.Menu>
                                    </Dropdown>

                                    <button
                                      type="button"
                                      className={`btn btn-sm btn-primary ml-2 flex-1 text-truncate ${
                                        btnLoading.isBtnFinish
                                          ? "spinner spinner-white spinner-right"
                                          : ""
                                      } w-auto my-0 mr-0 h-auto`}
                                      disabled={btnLoading.isBtnFinish}
                                      onClick={() => onFinish(values)}
                                    >
                                      {initialValue?.ID && initialValue?.AtHome
                                        ? "Khách có đến"
                                        : "Khách đến"}
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {values?.CreateBy &&
                        window?.top?.GlobalConfig?.Admin?.kpiChot && (
                          <button
                            type="button"
                            onClick={onChangeStatusTele}
                            className={`btn btn-sm btn-secondary ml-2 ${
                              loading
                                ? "spinner spinner-white spinner-right"
                                : ""
                            } w-auto my-0 h-auto`}
                            disabled={loading}
                          >
                            Khách chốt
                          </button>
                        )}
                    </div>
                  </Modal.Footer>
                )}

                <ModalCreateMember
                  show={isModalCreate}
                  onHide={() => setIsModalCreate(false)}
                  initialDefault={initialCreate}
                  onSubmit={(valuesCreate) => {
                    setFieldValue("MemberID", {
                      label: valuesCreate.PassersBy
                        ? "Khách vãng lai"
                        : valuesCreate.FullName,
                      text: valuesCreate.FullName,
                      value: valuesCreate.PassersBy ? 0 : null,
                      suffix: valuesCreate.Phone,
                      isCreate: true,
                      PassersBy: valuesCreate.PassersBy,
                    });
                    setFieldValue("FullName", valuesCreate.FullName);
                    setFieldValue("Phone", valuesCreate.Phone);
                    setIsModalCreate(false);
                  }}
                />
              </Form>
            );
          }}
        </Formik>
      </Modal>
    </Fragment>
  );
}

export default ModalMassageCalendar;
