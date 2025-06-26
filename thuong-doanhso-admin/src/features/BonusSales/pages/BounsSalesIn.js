import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { OverlayTrigger, Popover, Table } from "react-bootstrap";
import { formatVND } from "../../../helpers/FormatHelpers";
import { Formik, FieldArray, Form } from "formik";
import NumberFormat from "react-number-format";
import moment from "moment";
import AutoSubmit from "../components/AutoSubmit";
import { useSelector } from "react-redux";
import SelectType from "../components/SelectType";
import { useRoles } from "../../../helpers/useRoles";
import DatePicker from "react-datepicker";
import vi from "date-fns/locale/vi";
import "../../../_assets/plugins/react-datepicker/react-datepicker.css";
import BonusSaleCrud from "../_redux/BonusSaleCrud";
import * as Yup from "yup";
import clsx from "clsx";

moment.locale(); // vi

const UpdateSchema = Yup.object().shape({
  date: Yup.string().required("Vui lòng chọn ngày"),
});

const PickerDate = ({ children, sub, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const onSubmit = (values) => {
    setLoading(true);
    BonusSaleCrud.changeCashOrder({
      ...values,
      date: moment(values.date).format("YYYY-MM-DD"),
    })
      .then((res) => {
        onRefresh(() => {
          setLoading(false);
          window?.top?.toastr &&
            window?.top?.toastr.success("Cập nhật thành công.", "", {
              timeOut: 1000,
            });
          document.body.click();
        });
      })
      .catch((error) => console.log(error));
  };
  return (
    <OverlayTrigger
      rootClose
      trigger="click"
      placement="top"
      overlay={
        <Popover id="popover-positioned-top" title="Popover top">
          <Popover.Body className="p-0">
            <Formik
              enableReinitialize
              initialValues={{
                id: sub.ID,
                date: new Date(sub.CreateDate),
              }}
              onSubmit={onSubmit}
              validationSchema={UpdateSchema}
            >
              {(formikProps) => {
                const {
                  values,
                  handleBlur,
                  setFieldValue,
                  errors,
                  touched,
                } = formikProps;
                return (
                  <Form>
                    <div className="p-3" style={{ width: "250px" }}>
                      <div className="mb-3">
                        <DatePicker
                          name="date"
                          locale={vi}
                          className={clsx(
                            "w-100 transition bg-white border rounded outline-none disabled:bg-gray-200 disabled:border-gray-200 border-gray-300",
                            errors.date && touched.date && "error"
                          )}
                          //popperContainer={CalendarContainer}
                          timeIntervals={5}
                          placeholderText="Chọn ngày"
                          onChange={(val) => {
                            setFieldValue(`date`, val, false);
                          }}
                          selected={values.date ? values.date : null}
                          onBlur={handleBlur}
                          dateFormat="dd-MM-yyyy"
                        />
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{
                          padding: "0.62rem 0.75rem",
                          fontSize: "13px",
                        }}
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Đang cập nhật" : "Cập nhật"}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </Popover.Body>
        </Popover>
      }
    >
      <span className="cursor-pointer">{children}</span>
    </OverlayTrigger>
  );
};

const PickerDateDS = ({ children, sub, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const onSubmit = (values) => {
    setLoading(true);
    BonusSaleCrud.changeCashOrderDs({
      ...values,
      date: moment(values.date).format("YYYY-MM-DD"),
    })
      .then((res) => {
        onRefresh(() => {
          setLoading(false);
          window?.top?.toastr &&
            window?.top?.toastr.success("Cập nhật thành công.", "", {
              timeOut: 1000,
            });
          document.body.click();
        });
      })
      .catch((error) => console.log(error));
  };
  return (
    <OverlayTrigger
      rootClose
      trigger="click"
      placement="top"
      overlay={
        <Popover id="popover-positioned-top" title="Popover top">
          <Popover.Body className="p-0">
            <Formik
              enableReinitialize
              initialValues={{
                id: sub.ID,
                date: new Date(sub.CreateDate),
              }}
              validationSchema={UpdateSchema}
              onSubmit={onSubmit}
            >
              {(formikProps) => {
                const {
                  values,
                  errors,
                  touched,
                  setFieldValue,
                  handleBlur,
                } = formikProps;
                return (
                  <Form>
                    <div className="p-3" style={{ width: "250px" }}>
                      <div className="mb-3">
                        <DatePicker
                          name="date"
                          locale={vi}
                          className={clsx(
                            "w-100 transition bg-white border rounded outline-none disabled:bg-gray-200 disabled:border-gray-200 border-gray-300",
                            errors.date && touched.date && "error"
                          )}
                          //popperContainer={CalendarContainer}
                          timeIntervals={5}
                          placeholderText="Chọn ngày"
                          onChange={(val) => {
                            setFieldValue(`date`, val, false);
                          }}
                          onBlur={handleBlur}
                          selected={values.date ? values.date : null}
                          dateFormat="dd-MM-yyyy"
                        />
                      </div>
                      <button
                        className="btn btn-primary"
                        style={{
                          padding: "0.62rem 0.75rem",
                          fontSize: "13px",
                        }}
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? "Đang cập nhật" : "Cập nhật"}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </Popover.Body>
        </Popover>
      }
    >
      <span className="cursor-pointer">{children}</span>
    </OverlayTrigger>
  );
};

function BounsSalesIn({ OrderInfo, onSubmit, onRefresh, loading, setLoading }) {
  const { UserID } = useSelector(({ Auth }) => ({
    UserID: Auth?.User?.ID,
  }));
  const [initialValues, setInitialValues] = useState({
    BounsSalesIn: [],
  });

  useEffect(() => {
    if (OrderInfo) {
      const { doanh_so, hoa_hong, oiItems } = OrderInfo;
      const newObj =
        oiItems && oiItems.length > 0
          ? oiItems.map((product) => {
              const Hoa_hong_arr = hoa_hong.filter(
                (item) => item.SubSourceID === product.ID
              );
              const Doanh_so_arr = doanh_so
                .filter((item) => item.OrderItemID === product.ID)
                .map((x) => ({
                  ...x,
                  Type: { label: "Loại " + x.KpiType, value: x.KpiType },
                }));

              return {
                Product: product,
                Hoa_Hong: Hoa_hong_arr,
                Doanh_So: Doanh_so_arr,
              };
            })
          : [];
      setInitialValues((prevState) => ({
        ...prevState,
        BounsSalesIn: newObj,
      }));
    }
  }, [OrderInfo]);

  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  let isHiddenPrice = false;

  if (window.top?.GlobalConfig?.Admin.hoa_hong_an_gia) {
    if (!adminTools_byStock?.hasRight) isHiddenPrice = true;
  }

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      {(formikProps) => {
        const {
          values,
          submitForm,
          handleBlur,
          setFieldValue,
          initialValues,
          errors,
        } = formikProps;

        return (
          <Form className="position-relative">
            {loading && (
              <div
                className="top-0 left-0 position-absolute w-100 h-100 d-flex align-items-center justify-content-center"
                style={{
                  background: "rgb(255 255 255 / 40%)",
                  zIndex: 10,
                }}
              >
                <div role="status">
                  <svg
                    aria-hidden="true"
                    style={{
                      width: "3rem",
                      fill: "#1c64f2",
                      color: "#e6e7eb",
                      animation: "spinner-border .75s linear infinite",
                    }}
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                </div>
              </div>
            )}
            <div className="d-md-none">
              {values &&
                values.BounsSalesIn &&
                values.BounsSalesIn.map((item, index) => (
                  <div className="mb-3 border rounded" key={index}>
                    <div className="p-3 border-bottom line-height-sm font-weight-boldest w-100 line-height-lg bg-light">
                      {item.Product.ProdTitle}
                      {((item.Hoa_Hong && item.Hoa_Hong.length > 0) ||
                        (item.Doanh_So && item.Doanh_So.length > 0)) && (
                        <span
                          className="cursor-pointer text-danger pl-5px"
                          style={{ fontWeight: "400" }}
                          onClick={() => {
                            setFieldValue(
                              `BounsSalesIn[${index}].Hoa_Hong`,
                              [],
                              false
                            );
                            setFieldValue(
                              `BounsSalesIn[${index}].Doanh_So`,
                              [],
                              false
                            );
                          }}
                        >
                          [Xoá]
                        </span>
                      )}
                      <OverlayTrigger
                        trigger="click"
                        placement="bottom"
                        overlay={
                          <Popover
                            id="popover-trigger-click"
                            title="Popover bottom"
                          >
                            <div className="p-3">
                              <div className="fw-bolder mb-10px">
                                {item.Product.ProdTitle}
                              </div>
                              <div>
                                SL : {item.Product.Qty} *{" "}
                                {formatVND(item.Product.don_gia)} ={" "}
                                {formatVND(item.Product.ToPay)}
                              </div>
                            </div>
                          </Popover>
                        }
                      >
                        <span className="ml-10px">
                          <i className="fa-sharp fa-solid fa-circle-info text-warning"></i>
                        </span>
                      </OverlayTrigger>
                    </div>
                    <div className="p-3 border-bottom">
                      <div className="text-truncate font-weight-boldest w-100 text-muted">
                        Hoa hồng
                      </div>
                      <div>
                        {item.Hoa_Hong && item.Hoa_Hong.length > 0 ? (
                          <FieldArray
                            name={`BounsSalesIn[${index}].Hoa_Hong`}
                            render={(arrayHelpers) =>
                              item.Hoa_Hong &&
                              item.Hoa_Hong.map((sub, idx) => (
                                <div className="my-3" key={idx}>
                                  <div className="mb-2 w-100">
                                    <label className="text-truncate line-height-md font-weight-500 w-100">
                                      {sub.User.FullName}
                                    </label>
                                    <div
                                      className="text-muted line-height-sm"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {(window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao &&
                                        UserID === 1) ||
                                      (!window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao &&
                                        adminTools_byStock?.hasRight) ? (
                                        <>
                                          <PickerDate
                                            onRefresh={onRefresh}
                                            sub={sub}
                                          >
                                            <span className="cursor-pointer">
                                              {moment(sub.CreateDate).format(
                                                "DD.MM.YYYY"
                                              )}
                                            </span>
                                          </PickerDate>
                                        </>
                                      ) : (
                                        <span className="cursor-pointer">
                                          {moment(sub.CreateDate).format(
                                            "DD.MM.YYYY"
                                          )}
                                        </span>
                                      )}{" "}
                                      {/* {adminTools_byStock?.hasRight ||
                                      sub.chinh_sua ? (
                                        <PickerDate
                                          onRefresh={onRefresh}
                                          sub={sub}
                                        >
                                          <span className="cursor-pointer">
                                            {moment(sub.CreateDate).format(
                                              "DD.MM.YYYY"
                                            )}
                                          </span>
                                        </PickerDate>
                                      ) : (
                                        <span className="cursor-pointer">
                                          {moment(sub.CreateDate).format(
                                            "DD.MM.YYYY"
                                          )}
                                        </span>
                                      )}{" "} */}
                                      - <span>#{sub.ID}</span>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center w-100">
                                    <NumberFormat
                                      type={isHiddenPrice ? "password" : "text"}
                                      allowNegative
                                      name={`BounsSalesIn[${index}].Hoa_Hong[${idx}].Value`}
                                      placeholder={"Nhập giá trị"}
                                      className={`form-control flex-1`}
                                      isNumericString={true}
                                      thousandSeparator={true}
                                      value={sub.Value}
                                      onValueChange={(val) => {
                                        setFieldValue(
                                          `BounsSalesIn[${index}].Hoa_Hong[${idx}].Value`,
                                          val.floatValue
                                            ? val.floatValue
                                            : val.value,
                                          false
                                        );
                                      }}
                                      onBlur={handleBlur}
                                      disabled={
                                        (window.top?.GlobalConfig?.Admin
                                          ?.thuong_ds_nang_cao
                                          ? UserID !== 1
                                          : !(
                                              adminTools_byStock?.hasRight ||
                                              moment(sub.CreateDate).format(
                                                "DD-MM-YYYY"
                                              ) ===
                                                moment().format("DD-MM-YYYY")
                                            )) || isHiddenPrice
                                      }
                                    />
                                    {window.top?.GlobalConfig?.Admin
                                      ?.thuong_ds_nang_cao
                                      ? UserID === 1 && (
                                          <div
                                            className="cursor-pointer text-danger w-30px text-end pl-5px font-size-sm"
                                            onClick={() =>
                                              arrayHelpers.remove(idx)
                                            }
                                          >
                                            Xóa
                                          </div>
                                        )
                                      : (adminTools_byStock?.hasRight ||
                                          moment(sub.CreateDate).format(
                                            "DD-MM-YYYY"
                                          ) ===
                                            moment().format("DD-MM-YYYY")) && (
                                          <div
                                            className="cursor-pointer text-danger w-30px text-end pl-5px font-size-sm"
                                            onClick={() =>
                                              arrayHelpers.remove(idx)
                                            }
                                          >
                                            Xóa
                                          </div>
                                        )}
                                  </div>
                                </div>
                              ))
                            }
                          />
                        ) : (
                          <div className="mt-5px font-size-sm">
                            Chưa có thưởng hoa hồng
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-truncate font-weight-boldest w-100 text-muted">
                        Doanh số
                      </div>
                      <div>
                        {item.Doanh_So && item.Doanh_So.length > 0 ? (
                          <FieldArray
                            name={`BounsSalesIn[${index}].Doanh_So`}
                            render={(arrayHelpers) =>
                              item.Doanh_So &&
                              item.Doanh_So.map((sub, idx) => (
                                <div className="my-3" key={idx}>
                                  <div className="mb-2 w-100">
                                    <label className="text-truncate line-height-md font-weight-500 w-100">
                                      {sub.User.FullName}
                                    </label>
                                    <div
                                      className="text-muted line-height-sm"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {(window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao &&
                                        UserID === 1) ||
                                      (!window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao &&
                                        adminTools_byStock?.hasRight) ? (
                                        <>
                                          <PickerDate
                                            onRefresh={onRefresh}
                                            sub={sub}
                                          >
                                            <span className="cursor-pointer">
                                              {moment(sub.CreateDate).format(
                                                "DD.MM.YYYY"
                                              )}
                                            </span>
                                          </PickerDate>
                                        </>
                                      ) : (
                                        <span className="cursor-pointer">
                                          {moment(sub.CreateDate).format(
                                            "DD.MM.YYYY"
                                          )}
                                        </span>
                                      )}{" "}
                                      {/* {adminTools_byStock?.hasRight ||
                                      sub.chinh_sua ? (
                                        <PickerDateDS
                                          onRefresh={onRefresh}
                                          sub={sub}
                                        >
                                          <span className="cursor-pointer">
                                            {moment(sub.CreateDate).format(
                                              "DD.MM.YYYY"
                                            )}
                                          </span>
                                        </PickerDateDS>
                                      ) : (
                                        <span className="cursor-pointer">
                                          {moment(sub.CreateDate).format(
                                            "DD.MM.YYYY"
                                          )}
                                        </span>
                                      )}{" "} */}
                                      - <span>#{sub.ID}</span>
                                    </div>
                                  </div>
                                  <NumberFormat
                                    type={isHiddenPrice ? "password" : "text"}
                                    allowNegative
                                    name={`BounsSalesIn[${index}].Doanh_So[${idx}].Value`}
                                    placeholder={"Nhập giá trị"}
                                    className={`form-control`}
                                    isNumericString={true}
                                    thousandSeparator={true}
                                    value={sub.Value}
                                    onValueChange={(val) => {
                                      setFieldValue(
                                        `BounsSalesIn[${index}].Doanh_So[${idx}].Value`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      );
                                    }}
                                    onBlur={handleBlur}
                                    disabled={
                                      (window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao
                                        ? UserID !== 1
                                        : !(
                                            adminTools_byStock?.hasRight ||
                                            moment(sub.CreateDate).format(
                                              "DD-MM-YYYY"
                                            ) === moment().format("DD-MM-YYYY")
                                          )) || isHiddenPrice
                                    }
                                  />
                                  <SelectType
                                    className="mt-2 select-control"
                                    name={`BounsSalesIn[${index}].Doanh_So[${idx}].Type`}
                                    value={sub.Type}
                                    placeholder="Chọn loại"
                                    onChange={(option) => {
                                      setFieldValue(
                                        `BounsSalesIn[${index}].Doanh_So[${idx}].Type`,
                                        option,
                                        false
                                      );
                                    }}
                                    isDisabled={
                                      window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao
                                        ? UserID !== 1
                                        : !(
                                            adminTools_byStock?.hasRight ||
                                            moment(sub.CreateDate).format(
                                              "DD-MM-YYYY"
                                            ) === moment().format("DD-MM-YYYY")
                                          )
                                    }
                                  />
                                  <div className="mt-2">
                                    {window.top?.GlobalConfig?.Admin
                                      ?.thuong_ds_nang_cao
                                      ? UserID === 1 && (
                                          <div
                                            className="cursor-pointer text-danger w-30px text-end pl-5px font-size-sm"
                                            onClick={() =>
                                              arrayHelpers.remove(idx)
                                            }
                                          >
                                            Xóa
                                          </div>
                                        )
                                      : (adminTools_byStock?.hasRight ||
                                          moment(sub.CreateDate).format(
                                            "DD-MM-YYYY"
                                          ) ===
                                            moment().format("DD-MM-YYYY")) && (
                                          <div
                                            className="cursor-pointer text-danger w-30px text-end pl-5px font-size-sm"
                                            onClick={() =>
                                              arrayHelpers.remove(idx)
                                            }
                                          >
                                            Xóa
                                          </div>
                                        )}
                                  </div>
                                </div>
                              ))
                            }
                          />
                        ) : (
                          <div className="mt-5px font-size-sm">
                            Chưa có thưởng doanh số
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="d-none d-md-block position-relative">
              <Table className="mb-0" bordered responsive>
                <thead>
                  <tr>
                    <th className="min-w-200px w-30">Sản phẩm</th>
                    <th className="text-center min-w-300px w-35">Hoa hồng</th>
                    <th
                      className="text-center w-35"
                      style={{
                        minWidth: window.top?.GlobalConfig?.Admin
                          ?.thuong_ds_theo_loai
                          ? "550px"
                          : "300px",
                      }}
                    >
                      Doanh số
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {values &&
                    values.BounsSalesIn &&
                    values.BounsSalesIn.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <div className="fw-bolder mb-10px">
                              {item.Product.ProdTitle}
                              {((item.Hoa_Hong && item.Hoa_Hong.length > 0) ||
                                (item.Doanh_So &&
                                  item.Doanh_So.length > 0)) && (
                                <span
                                  className="cursor-pointer text-danger pl-5px"
                                  style={{ fontWeight: "400" }}
                                  onClick={() => {
                                    setFieldValue(
                                      `BounsSalesIn[${index}].Hoa_Hong`,
                                      [],
                                      false
                                    );
                                    setFieldValue(
                                      `BounsSalesIn[${index}].Doanh_So`,
                                      [],
                                      false
                                    );
                                  }}
                                >
                                  [Xoá]
                                </span>
                              )}
                            </div>
                            <div>
                              SL : {item.Product.Qty} *{" "}
                              {formatVND(item.Product.don_gia)} ={" "}
                              {formatVND(item.Product.ToPay)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <FieldArray
                            name={`BounsSalesIn[${index}].Hoa_Hong`}
                            render={(arrayHelpers) =>
                              item.Hoa_Hong &&
                              item.Hoa_Hong.map((sub, idx) => (
                                <div
                                  className="my-3 d-flex align-items-center"
                                  key={idx}
                                >
                                  <div className="mb-1 w-180px pe-2">
                                    <label className="text-truncate line-height-sm font-weight-boldest w-100">
                                      {sub.User.FullName}
                                    </label>
                                    <div className="text-muted line-height-sm">
                                      {(window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao &&
                                        UserID === 1) ||
                                      (!window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao &&
                                        adminTools_byStock?.hasRight) ? (
                                        <>
                                          <PickerDate
                                            onRefresh={onRefresh}
                                            sub={sub}
                                          >
                                            <span className="cursor-pointer">
                                              {moment(sub.CreateDate).format(
                                                "DD.MM.YYYY"
                                              )}
                                            </span>
                                          </PickerDate>
                                        </>
                                      ) : (
                                        <span className="cursor-pointer">
                                          {moment(sub.CreateDate).format(
                                            "DD.MM.YYYY"
                                          )}
                                        </span>
                                      )}{" "}
                                      {/* {adminTools_byStock?.hasRight ||
                                      moment(sub.CreateDate).format(
                                        "DD-MM-YYYY"
                                      ) === moment().format("DD-MM-YY") ? (
                                        <PickerDate
                                          onRefresh={onRefresh}
                                          sub={sub}
                                        >
                                          <span className="cursor-pointer">
                                            {moment(sub.CreateDate).format(
                                              "DD.MM.YYYY"
                                            )}
                                          </span>
                                        </PickerDate>
                                      ) : (
                                        <span className="cursor-pointer">
                                          {moment(sub.CreateDate).format(
                                            "DD.MM.YYYY"
                                          )}
                                        </span>
                                      )}{" "} */}
                                      - <span>#{sub.ID}</span>
                                    </div>
                                  </div>
                                  <NumberFormat
                                    type={isHiddenPrice ? "password" : "text"}
                                    allowNegative
                                    name={`BounsSalesIn[${index}].Hoa_Hong[${idx}].Value`}
                                    placeholder={"Nhập giá trị"}
                                    className={`form-control flex-1`}
                                    isNumericString={true}
                                    thousandSeparator={true}
                                    value={sub.Value}
                                    onValueChange={(val) => {
                                      setFieldValue(
                                        `BounsSalesIn[${index}].Hoa_Hong[${idx}].Value`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      );
                                    }}
                                    onBlur={handleBlur}
                                    disabled={
                                      (window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao
                                        ? UserID !== 1
                                        : !(
                                            adminTools_byStock?.hasRight ||
                                            moment(sub.CreateDate).format(
                                              "DD-MM-YYYY"
                                            ) === moment().format("DD-MM-YYYY")
                                          )) || isHiddenPrice
                                    }
                                  />
                                  {window.top?.GlobalConfig?.Admin
                                    ?.thuong_ds_nang_cao
                                    ? UserID === 1 && (
                                        <div
                                          className="cursor-pointer text-danger w-30px text-end"
                                          onClick={() =>
                                            arrayHelpers.remove(idx)
                                          }
                                        >
                                          Xóa
                                        </div>
                                      )
                                    : (adminTools_byStock?.hasRight ||
                                        moment(sub.CreateDate).format(
                                          "DD-MM-YYYY"
                                        ) ===
                                          moment().format("DD-MM-YYYY")) && (
                                        <div
                                          className="cursor-pointer text-danger w-30px text-end"
                                          onClick={() =>
                                            arrayHelpers.remove(idx)
                                          }
                                        >
                                          Xóa
                                        </div>
                                      )}
                                </div>
                              ))
                            }
                          />
                        </td>
                        <td>
                          <FieldArray
                            name={`BounsSalesIn[${index}].Doanh_So`}
                            render={(arrayHelpers) =>
                              item.Doanh_So &&
                              item.Doanh_So.map((sub, idx) => (
                                <div
                                  className="my-3 d-flex align-items-center"
                                  key={idx}
                                >
                                  <div className="mb-1 w-180px pe-2">
                                    <label className="text-truncate line-height-sm font-weight-boldest w-100">
                                      {sub.User.FullName}
                                    </label>
                                    <div className="text-muted line-height-sm">
                                      {(window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao &&
                                        UserID === 1) ||
                                      (!window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao &&
                                        adminTools_byStock?.hasRight) ? (
                                        <>
                                          <PickerDateDS
                                            onRefresh={onRefresh}
                                            sub={sub}
                                          >
                                            <span className="cursor-pointer">
                                              {moment(sub.CreateDate).format(
                                                "DD.MM.YYYY"
                                              )}
                                            </span>
                                          </PickerDateDS>
                                        </>
                                      ) : (
                                        <span className="cursor-pointer">
                                          {moment(sub.CreateDate).format(
                                            "DD.MM.YYYY"
                                          )}
                                        </span>
                                      )}{" "}
                                      {/* {adminTools_byStock?.hasRight ||
                                      sub.chinh_sua ? (
                                        <PickerDateDS
                                          onRefresh={onRefresh}
                                          sub={sub}
                                        >
                                          <span className="cursor-pointer">
                                            {moment(sub.CreateDate).format(
                                              "DD.MM.YYYY"
                                            )}
                                          </span>
                                        </PickerDateDS>
                                      ) : (
                                        <span className="cursor-pointer">
                                          {moment(sub.CreateDate).format(
                                            "DD.MM.YYYY"
                                          )}
                                        </span>
                                      )}{" "} */}
                                      - <span>#{sub.ID}</span>
                                    </div>
                                  </div>
                                  <NumberFormat
                                    type={isHiddenPrice ? "password" : "text"}
                                    allowNegative
                                    name={`BounsSalesIn[${index}].Doanh_So[${idx}].Value`}
                                    placeholder={"Nhập giá trị"}
                                    className={`form-control flex-1`}
                                    isNumericString={true}
                                    thousandSeparator={true}
                                    value={sub.Value}
                                    onValueChange={(val) => {
                                      setFieldValue(
                                        `BounsSalesIn[${index}].Doanh_So[${idx}].Value`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      );
                                    }}
                                    onBlur={handleBlur}
                                    disabled={
                                      (window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao
                                        ? UserID !== 1
                                        : !(
                                            adminTools_byStock?.hasRight ||
                                            moment(sub.CreateDate).format(
                                              "DD-MM-YYYY"
                                            ) === moment().format("DD-MM-YYYY")
                                          )) || isHiddenPrice
                                    }
                                  />
                                  <SelectType
                                    name={`BounsSalesIn[${index}].Doanh_So[${idx}].Type`}
                                    value={sub.Type}
                                    placeholder="Chọn loại"
                                    onChange={(option) => {
                                      setFieldValue(
                                        `BounsSalesIn[${index}].Doanh_So[${idx}].Type`,
                                        option,
                                        false
                                      );
                                    }}
                                    isDisabled={
                                      window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao
                                        ? UserID !== 1
                                        : !(
                                            adminTools_byStock?.hasRight ||
                                            moment(sub.CreateDate).format(
                                              "DD-MM-YYYY"
                                            ) === moment().format("DD-MM-YYYY")
                                          )
                                    }
                                  />
                                  {window.top?.GlobalConfig?.Admin
                                    ?.thuong_ds_nang_cao
                                    ? UserID === 1 && (
                                        <div
                                          className="cursor-pointer text-danger w-30px text-end"
                                          onClick={() =>
                                            arrayHelpers.remove(idx)
                                          }
                                        >
                                          Xóa
                                        </div>
                                      )
                                    : (adminTools_byStock?.hasRight ||
                                        moment(sub.CreateDate).format(
                                          "DD-MM-YYYY"
                                        ) ===
                                          moment().format("DD-MM-YYYY")) && (
                                        <div
                                          className="cursor-pointer text-danger w-30px text-end"
                                          onClick={() =>
                                            arrayHelpers.remove(idx)
                                          }
                                        >
                                          Xóa
                                        </div>
                                      )}
                                </div>
                              ))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
            {/* <div className="mt-3 d-flex justify-content-end">
              <button
                className="btn btn-primary"
                disabled={loading}
                type="submit"
              >
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div> */}
            <AutoSubmit
              values={values}
              submitForm={submitForm}
              initialValues={initialValues}
              setLoading={setLoading}
              errors={errors}
            />
          </Form>
        );
      }}
    </Formik>
  );
}

BounsSalesIn.propTypes = {
  OrderInfo: PropTypes.object,
  onSubmit: PropTypes.func,
};

export default BounsSalesIn;
