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

moment.locale(); // vi

function BounsSalesIn({ OrderInfo, onSubmit }) {
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
        } = formikProps;

        return (
          <Form>
            <div className="d-md-none">
              {values &&
                values.BounsSalesIn &&
                values.BounsSalesIn.map((item, index) => (
                  <div className="border rounded mb-3" key={index}>
                    <div className="p-3 border-bottom line-height-sm font-weight-boldest w-100 line-height-lg bg-light">
                      {item.Product.ProdTitle}
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
                                <div
                                  className="d-flex align-items-center my-3"
                                  key={idx}
                                >
                                  <div className="mb-1 w-150px pe-2">
                                    <label className="text-truncate line-height-md font-weight-500 w-100">
                                      {sub.User.FullName}
                                    </label>
                                    <div
                                      className="text-muted line-height-sm"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {moment(sub.CreateDate).format(
                                        "DD.MM.YYYY"
                                      )}{" "}
                                      - <span>#{sub.ID}</span>
                                    </div>
                                  </div>
                                  <NumberFormat
                                    allowNegative={false}
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
                                      window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao
                                        ? UserID !== 1
                                        : !sub.chinh_sua
                                    }
                                  />
                                  {window.top?.GlobalConfig?.Admin
                                    ?.thuong_ds_nang_cao
                                    ? UserID === 1 && (
                                        <div
                                          className="text-danger w-30px text-end cursor-pointer pl-5px font-size-sm"
                                          onClick={() =>
                                            arrayHelpers.remove(idx)
                                          }
                                        >
                                          Xóa
                                        </div>
                                      )
                                    : sub.chinh_sua && (
                                        <div
                                          className="text-danger w-30px text-end cursor-pointer pl-5px font-size-sm"
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
                                <div
                                  className="d-flex align-items-center my-3"
                                  key={idx}
                                >
                                  <div className="mb-1 w-150px pe-2">
                                    <label className="text-truncate line-height-md font-weight-500 w-100">
                                      {sub.User.FullName}
                                    </label>
                                    <div
                                      className="text-muted line-height-sm"
                                      style={{ fontSize: "12px" }}
                                    >
                                      {moment(sub.CreateDate).format(
                                        "DD.MM.YYYY"
                                      )}{" "}
                                      - <span>#{sub.ID}</span>
                                    </div>
                                  </div>
                                  <NumberFormat
                                    allowNegative={false}
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
                                      window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao
                                        ? UserID !== 1
                                        : !sub.chinh_sua
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
                                        : !sub.chinh_sua
                                    }
                                  />
                                  {window.top?.GlobalConfig?.Admin
                                    ?.thuong_ds_nang_cao
                                    ? UserID === 1 && (
                                        <div
                                          className="text-danger w-30px text-end cursor-pointer pl-5px font-size-sm"
                                          onClick={() =>
                                            arrayHelpers.remove(idx)
                                          }
                                        >
                                          Xóa
                                        </div>
                                      )
                                    : sub.chinh_sua && (
                                        <div
                                          className="text-danger w-30px text-end cursor-pointer pl-5px font-size-sm"
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
            <div className="d-none d-md-block">
              <Table className="mb-0" bordered responsive>
                <thead>
                  <tr>
                    <th className="min-w-200px w-30">Sản phẩm</th>
                    <th className="min-w-300px text-center w-35">Hoa hồng</th>
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
                                  className="d-flex align-items-center my-3"
                                  key={idx}
                                >
                                  <div className="mb-1 w-180px pe-2">
                                    <label className="text-truncate line-height-sm font-weight-boldest w-100">
                                      {sub.User.FullName}
                                    </label>
                                    <div className="text-muted line-height-sm">
                                      {moment(sub.CreateDate).format(
                                        "DD.MM.YYYY"
                                      )}{" "}
                                      - <span>#{sub.ID}</span>
                                    </div>
                                  </div>
                                  <NumberFormat
                                    allowNegative={false}
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
                                      window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao
                                        ? UserID !== 1
                                        : !sub.chinh_sua
                                    }
                                  />
                                  {window.top?.GlobalConfig?.Admin
                                    ?.thuong_ds_nang_cao
                                    ? UserID === 1 && (
                                        <div
                                          className="text-danger w-30px text-end cursor-pointer"
                                          onClick={() =>
                                            arrayHelpers.remove(idx)
                                          }
                                        >
                                          Xóa
                                        </div>
                                      )
                                    : sub.chinh_sua && (
                                        <div
                                          className="text-danger w-30px text-end cursor-pointer"
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
                                  className="d-flex align-items-center my-3"
                                  key={idx}
                                >
                                  <div className="mb-1 w-180px pe-2">
                                    <label className="text-truncate line-height-sm font-weight-boldest w-100">
                                      {sub.User.FullName}
                                    </label>
                                    <div className="text-muted line-height-sm">
                                      {moment(sub.CreateDate).format(
                                        "DD.MM.YYYY"
                                      )}{" "}
                                      - <span>#{sub.ID}</span>
                                    </div>
                                  </div>
                                  <NumberFormat
                                    allowNegative={false}
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
                                      window.top?.GlobalConfig?.Admin
                                        ?.thuong_ds_nang_cao
                                        ? UserID !== 1
                                        : !sub.chinh_sua
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
                                        : !sub.chinh_sua
                                    }
                                  />
                                  {window.top?.GlobalConfig?.Admin
                                    ?.thuong_ds_nang_cao
                                    ? UserID === 1 && (
                                        <div
                                          className="text-danger w-30px text-end cursor-pointer"
                                          onClick={() =>
                                            arrayHelpers.remove(idx)
                                          }
                                        >
                                          Xóa
                                        </div>
                                      )
                                    : sub.chinh_sua && (
                                        <div
                                          className="text-danger w-30px text-end cursor-pointer"
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
            <AutoSubmit
              values={values}
              submitForm={submitForm}
              initialValues={initialValues}
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
