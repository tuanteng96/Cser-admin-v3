import React, { Fragment, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import Select from "react-select";
import NumberFormat from "react-number-format";
import { Formik, FieldArray, Form } from "formik";
import PropTypes from "prop-types";
import { TypeStaff } from "../../../Json/Json";
import { useSelector } from "react-redux";

function Divided({ OrderInfo, onSubmit, loading }) {
  const { UserID } = useSelector(({ Auth }) => ({
    UserID: Auth?.User?.ID,
  }));
  const [initialValuesAdd, setInitialValuesAdd] = useState({ ToAdd: [] });
  const [initialValues, setInitialValues] = useState({ divided: [] });
  useEffect(() => {
    if (OrderInfo) {
      const { oiItems } = OrderInfo;
      const newObt =
        oiItems && oiItems.length > 0
          ? oiItems.map((item) => ({
              Product: item,
              Staff: null,
              Type: TypeStaff[0],
            }))
          : [];
      setInitialValuesAdd({ ToAdd: newObt });
    }
  }, [OrderInfo]);

  const onToAdd = (values, { resetForm }) => {
    const { ToAdd } = values;
    const itemChange =
      ToAdd && ToAdd.length > 0 ? ToAdd.filter((item) => item.Staff) : [];
    if (itemChange.length > 0) {
      const newArr = itemChange.map((item) => ({
        Product: item.Product,
        Hoa_Hong: [
          {
            Product: item.Product,
            Staff: item.Staff,
            Value:
              item.Type.value === "KY_THUAT_VIEN"
                ? item.Product.BonusSale2
                : item.Product.gia_tri_thanh_toan,
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
  return (
    <Fragment>
      <div className="row">
        <div className="col-md-12 col-xl-8">
          <div className="border rounded mb-3 px-4 py-2">
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
                          className="d-flex align-md-items-center flex-column flex-md-row my-3"
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
                        </div>
                      ))}
                    <div className="text-end mb-3">
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
                  <Table bordered responsive>
                    <thead>
                      <tr>
                        <th className="min-w-250px w-20">Sản phẩm</th>
                        <th className="text-center min-w-250px w-40">
                          Hoa hồng
                        </th>
                        <th className="text-center min-w-250px w-40">
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
                                    className="d-flex align-items-center my-2"
                                    key={idx}
                                  >
                                    <label className="font-weight-boldest mb-1 w-140px text-truncate pe-3">
                                      {sub.Staff.Fn}
                                    </label>
                                    <NumberFormat
                                      allowNegative={false}
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
                              name={`divided[${index}].Doanh_So`}
                              render={(arrayHelpers) =>
                                item.Doanh_So.map((sub, idx) => (
                                  <div
                                    className="d-flex align-items-center my-2"
                                    key={idx}
                                  >
                                    <label className="font-weight-boldest mb-1 w-140px text-truncate pe-3">
                                      {sub.Staff.Fn}
                                    </label>
                                    <NumberFormat
                                      allowNegative={false}
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
                                        window.top?.GlobalConfig?.Admin
                                          ?.thuong_ds_nang_cao && UserID !== 1
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
                      Cập nhập
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
