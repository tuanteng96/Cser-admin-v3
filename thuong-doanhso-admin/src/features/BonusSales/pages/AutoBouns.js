import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { OverlayTrigger, Popover, Table } from "react-bootstrap";
import { formatVND } from "../../../helpers/FormatHelpers";
import { Formik, FieldArray, Form } from "formik";
import NumberFormat from "react-number-format";
import moment from "moment";
import SelectType from "../components/SelectType";
import { useRoles } from "../../../helpers/useRoles";
moment.locale(); // vi

function AutoBouns({ OrderInfo, onSubmit, loading }) {
  const [initialValues, setInitialValues] = useState({
    AutoBouns: [],
  });

  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  useEffect(() => {
    if (OrderInfo) {
      const { doanh_so, hoa_hong, oiItems } = OrderInfo;
      let newObj =
        oiItems && oiItems.length > 0
          ? oiItems.map((product) => {
              const Hoa_hong_arr = hoa_hong
                .filter((item) => item.SubSourceID === product.ID)
                .reduce((r, { Value, User, SubSourceID, ID }) => {
                  var temp = r.find((o) => o.User.ID === User.ID);
                  if (!temp) {
                    r.push({ Value, User, SubSourceID, ID });
                  } else {
                    temp.Value += Value;
                  }
                  return r;
                }, []);

              const T_Hoa_hong_arr = Hoa_hong_arr.map(
                (item) => item.Value
              ).reduce((prev, curr) => prev + curr, 0);
              const Doanh_so_arr = doanh_so
                .filter((item) => item.OrderItemID === product.ID)
                .reduce((r, { Value, User, OrderItemID, ID, KpiType }) => {
                  var temp = r.find((o) => o.User.ID === User.ID);
                  if (!temp) {
                    r.push({
                      Value,
                      User,
                      OrderItemID,
                      ID,
                      Type: KpiType
                        ? { label: "Loại " + KpiType, value: KpiType }
                        : "",
                    });
                  } else {
                    temp.Value += Value;
                  }
                  return r;
                }, []);

              const T_Doanh_so_arr = Doanh_so_arr.map(
                (item) => item.Value
              ).reduce((prev, curr) => prev + curr, 0);

              const new_Hoa_hong = Hoa_hong_arr.map((item) => ({
                SubSourceID: item.SubSourceID,
                User: item.User,
                Value: Math.round(
                  product.lan_thanh_toan?.thanh_toan_hien_tai *
                    (item.Value / product.lan_thanh_toan?.lan_thanh_toan_truoc)
                ),
              }));
              const new_Doanh_so = Doanh_so_arr.map((item) => ({
                OrderItemID: item.OrderItemID,
                User: item.User,
                Value: Math.round(
                  product.gia_tri_doanh_so * (item.Value / T_Doanh_so_arr)
                ),
                Type: item.Type,
              }));

              return {
                Product: product,
                Hoa_Hong: [...new_Hoa_hong],
                Doanh_So: [...new_Doanh_so],
              };
            })
          : [];

      if (
        window.top?.GlobalConfig?.Admin?.cai_dat_phi?.visible &&
        window.top?.GlobalConfig?.Admin?.cai_dat_phi?.an_tinh_hs_ds
      ) {
        newObj = newObj.filter(
          (x) =>
            x.Product.ProdTitle !==
              window.top?.GlobalConfig?.Admin?.cai_dat_phi?.TIP?.ProdTitle &&
            x.Product.ProdTitle !==
              window.top?.GlobalConfig?.Admin?.cai_dat_phi?.PHIDICHVU?.ProdTitle &&
            x.Product.ProdTitle !==
              window.top?.GlobalConfig?.Admin?.cai_dat_phi?.PHIQUETTHE?.ProdTitle
        );
      }

      setInitialValues((prevState) => ({
        ...prevState,
        AutoBouns: newObj,
      }));
    }
  }, [OrderInfo]);

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
        const { values, handleBlur, setFieldValue } = formikProps;

        return (
          <Form>
            <div className="d-md-none">
              {values &&
                values.AutoBouns &&
                values.AutoBouns.map((item, index) => (
                  <div className="mb-3 border rounded" key={index}>
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
                                {item.Product.ProdTitle} - {item.Product.ID}
                              </div>
                              <div>
                                SL : {item.Product.Qty} *{" "}
                                {formatVND(item.Product.don_gia)} ={" "}
                                {formatVND(item.Product.ToPay)}
                              </div>
                              <div>
                                GT_DS:{" "}
                                {formatVND(item.Product.gia_tri_doanh_so)}
                              </div>
                              <div>
                                GT_TT:{" "}
                                {formatVND(item.Product.gia_tri_thanh_toan)}
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
                            name={`AutoBouns[${index}].Hoa_Hong`}
                            render={(arrayHelpers) =>
                              item.Hoa_Hong &&
                              item.Hoa_Hong.map((sub, idx) => (
                                <div
                                  className="my-3 d-flex align-items-center"
                                  key={idx}
                                >
                                  <div className="mb-1 w-120px pe-2">
                                    <label className="line-height-md font-weight-500 w-100">
                                      {sub.User.FullName}
                                    </label>
                                  </div>
                                  <NumberFormat
                                    type={isHiddenPrice ? "password" : "text"}
                                    allowNegative
                                    name={`AutoBouns[${index}].Hoa_Hong[${idx}].Value`}
                                    placeholder={"Nhập giá trị"}
                                    className={`form-control flex-1`}
                                    isNumericString={true}
                                    thousandSeparator={true}
                                    value={sub.Value}
                                    onValueChange={(val) => {
                                      setFieldValue(
                                        `AutoBouns[${index}].Hoa_Hong[${idx}].Value`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      );
                                    }}
                                    onBlur={handleBlur}
                                    disabled={isHiddenPrice}
                                  />
                                  <div
                                    className="cursor-pointer text-danger w-30px text-end pl-5px font-size-sm"
                                    onClick={() => arrayHelpers.remove(idx)}
                                  >
                                    Xóa
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
                    <div className="p-3">
                      <div className="text-truncate font-weight-boldest w-100 text-muted">
                        Doanh số
                      </div>
                      <div>
                        {item.Doanh_So && item.Doanh_So.length > 0 ? (
                          <FieldArray
                            name={`AutoBouns[${index}].Doanh_So`}
                            render={(arrayHelpers) =>
                              item.Doanh_So &&
                              item.Doanh_So.map((sub, idx) => (
                                <div
                                  className="my-4 d-flex align-items-center"
                                  key={idx}
                                >
                                  <div className="mb-1 w-120px pe-2">
                                    <label className="line-height-md font-weight-500 w-100">
                                      {sub.User.FullName}
                                    </label>
                                  </div>
                                  <NumberFormat
                                    type={isHiddenPrice ? "password" : "text"}
                                    allowNegative
                                    name={`AutoBouns[${index}].Doanh_So[${idx}].Value`}
                                    placeholder={"Nhập giá trị"}
                                    className={`form-control flex-1`}
                                    isNumericString={true}
                                    thousandSeparator={true}
                                    value={sub.Value}
                                    onValueChange={(val) => {
                                      setFieldValue(
                                        `AutoBouns[${index}].Doanh_So[${idx}].Value`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      );
                                    }}
                                    onBlur={handleBlur}
                                    disabled={isHiddenPrice}
                                  />
                                  <SelectType
                                    name={`AutoBouns[${index}].Doanh_So[${idx}].Type`}
                                    value={sub.Type}
                                    placeholder="Chọn loại"
                                    onChange={(option) => {
                                      setFieldValue(
                                        `AutoBouns[${index}].Doanh_So[${idx}].Type`,
                                        option,
                                        false
                                      );
                                    }}
                                  />
                                  <div
                                    className="cursor-pointer text-danger w-30px text-end pl-5px font-size-sm"
                                    onClick={() => arrayHelpers.remove(idx)}
                                  >
                                    Xóa
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
            <div className="d-none d-md-block">
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th className="min-w-200px w-30">Sản phẩm</th>
                    <th className="text-center min-w-300px w-35">Hoa hồng</th>
                    <th
                      className="text-center w-35"
                      style={{
                        minWidth: window.top?.GlobalConfig?.Admin
                          ?.thuong_ds_theo_loai
                          ? "450px"
                          : "300px",
                      }}
                    >
                      Doanh số
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {values &&
                    values.AutoBouns &&
                    values.AutoBouns.map((item, index) => (
                      <tr
                        key={index}
                        style={{
                          background:
                            values.AutoBouns &&
                            values.AutoBouns.some(
                              (x) => x.Product?.so_lan_thuong > 0
                            ) &&
                            item.Product?.so_lan_thuong === 0
                              ? "#FFF5F8"
                              : "#fff",
                        }}
                      >
                        <td>
                          <div>
                            <div className="fw-bolder">
                              {item.Product.ProdTitle} - {item.Product.ID}
                            </div>
                            <div>
                              SL : {item.Product.Qty} *{" "}
                              {formatVND(item.Product.don_gia)} ={" "}
                              {formatVND(item.Product.ToPay)}
                            </div>
                            <div>
                              GT_DS: {formatVND(item.Product.gia_tri_doanh_so)}
                            </div>
                            <div>
                              GT_TT:{" "}
                              {formatVND(item.Product.gia_tri_thanh_toan)}
                            </div>
                            <div
                              className="text-danger"
                              style={{
                                marginTop: "5px",
                                fontWeight: "500",
                              }}
                            >
                              {values.AutoBouns &&
                                values.AutoBouns.some(
                                  (x) => x.Product?.so_lan_thuong > 0
                                ) &&
                                item.Product?.so_lan_thuong === 0 && (
                                  <div>
                                    (*) Chưa có dữ liệu thưởng lần đầu cho sản
                                    phẩm này. Vui lòng tạo thưởng, doanh số thủ
                                    công cho sản phẩm này.
                                  </div>
                                )}
                            </div>
                          </div>
                        </td>
                        <td>
                          <FieldArray
                            name={`AutoBouns[${index}].Hoa_Hong`}
                            render={(arrayHelpers) =>
                              item.Hoa_Hong &&
                              item.Hoa_Hong.map((sub, idx) => (
                                <div
                                  className="my-3 d-flex align-items-center"
                                  key={idx}
                                >
                                  <div className="mb-1 w-120px pe-2">
                                    <label className="text-truncate line-height-sm font-weight-boldest w-100">
                                      {sub.User.FullName}
                                    </label>
                                  </div>
                                  <NumberFormat
                                    type={isHiddenPrice ? "password" : "text"}
                                    allowNegative
                                    name={`AutoBouns[${index}].Hoa_Hong[${idx}].Value`}
                                    placeholder={"Nhập giá trị"}
                                    className={`form-control flex-1`}
                                    isNumericString={true}
                                    thousandSeparator={true}
                                    value={sub.Value}
                                    onValueChange={(val) => {
                                      setFieldValue(
                                        `AutoBouns[${index}].Hoa_Hong[${idx}].Value`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      );
                                    }}
                                    onBlur={handleBlur}
                                    disabled={isHiddenPrice}
                                  />
                                  <div
                                    className="cursor-pointer text-danger w-30px text-end"
                                    onClick={() => arrayHelpers.remove(idx)}
                                  >
                                    Xóa
                                  </div>
                                </div>
                              ))
                            }
                          />
                        </td>
                        <td>
                          <FieldArray
                            name={`AutoBouns[${index}].Doanh_So`}
                            render={(arrayHelpers) =>
                              item.Doanh_So &&
                              item.Doanh_So.map((sub, idx) => (
                                <div
                                  className="my-4 d-flex align-items-center"
                                  key={idx}
                                >
                                  <div className="mb-1 w-120px pe-2">
                                    <label className="text-truncate line-height-sm font-weight-boldest w-100">
                                      {sub.User.FullName}
                                    </label>
                                  </div>
                                  <NumberFormat
                                    type={isHiddenPrice ? "password" : "text"}
                                    allowNegative
                                    name={`AutoBouns[${index}].Doanh_So[${idx}].Value`}
                                    placeholder={"Nhập giá trị"}
                                    className={`form-control flex-1`}
                                    isNumericString={true}
                                    thousandSeparator={true}
                                    value={sub.Value}
                                    onValueChange={(val) => {
                                      setFieldValue(
                                        `AutoBouns[${index}].Doanh_So[${idx}].Value`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      );
                                    }}
                                    onBlur={handleBlur}
                                    disabled={isHiddenPrice}
                                  />
                                  <SelectType
                                    name={`AutoBouns[${index}].Doanh_So[${idx}].Type`}
                                    value={sub.Type}
                                    placeholder="Chọn loại"
                                    onChange={(option) => {
                                      setFieldValue(
                                        `AutoBouns[${index}].Doanh_So[${idx}].Type`,
                                        option,
                                        false
                                      );
                                    }}
                                  />
                                  <div
                                    className="cursor-pointer text-danger w-30px text-end"
                                    onClick={() => arrayHelpers.remove(idx)}
                                  >
                                    Xóa
                                  </div>
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
            <div>
              <button
                className={`btn btn-success ${
                  loading.autoBouns ? "spinner spinner-white spinner-right" : ""
                }`}
                type="submit"
                disabled={loading.autoBouns}
              >
                Cập nhật
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

AutoBouns.propTypes = {
  OrderInfo: PropTypes.object,
};

export default AutoBouns;
