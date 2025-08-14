import React, { Fragment, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Select from "react-select";
import NumberFormat from "react-number-format";
import { Formik, FieldArray, Form } from "formik";
import PropTypes from "prop-types";
import { TypeStaff } from "../../../Json/Json";
import { useSelector } from "react-redux";
import { useRoles } from "../../../helpers/useRoles";
import ConditionsHelpers from "../../../helpers/ConditionsHelpers";

function Divided({ OrderInfo, onSubmit, loading }) {
  const { adminTools_byStock } = useRoles(["adminTools_byStock"]);

  const { UserID } = useSelector(({ Auth }) => ({
    UserID: Auth?.User?.ID,
  }));
  const [initialValuesAdd, setInitialValuesAdd] = useState({ ToAdd: [] });
  const [initialValues, setInitialValues] = useState({ divided: [] });

  useEffect(() => {
    if (OrderInfo) {
      const { oiItems } = OrderInfo;
      let newObt =
        oiItems && oiItems.length > 0
          ? oiItems.map((item) => ({
              Product: item,
              Staff: null,
              Type: TypeStaff[0],
            }))
          : [];
      if (
        window.top?.GlobalConfig?.Admin?.cai_dat_phi?.visible &&
        window.top?.GlobalConfig?.Admin?.cai_dat_phi?.an_tinh_hs_ds
      ) {
        newObt = newObt.filter(
          (x) =>
            x.Product.ProdTitle !==
              window.top?.GlobalConfig?.Admin?.cai_dat_phi?.TIP?.ProdTitle &&
            x.Product.ProdTitle !==
              window.top?.GlobalConfig?.Admin?.cai_dat_phi?.PHIDICHVU
                ?.ProdTitle &&
            x.Product.ProdTitle !==
              window.top?.GlobalConfig?.Admin?.cai_dat_phi?.PHIQUETTHE
                ?.ProdTitle
        );
      }

      setInitialValuesAdd({ ToAdd: newObt });
    }
  }, [OrderInfo]);

  const getValueHH = ({ item, user }) => {
    if (typeof item.initialRose === "object") {
      if (
        item?.prodBonus?.BonusSaleLevels &&
        item?.prodBonus?.BonusSaleLevels.some((x) => x.Salary)
      ) {
        let { BonusSaleLevels } = item?.prodBonus;
        let index = BonusSaleLevels.findIndex((x) => x.Level === user.level);
        let Salary = 0;
        if (index > -1) {
          Salary = BonusSaleLevels[index].Salary;
        }
        return Salary * item.Qty;
      }
      return item.prodBonus.BonusSale * item.Qty;
    }

    if (
      item?.prodBonus?.BonusSaleLevels &&
      item?.prodBonus?.BonusSaleLevels.some((x) => x.Salary)
    ) {
      let { BonusSaleLevels } = item?.prodBonus;
      let index = BonusSaleLevels.findIndex((x) => x.Level === user.level);
      let Salary = 0;
      if (index > -1) {
        Salary = BonusSaleLevels[index].Salary;
      }
      if (Salary < 100) {
        return Math.round((item.gia_tri_thanh_toan_thuc_te * Salary) / 100);
      }
      return item.prodBonus.BonusSale > 100
        ? Math.round(
            (item.gia_tri_thanh_toan_thuc_te *
              item.prodBonus.BonusSale *
              item.Qty) /
              item.ToPay
          )
        : Math.round(
            (item.prodBonus.BonusSale / 100) * item.gia_tri_thanh_toan_thuc_te
          );
    }
    return item.prodBonus.BonusSale > 100
      ? item.gia_tri_thanh_toan * item.Qty
      : item.gia_tri_thanh_toan;
  };

  const getValueKTV = ({ item }) => {
    return item.prodBonus.BonusSale2 > 100
      ? Math.round(
          (item.prodBonus.BonusSale2 *
            item.gia_tri_thanh_toan_thuc_te *
            item.Qty) /
            item.ToPay
        )
      : Math.round(
          item.gia_tri_thanh_toan_thuc_te * (item.prodBonus.BonusSale2 / 100)
        );
  };

  const onToAdd = (values, { resetForm }) => {
    const { ToAdd } = values;
    const itemChange =
      ToAdd && ToAdd.length > 0 ? ToAdd.filter((item) => item.Staff) : [];

    if (itemChange.length > 0) {
      let newArr = itemChange.map((item) => ({
        Product: item.Product,
        Hoa_Hong: [
          {
            Product: item.Product,
            Staff: item.Staff,
            Value:
              item.Type.value === "KY_THUAT_VIEN"
                ? getValueKTV({ item: item.Product, user: item.Staff })
                : getValueHH({ item: item.Product, user: item.Staff }),
          },
        ],
        Doanh_So: [
          {
            Product: item.Product,
            Staff: item.Staff,
            Value: item.Product.gia_tri_doanh_so,
          },
        ],
      }));

      setInitialValues({ divided: newArr });
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
        <div className="col-md-12 col-xl-8">
          <div className="px-4 py-2 mb-3 border rounded">
            <Formik
              enableReinitialize
              initialValues={initialValuesAdd}
              onSubmit={onToAdd}
            >
              {(formikProps) => {
                const { values, setFieldValue } = formikProps;

                return (
                  <Form>
                    {values &&
                      values.ToAdd &&
                      values.ToAdd.map((item, index) => (
                        <div
                          className="my-3 d-flex align-md-items-center flex-column flex-md-row"
                          key={index}
                        >
                          <div className="w-md-250px fw-bold pe-4">
                            {item.Product.ProdTitle}
                          </div>
                          <div className="flex-1 pr-md-15px w-100 w-md-auto my-10px my-md-0">
                            <Select
                              classNamePrefix="select"
                              className={`select-control`}
                              name={`ToAdd[${index}].Staff`}
                              options={OrderInfo.nhan_vien}
                              value={item.Staff}
                              placeholder="Chọn Nhân viên"
                              noOptionsMessage={() => "Không có lựa chọn"}
                              onChange={(option) => {
                                const indexType = TypeStaff.findIndex(
                                  (o) => o.value === option?.loai_hoa_hong
                                );
                                if (indexType > -1) {
                                  setFieldValue(
                                    `ToAdd[${index}].Type`,
                                    TypeStaff[indexType],
                                    false
                                  );
                                } else {
                                  setFieldValue(
                                    `ToAdd[${index}].Type`,
                                    TypeStaff[0],
                                    false
                                  );
                                }
                                setFieldValue(
                                  `ToAdd[${index}].Staff`,
                                  option,
                                  false
                                );
                              }}
                              isSearchable
                              isClearable
                              menuPosition="fixed"
                            />
                          </div>
                          {!window.top?.GlobalConfig?.Admin
                            ?.hoa_hong_tu_van_ktv_an && (
                            <div className="w-md-225px">
                              <Select
                                classNamePrefix="select"
                                className={`select-control`}
                                name={`ToAdd[${index}].Type`}
                                options={TypeStaff}
                                value={item.Type}
                                placeholder="Chọn loại nhân viên"
                                noOptionsMessage={() => "Không có lựa chọn"}
                                onChange={(option) => {
                                  setFieldValue(
                                    `ToAdd[${index}].Type`,
                                    option,
                                    false
                                  );
                                }}
                                isSearchable
                                menuPosition="fixed"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    <div className="mb-3 text-end">
                      <button type="submit" className="btn btn-primary">
                        Tạo mới
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          </div>
        </div>
      </div>
      {initialValues &&
        initialValues.divided &&
        initialValues.divided.length > 0 && (
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
                    {values.divided.map((item, index) => (
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
                              name={`divided[${index}].Hoa_Hong`}
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
                                      name={`divided[${index}].Hoa_Hong[${idx}].Value`}
                                      placeholder={"Nhập giá trị"}
                                      className={`form-control flex-1`}
                                      isNumericString={true}
                                      thousandSeparator={true}
                                      value={sub.Value}
                                      onValueChange={(val) => {
                                        setFieldValue(
                                          `divided[${index}].Hoa_Hong[${idx}].Value`,
                                          val.floatValue
                                            ? val.floatValue
                                            : val.value,
                                          false
                                        );
                                      }}
                                      onBlur={handleBlur}
                                      disabled={
                                        ConditionsHelpers.isDisabledSalesSommission(
                                          sub,
                                          adminTools_byStock?.hasRight
                                        ) || isHiddenPrice
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
                              name={`divided[${index}].Doanh_So`}
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
                                      name={`divided[${index}].Doanh_So[${idx}].Value`}
                                      placeholder={"Nhập giá trị"}
                                      className={`form-control flex-1`}
                                      isNumericString={true}
                                      thousandSeparator={true}
                                      value={sub.Value}
                                      onValueChange={(val) => {
                                        setFieldValue(
                                          `divided[${index}].Doanh_So[${idx}].Value`,
                                          val.floatValue
                                            ? val.floatValue
                                            : val.value,
                                          false
                                        );
                                      }}
                                      onBlur={handleBlur}
                                      disabled={
                                        ConditionsHelpers.isDisabledSalesSommission(
                                          sub,
                                          adminTools_byStock?.hasRight
                                        ) || isHiddenPrice
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
                          <th className="w-40 text-center min-w-250px">
                            Doanh số
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {values.divided.map((item, index) => (
                          <tr key={index}>
                            <td className="vertical-align-middle font-weight-boldest">
                              {item.Product.ProdTitle}
                            </td>
                            <td>
                              <FieldArray
                                name={`divided[${index}].Hoa_Hong`}
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
                                        name={`divided[${index}].Hoa_Hong[${idx}].Value`}
                                        placeholder={"Nhập giá trị"}
                                        className={`form-control flex-1`}
                                        isNumericString={true}
                                        thousandSeparator={true}
                                        value={sub.Value}
                                        onValueChange={(val) => {
                                          setFieldValue(
                                            `divided[${index}].Hoa_Hong[${idx}].Value`,
                                            val.floatValue
                                              ? val.floatValue
                                              : val.value,
                                            false
                                          );
                                        }}
                                        onBlur={handleBlur}
                                        disabled={
                                          ConditionsHelpers.isDisabledSalesSommission(
                                            sub,
                                            adminTools_byStock?.hasRight
                                          ) || isHiddenPrice
                                        }
                                      />
                                    </div>
                                  ))
                                }
                              />
                            </td>
                            <td>
                              <FieldArray
                                name={`divided[${index}].Doanh_So`}
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
                                        name={`divided[${index}].Doanh_So[${idx}].Value`}
                                        placeholder={"Nhập giá trị"}
                                        className={`form-control flex-1`}
                                        isNumericString={true}
                                        thousandSeparator={true}
                                        value={sub.Value}
                                        onValueChange={(val) => {
                                          setFieldValue(
                                            `divided[${index}].Doanh_So[${idx}].Value`,
                                            val.floatValue
                                              ? val.floatValue
                                              : val.value,
                                            false
                                          );
                                        }}
                                        onBlur={handleBlur}
                                        disabled={
                                          ConditionsHelpers.isDisabledSalesSommission(
                                            sub,
                                            adminTools_byStock?.hasRight
                                          ) || isHiddenPrice
                                        }
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
                        loading.divided
                          ? "spinner spinner-white spinner-right"
                          : ""
                      }`}
                      type="submit"
                      disabled={loading.divided}
                    >
                      Cập nhật
                    </button>
                    <button
                      className={`btn btn-danger ms-2`}
                      type="button"
                      onClick={() => setInitialValues({ divided: [] })}
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

Divided.propTypes = {
  OrderInfo: PropTypes.object,
};

export default Divided;
