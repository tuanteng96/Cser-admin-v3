import React, { Fragment, useState } from "react";
import { Table } from "react-bootstrap";
import Select from "react-select";
import NumberFormat from "react-number-format";
import { Formik, FieldArray, Form } from "formik";
import PropTypes from "prop-types";
import { TypeStaff } from "../../../Json/Json";
import { useSelector } from "react-redux";
import SelectType from "../components/SelectType";

function EquallyMuti({ OrderInfo, onSubmit, loading }) {
  const [initialValues, setInitialValues] = useState({ equally: [] });
  const { UserID } = useSelector(({ Auth }) => ({
    UserID: Auth?.User?.ID,
  }));

  const getValueHH = ({ user, item, Type }) => {
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
    const { Types, Type } = values;
    let ToAdd = [...Types.BS, ...Types.KTV, ...Types.Sale];
    if (ToAdd.length > 0) {
      const newArr =
        OrderInfo && OrderInfo.oiItems && OrderInfo.oiItems.length > 0
          ? OrderInfo.oiItems.map((item) => ({
              Product: item,
              Hoa_Hong: ToAdd.map((user) => ({
                Product: item,
                Staff: user,
                Value: getValueHH({ user, item, Type }),
                // Value:
                //   item.gia_tri_thanh_toan > 0
                //     ? getValueHH({ user, item, Type })
                //     : null,
              })),
              Doanh_So: ToAdd.map((user) => ({
                Product: item,
                Staff: user,
                Value:
                  item.gia_tri_doanh_so > 0
                    ? Math.round((user.Value * item.gia_tri_doanh_so) / 100)
                    : null,
                Type: item?.KpiType
                  ? { value: item?.KpiType, label: "Loại " + item?.KpiType }
                  : "",
              })),
            }))
          : [];
      setInitialValues({ equally: newArr });
      resetForm();
    }
  };

  return (
    <Fragment>
      <div className="row">
        <div className="col-md-6">
          <Formik
            enableReinitialize
            initialValues={{
              Types: { KTV: [], BS: [], Sale: [] },
              Type: TypeStaff[0],
            }}
            onSubmit={onToAdd}
          >
            {(formikProps) => {
              const { values, setFieldValue, handleBlur } = formikProps;
              return (
                <Form>
                  <div className="px-4 py-4 mb-3 border rounded">
                    <div className="mb-3">
                      <div className="mb-1">Kỹ thuật viên</div>
                      <div className="w-100">
                        <Select
                          isMulti
                          classNamePrefix="select"
                          className={`select-control`}
                          name={`Types.KTV`}
                          options={OrderInfo.nhan_vien}
                          value={values.Types.KTV}
                          placeholder="Chọn kỹ thuật viên"
                          noOptionsMessage={() => "Không có lựa chọn"}
                          onChange={(option) => {
                            let surplus = 100 % option.length;
                            const newOption =
                              option && option.length > 0
                                ? option.map((item, i) => ({
                                    ...item,
                                    Value:
                                      surplus > 0
                                        ? i === option.length - 1
                                          ? Number(
                                              (100 / option.length).toFixed(1)
                                            ) +
                                            surplus / 10
                                          : Number(
                                              (100 / option.length).toFixed(1)
                                            )
                                        : Number(
                                            (100 / option.length).toFixed(1)
                                          ),
                                  }))
                                : [];
                            setFieldValue(`Types.KTV`, newOption, false);
                          }}
                          isSearchable
                          isClearable
                          menuPosition="fixed"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="mb-1">Bác sỹ</div>
                      <Select
                        isMulti
                        classNamePrefix="select"
                        className={`select-control`}
                        name={`Types.BS`}
                        options={OrderInfo.nhan_vien}
                        value={values.Types.BS}
                        placeholder="Chọn bác sỹ"
                        noOptionsMessage={() => "Không có lựa chọn"}
                        onChange={(option) => {
                          let percent = 30;
                          let surplus = percent % option.length;
                          const newOption =
                            option && option.length > 0
                              ? option.map((item, i) => ({
                                  ...item,
                                  Value:
                                    surplus > 0
                                      ? i === option.length - 1
                                        ? Number(
                                            (percent / option.length).toFixed(1)
                                          ) +
                                          surplus / 10
                                        : Number(
                                            (percent / option.length).toFixed(1)
                                          )
                                      : Number(
                                          (percent / option.length).toFixed(1)
                                        ),
                                }))
                              : [];

                          let percentBS =
                            option && option.length > 0 ? 70 : 100;
                          setFieldValue(
                            `Types.Sale`,
                            values.Types.Sale && values.Types.Sale.length > 0
                              ? values.Types.Sale.map((item, i) => ({
                                  ...item,
                                  Value:
                                    surplus > 0
                                      ? i === values.Types.Sale.length - 1
                                        ? Number(
                                            (
                                              percentBS /
                                              values.Types.Sale.length
                                            ).toFixed(1)
                                          ) +
                                          surplus / 10
                                        : Number(
                                            (
                                              percentBS /
                                              values.Types.Sale.length
                                            ).toFixed(1)
                                          )
                                      : Number(
                                          (
                                            percentBS / values.Types.Sale.length
                                          ).toFixed(1)
                                        ),
                                }))
                              : [],
                            false
                          );

                          setFieldValue(`Types.BS`, newOption, false);
                        }}
                        isSearchable
                        isClearable
                        menuPosition="fixed"
                      />
                    </div>
                    <div>
                      <div className="mb-1">Sale & Tư vấn</div>
                      <Select
                        isMulti
                        classNamePrefix="select"
                        className={`select-control`}
                        name={`Types.Sale`}
                        options={OrderInfo.nhan_vien}
                        value={values.Types.Sale}
                        placeholder="Chọn nhân viên Sale - Tư vấn"
                        noOptionsMessage={() => "Không có lựa chọn"}
                        onChange={(option) => {
                          let percent =
                            values.Types.BS && values.Types.BS.length > 0
                              ? 70
                              : 100;
                          let surplus = percent % option.length;
                          const newOption =
                            option && option.length > 0
                              ? option.map((item, i) => ({
                                  ...item,
                                  Value:
                                    surplus > 0
                                      ? i === option.length - 1
                                        ? Number(
                                            (percent / option.length).toFixed(1)
                                          ) +
                                          surplus / 10
                                        : Number(
                                            (percent / option.length).toFixed(1)
                                          )
                                      : Number(
                                          (percent / option.length).toFixed(1)
                                        ),
                                }))
                              : [];
                          setFieldValue(`Types.Sale`, newOption, false);
                        }}
                        isSearchable
                        isClearable
                        menuPosition="fixed"
                      />
                    </div>
                  </div>
                  <div>
                    {Object.keys(values.Types)
                      .filter(
                        (keyName, i) =>
                          values.Types[keyName] &&
                          values.Types[keyName].length > 0
                      )
                      .map((keyName, i) => (
                        <div className="px-4 py-4 mb-3 border rounded" key={i}>
                          <div
                            className="text-uppercase"
                            style={{ fontWeight: 600 }}
                          >
                            {keyName === "Sale" && "Sale & Tư vấn"}
                            {keyName === "BS" && "Bác sỹ"}
                            {keyName === "KTV" && "Kỹ thuật viên"}
                          </div>
                          <div>
                            {values.Types[keyName] &&
                              values.Types[keyName].map((item, index) => (
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
                                            formattedValue === "" ||
                                            floatValue <= 100
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
                        </div>
                      ))}
                  </div>
                  {Object.keys(values.Types).some(
                    (keyName, i) =>
                      values.Types[keyName] && values.Types[keyName].length > 0
                  ) && (
                    <div className="mt-3 mb-5 text-end">
                      <button type="submit" className="btn btn-primary">
                        Tạo mới
                      </button>
                    </div>
                  )}
                </Form>
              );
            }}
          </Formik>
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
                                            : val.value,
                                          false
                                        );
                                      }}
                                      onBlur={handleBlur}
                                      disabled={
                                        window.top?.GlobalConfig?.Admin
                                          ?.thuong_ds_nang_cao && UserID !== 1
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
                                        window.top?.GlobalConfig?.Admin
                                          ?.thuong_ds_nang_cao && UserID !== 1
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
                                              : val.value,
                                            false
                                          );
                                        }}
                                        onBlur={handleBlur}
                                        disabled={
                                          window.top?.GlobalConfig?.Admin
                                            ?.thuong_ds_nang_cao && UserID !== 1
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
                                          window.top?.GlobalConfig?.Admin
                                            ?.thuong_ds_nang_cao && UserID !== 1
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
                      Cập nhập
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

EquallyMuti.propTypes = {
  OrderInfo: PropTypes.object,
};

export default EquallyMuti;
