import React, { Fragment, useState } from "react";
import { Table } from "react-bootstrap";
import Select from "react-select";
import NumberFormat from "react-number-format";
import { Formik, FieldArray, Form } from "formik";
import PropTypes from "prop-types";
import { TypeStaff } from "../../../Json/Json";
import { useSelector } from "react-redux";
import SelectType from "../components/SelectType";
import { formatArray } from "../../../helpers/formatArray";
import { useRoles } from "../../../helpers/useRoles";

function Equally({ OrderInfo, onSubmit, loading }) {
  const [initialValues, setInitialValues] = useState({ equally: [] });
  const { UserID } = useSelector(({ Auth }) => ({
    UserID: Auth?.User?.ID,
  }));

  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  const getValueHH = ({ user, item, Type }) => {
    if (typeof item.initialRose === "object") {
      if (
        item?.prodBonus?.BonusSaleLevels &&
        item?.prodBonus?.BonusSaleLevels.some((x) => x.Salary) &&
        Type.value !== "KY_THUAT_VIEN"
      ) {
        
        let { BonusSaleLevels } = item?.prodBonus;
        let index = BonusSaleLevels.findIndex((x) => x.Level === user.level);
        let Salary = 0;
        if (index > -1) {
          Salary = BonusSaleLevels[index].Salary;
        }
        return Salary * item.Qty;
      }
      
      if (Type.value !== "KY_THUAT_VIEN") {
        return item.prodBonus.BonusSale * item.Qty
      };
      return item.prodBonus.BonusSale2 * item.Qty;
    }

    if (
      item?.prodBonus?.BonusSaleLevels &&
      item?.prodBonus?.BonusSaleLevels.some((x) => x.Salary) &&
      Type.value !== "KY_THUAT_VIEN"
    ) {
      let { BonusSaleLevels } = item?.prodBonus;
      let index = BonusSaleLevels.findIndex((x) => x.Level === user.level);
      let Salary = 0;
      if (index > -1) {
        Salary = BonusSaleLevels[index].Salary;
      }
      if (Salary < 100) {
        return Math.round(
          (item.gia_tri_thanh_toan_thuc_te * Salary * (user.Value / 100)) / 100
        );
      }
      return Math.round(
        ((((item.gia_tri_thanh_toan_thuc_te * Salary) / item.ToPay) *
          user.Value) /
          100) *
          item.Qty
      );
    }

    if (Type.value !== "KY_THUAT_VIEN") {
      return item.prodBonus.BonusSale > 100
        ? Math.round(
            (((item.gia_tri_thanh_toan_thuc_te *
              item.prodBonus.BonusSale *
              item.Qty) /
              item.ToPay) *
              user.Value) /
              100
          )
        : Math.round(
            ((item.prodBonus.BonusSale / 100) *
              item.gia_tri_thanh_toan_thuc_te *
              user.Value) /
              100
          );
    }

    return item.prodBonus.BonusSale2 > 100
      ? Math.round(
          (((item.prodBonus.BonusSale2 *
            item.gia_tri_thanh_toan_thuc_te *
            item.Qty) /
            item.ToPay) *
            user.Value) /
            100
        )
      : Math.round(
          (user.Value *
            item.gia_tri_thanh_toan_thuc_te *
            (item.prodBonus.BonusSale2 / 100)) /
            100
        );
  };

  const onToAdd = (values, { resetForm }) => {
    const { ToAdd, Type } = values;
    if (ToAdd.length > 0) {
      const newArr =
        OrderInfo && OrderInfo.oiItems && OrderInfo.oiItems.length > 0
          ? OrderInfo.oiItems.map((item) => ({
              Product: item,
              // Hoa_Hong: ToAdd.map((user) => {
              //   let newItem = { ...item };
              //   if (
              //     item?.ToPay === 0 &&
              //     (item?.prodBonus?.BonusSale > 100 ||
              //       item?.prodBonus?.BonusSale2 > 100)
              //   ) {
              //     newItem.ToPay = 1;
              //     newItem.gia_tri_thanh_toan_thuc_te = 1;
              //   }
              //   let obj = {
              //     Product: item,
              //     Staff: user,
              //     Value: getValueHH({ user, item: newItem, Type }),
              //   };
              //   return obj;
              // }),
              Hoa_Hong: ToAdd.map((user) => ({
                Product: item,
                Staff: user,
                Value: getValueHH({ user, item, Type }),
              })),
              Doanh_So: ToAdd.map((user) => {
                return {
                  Product: item,
                  Staff: user,
                  Value:
                    item.gia_tri_doanh_so > 0
                      ? Math.round((user.Value * item.gia_tri_doanh_so) / 100)
                      : 0,
                  Value2: 0,
                  Type: item?.KpiType
                    ? { value: item?.KpiType, label: "Loại " + item?.KpiType }
                    : "",
                };
              }),
            }))
          : [];

      setInitialValues({ equally: newArr });
      resetForm();
    }
  };

  let isHiddenPrice = false;

  if (window.top?.GlobalConfig?.Admin.hoa_hong_an_gia) {
    if (!adminTools_byStock?.hasRight) isHiddenPrice = true;
  }
  
  return (
    <Fragment>
      <div className="row">
        <div className="col-md-6">
          <div className="px-4 py-4 mb-3 border rounded">
            <Formik
              enableReinitialize
              initialValues={{ ToAdd: [], Type: TypeStaff[0] }}
              onSubmit={onToAdd}
            >
              {(formikProps) => {
                const { values, setFieldValue, handleBlur } = formikProps;
                return (
                  <Form>
                    <div className="mb-3 d-flex">
                      <Select
                        isMulti
                        classNamePrefix="select"
                        className={`select-control flex-1`}
                        name={`ToAdd`}
                        options={OrderInfo.nhan_vien}
                        value={values.ToAdd}
                        placeholder="Chọn Nhân viên"
                        noOptionsMessage={() => "Không có lựa chọn"}
                        onChange={(option) => {
                          let surplus = 100 % option.length;
                          let newOption = [];
                          if (option.length <= 10) {
                            let arrCount = formatArray.arrayHH(option.length);
                            newOption =
                              option && option.length > 0
                                ? option.map((item, i) => ({
                                    ...item,
                                    Value: arrCount[i],
                                  }))
                                : [];
                          } else {
                            newOption =
                              option && option.length > 0
                                ? option.map((item, i) => ({
                                    ...item,
                                    Value: 0,
                                  }))
                                : [];
                          }

                          if (option && option.length > 0) {
                            const indexType = TypeStaff.findIndex(
                              (o) =>
                                o.value ===
                                option[option.length - 1].loai_hoa_hong
                            );
                            if (indexType > -1) {
                              setFieldValue(
                                `Type`,
                                TypeStaff[indexType],
                                false
                              );
                            } else {
                              setFieldValue(`Type`, TypeStaff[0], false);
                            }
                          }
                          setFieldValue(`ToAdd`, newOption, false);
                        }}
                        isSearchable
                        isClearable
                        menuPosition="fixed"
                      />
                    </div>
                    {!window.top?.GlobalConfig?.Admin
                      ?.hoa_hong_tu_van_ktv_an && (
                      <div className="d-flex">
                        <Select
                          classNamePrefix="select"
                          className={`select-control flex-1`}
                          name={`Type`}
                          options={TypeStaff}
                          value={values.Type}
                          placeholder="Chọn nhóm Nhân viên"
                          noOptionsMessage={() => "Không có lựa chọn"}
                          onChange={(option) => {
                            setFieldValue(`Type`, option, false);
                          }}
                          isSearchable
                          menuPosition="fixed"
                        />
                      </div>
                    )}

                    <div>
                      {values.ToAdd &&
                        values.ToAdd.length > 1 &&
                        values.ToAdd.map((item, index) => (
                          <div
                            className="mt-3 d-flex align-items-center"
                            key={index}
                          >
                            <div className="w-200px font-weight-bold">
                              {item.Fn}
                            </div>
                            <div className="flex-1">
                              <div className="position-relative">
                                <NumberFormat
                                  isAllowed={(values) => {
                                    const {
                                      formattedValue,
                                      floatValue,
                                    } = values;
                                    return (
                                      formattedValue === "" || floatValue <= 100
                                    );
                                  }}
                                  allowNegative={false}
                                  name={`ToAdd[${index}].Value`}
                                  placeholder={"Nhập giá trị"}
                                  className={`form-control`}
                                  isNumericString={true}
                                  //thousandSeparator={true}
                                  value={item.Value}
                                  onValueChange={(val) => {
                                    setFieldValue(
                                      `ToAdd[${index}].Value`,
                                      val.floatValue
                                        ? val.floatValue
                                        : val.value,
                                      false
                                    );
                                  }}
                                  onBlur={handleBlur}
                                />
                                <div className="top-0 right-0 position-absolute h-100 w-45px d-flex align-items-center justify-content-center">
                                  %
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                    {values.ToAdd && values.ToAdd.length > 0 && (
                      <div className="mt-3 text-end">
                        <button type="submit" className="btn btn-primary">
                          Tạo mới
                        </button>
                      </div>
                    )}
                    {values.ToAdd && values.ToAdd.length >= 2 && (
                      <div
                        className="mt-3"
                        style={{
                          color: "#999",
                        }}
                      >
                        Số tiền hoa hồng tư vấn nhân viên được hưởng đã được
                        tính toán tự động theo setup hoa hồng của từng sản phẩm
                        / dịch vụ. Trường hợp bạn áp dụng 2 nhân viên được hưởng
                        ( bạn có thể chia tỉ lệ mỗi người được hưởng 50 50; 40
                        60 theo tỉ lệ mà các bạn thỏa thuận do cùng tư vấn khách
                        hàng )
                      </div>
                    )}
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      {initialValues &&
        initialValues.equally &&
        initialValues.equally.length > 0 && (
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={onSubmit}
          >
            {(formikProps) => {
              const { values, handleBlur, setFieldValue } = formikProps;

              return (
                <Form className="overflow-auto">
                  <div className="d-md-none">
                    {values.equally.map((item, index) => (
                      <div className="mb-3 border rounded" key={index}>
                        <div className="p-3 border-bottom line-height-sm font-weight-boldest w-100 line-height-lg bg-light">
                          {item.Product.ProdTitle}
                        </div>
                        <div className="p-3 border-bottom">
                          <div className="text-truncate font-weight-boldest w-100 text-muted">
                            Hoa hồng
                          </div>
                          <div>
                            <FieldArray
                              name={`equally[${index}].Hoa_Hong`}
                              render={(arrayHelpers) =>
                                item.Hoa_Hong.map((sub, idx) => (
                                  <div
                                    className="my-2 d-flex align-items-center"
                                    key={idx}
                                  >
                                    <label className="mb-1 font-weight-boldest w-140px text-truncate pe-3">
                                      {sub.Staff.Fn}
                                    </label>
                                    <NumberFormat
                                      type={isHiddenPrice ? "password" : "text"}
                                      allowNegative
                                      name={`equally[${index}].Hoa_Hong[${idx}].Value`}
                                      placeholder={"Nhập giá trị"}
                                      className={`form-control flex-1`}
                                      isNumericString={true}
                                      thousandSeparator={true}
                                      value={sub.Value} // sub.Value
                                      onValueChange={(val) => {
                                        setFieldValue(
                                          `equally[${index}].Hoa_Hong[${idx}].Value`,
                                          val.floatValue
                                            ? val.floatValue
                                            : val.value,
                                          false
                                        );
                                      }}
                                      onBlur={handleBlur}
                                      disabled={
                                        (window.top?.GlobalConfig?.Admin
                                          ?.thuong_ds_nang_cao &&
                                          UserID !== 1) ||
                                        isHiddenPrice
                                      }
                                    />
                                  </div>
                                ))
                              }
                            />
                          </div>
                        </div>
                        <div className="p-3 border-bottom">
                          <div className="text-truncate font-weight-boldest w-100 text-muted">
                            Doanh số
                          </div>
                          <div>
                            <FieldArray
                              name={`equally[${index}].Doanh_So`}
                              render={(arrayHelpers) =>
                                item.Doanh_So.map((sub, idx) => (
                                  <div
                                    className="my-2 d-flex align-items-center"
                                    key={idx}
                                  >
                                    <label className="mb-1 font-weight-boldest w-140px text-truncate pe-3">
                                      {sub.Staff.Fn}
                                    </label>
                                    <NumberFormat
                                      type={isHiddenPrice ? "password" : "text"}
                                      allowNegative
                                      name={`equally[${index}].Doanh_So[${idx}].Value`}
                                      placeholder={"Nhập giá trị"}
                                      className={`form-control flex-1`}
                                      isNumericString={true}
                                      thousandSeparator={true}
                                      value={sub.Value}
                                      onValueChange={(val) => {
                                        setFieldValue(
                                          `equally[${index}].Doanh_So[${idx}].Value`,
                                          val.floatValue
                                            ? val.floatValue
                                            : val.value,
                                          false
                                        );
                                      }}
                                      onBlur={handleBlur}
                                      disabled={
                                        (window.top?.GlobalConfig?.Admin
                                          ?.thuong_ds_nang_cao &&
                                          UserID !== 1) ||
                                        isHiddenPrice
                                      }
                                    />
                                    <SelectType
                                      name={`equally[${index}].Doanh_So[${idx}].Type`}
                                      value={sub.Type}
                                      placeholder="Chọn loại"
                                      onChange={(option) => {
                                        setFieldValue(
                                          `equally[${index}].Doanh_So[${idx}].Type`,
                                          option,
                                          false
                                        );
                                      }}
                                      disabled={
                                        (window.top?.GlobalConfig?.Admin
                                          ?.thuong_ds_nang_cao &&
                                          UserID !== 1) ||
                                        isHiddenPrice
                                      }
                                    />
                                  </div>
                                ))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-none d-md-block">
                    <Table bordered responsive>
                      <thead>
                        <tr>
                          <th className="w-20 min-w-250px">Sản phẩm</th>
                          <th className="w-40 text-center min-w-250px">
                            Hoa hồng
                          </th>
                          <th
                            className="w-40 text-center"
                            style={{
                              minWidth: window.top?.GlobalConfig?.Admin
                                ?.thuong_ds_theo_loai
                                ? "450px"
                                : "250px",
                            }}
                          >
                            Doanh số
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.equally.map((item, index) => (
                          <tr key={index}>
                            <td className="vertical-align-middle font-weight-boldest">
                              {item.Product.ProdTitle}
                            </td>
                            <td>
                              <FieldArray
                                name={`equally[${index}].Hoa_Hong`}
                                render={(arrayHelpers) =>
                                  item.Hoa_Hong.map((sub, idx) => (
                                    <div
                                      className="my-2 d-flex align-items-center"
                                      key={idx}
                                    >
                                      <label className="mb-1 font-weight-boldest w-140px text-truncate pe-3">
                                        {sub.Staff.Fn}
                                      </label>
                                      <NumberFormat
                                        type={
                                          isHiddenPrice ? "password" : "text"
                                        }
                                        allowNegative
                                        name={`equally[${index}].Hoa_Hong[${idx}].Value`}
                                        placeholder={"Nhập giá trị"}
                                        className={`form-control flex-1`}
                                        isNumericString={true}
                                        thousandSeparator={true}
                                        value={sub.Value}
                                        onValueChange={(val) => {
                                          setFieldValue(
                                            `equally[${index}].Hoa_Hong[${idx}].Value`,
                                            val.floatValue
                                              ? val.floatValue
                                              : val.value
                                          );
                                        }}
                                        onBlur={handleBlur}
                                        disabled={
                                          (window.top?.GlobalConfig?.Admin
                                            ?.thuong_ds_nang_cao &&
                                            UserID !== 1) ||
                                          isHiddenPrice
                                        }
                                      />
                                    </div>
                                  ))
                                }
                              />
                            </td>
                            <td>
                              <FieldArray
                                name={`equally[${index}].Doanh_So`}
                                render={(arrayHelpers) =>
                                  item.Doanh_So.map((sub, idx) => (
                                    <div
                                      className="my-2 d-flex align-items-center"
                                      key={idx}
                                    >
                                      <label className="mb-1 font-weight-boldest w-140px text-truncate pe-3">
                                        {sub.Staff.Fn}
                                      </label>
                                      <NumberFormat
                                        type={
                                          isHiddenPrice ? "password" : "text"
                                        }
                                        allowNegative
                                        name={`equally[${index}].Doanh_So[${idx}].Value`}
                                        placeholder={"Nhập giá trị"}
                                        className={`form-control flex-1`}
                                        isNumericString={true}
                                        thousandSeparator={true}
                                        value={sub.Value}
                                        onValueChange={(val) => {
                                          setFieldValue(
                                            `equally[${index}].Doanh_So[${idx}].Value`,
                                            val.floatValue
                                          );
                                        }}
                                        //onBlur={handleBlur}
                                        disabled={
                                          (window.top?.GlobalConfig?.Admin
                                            ?.thuong_ds_nang_cao &&
                                            UserID !== 1) ||
                                          isHiddenPrice
                                        }
                                      />
                                      <SelectType
                                        name={`equally[${index}].Doanh_So[${idx}].Type`}
                                        value={sub.Type}
                                        placeholder="Chọn loại"
                                        onChange={(option) => {
                                          setFieldValue(
                                            `equally[${index}].Doanh_So[${idx}].Type`,
                                            option,
                                            false
                                          );
                                        }}
                                      />
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
                        loading.equally
                          ? "spinner spinner-white spinner-right"
                          : ""
                      }`}
                      type="submit"
                      disabled={loading.equally}
                    >
                      Cập nhật
                    </button>
                    <button
                      className={`btn btn-danger ms-2`}
                      type="button"
                      onClick={() => setInitialValues({ equally: [] })}
                    >
                      Hủy
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        )}
    </Fragment>
  );
}

Equally.propTypes = {
  OrderInfo: PropTypes.object,
};

export default Equally;
