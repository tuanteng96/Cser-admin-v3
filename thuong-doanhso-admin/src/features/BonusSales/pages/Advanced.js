import React from "react";
import PropTypes from "prop-types";
import { Table } from "react-bootstrap";
import Select from "react-select";
import NumberFormat from "react-number-format";
import { Formik, FieldArray, Form } from "formik";
import SelectType from "../components/SelectType";

const initialValues = {
  advanced: [
    {
      Product: null,
      Type: {
        value: "hoa_hong",
        label: "Hoa hồng",
      },
      Staff: null,
      Value: "",
    },
  ],
};

function Advanced({ OrderInfo, onSubmit, loading }) {
  let oiItems = OrderInfo?.oiItems ? [...OrderInfo?.oiItems] : [];
  if (
    window.top?.GlobalConfig?.Admin?.cai_dat_phi?.visible &&
    window.top?.GlobalConfig?.Admin?.cai_dat_phi?.an_tinh_hs_ds
  ) {
    oiItems = oiItems.filter(
      (x) =>
        x.ProdTitle !==
          window.top?.GlobalConfig?.Admin?.cai_dat_phi?.TIP?.ProdTitle &&
        x.ProdTitle !==
          window.top?.GlobalConfig?.Admin?.cai_dat_phi?.PHIDICHVU?.ProdTitle &&
        x.ProdTitle !==
          window.top?.GlobalConfig?.Admin?.cai_dat_phi?.PHIQUETTHE?.ProdTitle
    );
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
              <FieldArray
                name="advanced"
                render={(arrayHelpers) =>
                  values.advanced.map((item, index) => (
                    <div
                      className="pb-3 mb-3 rounded border-bottom"
                      key={index}
                    >
                      <div className="mb-2">
                        <Select
                          key={new Date().getTime()}
                          classNamePrefix="select"
                          className={`select-control`}
                          name={`advanced[${index}].Product`}
                          options={oiItems}
                          value={item.Product}
                          placeholder="Chọn sản phẩm"
                          noOptionsMessage={() => "Không có lựa chọn"}
                          onChange={(option) => {
                            setFieldValue(
                              `advanced[${index}].Product`,
                              option,
                              false
                            );
                          }}
                          isSearchable
                          isClearable
                          menuPosition="fixed"
                        />
                      </div>
                      <div className="mb-2">
                        <Select
                          classNamePrefix="select"
                          className={`select-control`}
                          name={`advanced[${index}].Type`}
                          options={[
                            {
                              value: "hoa_hong",
                              label: "Hoa hồng",
                            },
                            {
                              value: "doanh_so",
                              label: "Doanh số",
                            },
                          ]}
                          value={item.Type}
                          placeholder="Loại nhân viên"
                          noOptionsMessage={() => "Không có lựa chọn"}
                          onChange={(option) => {
                            setFieldValue(
                              `advanced[${index}].Type`,
                              option,
                              false
                            );
                          }}
                          isSearchable={false}
                          menuPosition="fixed"
                        />
                        {item?.Type?.value === "doanh_so" && (
                          <SelectType
                            className="mt-2 select-control"
                            name={`advanced[${index}].KpiType`}
                            value={item.KpiType}
                            placeholder="Chọn loại"
                            onChange={(option) => {
                              setFieldValue(
                                `advanced[${index}].KpiType`,
                                option,
                                false
                              );
                            }}
                          />
                        )}
                      </div>
                      <div className="mb-2">
                        <Select
                          classNamePrefix="select"
                          className={`select-control`}
                          name={`advanced[${index}].Staff`}
                          options={OrderInfo.nhan_vien}
                          value={item.Staff}
                          placeholder="Chọn NV"
                          noOptionsMessage={() => "Không có lựa chọn"}
                          onChange={(option) => {
                            setFieldValue(
                              `advanced[${index}].Staff`,
                              option,
                              false
                            );
                          }}
                          isSearchable
                          isClearable
                          menuPosition="fixed"
                        />
                      </div>
                      <div className="mb-2">
                        <NumberFormat
                          allowNegative
                          name={`advanced[${index}].Value`}
                          placeholder={"Nhập giá trị"}
                          className={`form-control`}
                          isNumericString={true}
                          thousandSeparator={true}
                          value={item.Value}
                          onValueChange={(val) => {
                            setFieldValue(
                              `advanced[${index}].Value`,
                              val.floatValue ? val.floatValue : val.value,
                              false
                            );
                          }}
                          onBlur={handleBlur}
                        />
                      </div>
                      <div>
                        <div className="text-center">
                          <button
                            type="button"
                            className="btn btn-success btn-sm h-30px"
                            onClick={() =>
                              arrayHelpers.push(index, {
                                Product: null,
                                Type: {
                                  value: "hoa_hong",
                                  label: "Hoa hồng",
                                },
                                Staff: null,
                                Value: "",
                              })
                            }
                          >
                            <i className="fa-light fa-plus icon-1x pe-0"></i>
                          </button>
                          {values.advanced.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger btn-sm h-30px ms-1"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              <i className="fa-light fa-trash icon-1x pe-0"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                }
              />
            </div>
            <div className="d-none d-md-block">
              <Table bordered responsive>
                <thead>
                  <tr>
                    <th className="min-w-200px w-30">Sản phẩm</th>
                    <th className="text-center min-w-200px w-25">Loại</th>
                    <th className="text-center min-w-200px w-25">Nhân viên</th>
                    <th className="w-20 text-center min-w-200px">Giá trị</th>
                    <th className="text-center min-w-200px w-100px">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <FieldArray
                    name="advanced"
                    render={(arrayHelpers) =>
                      values.advanced.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <Select
                              classNamePrefix="select"
                              className={`select-control`}
                              name={`advanced[${index}].Product`}
                              options={oiItems}
                              value={item.Product}
                              placeholder="Chọn sản phẩm"
                              noOptionsMessage={() => "Không có lựa chọn"}
                              onChange={(option) => {
                                setFieldValue(
                                  `advanced[${index}].Product`,
                                  option,
                                  false
                                );
                              }}
                              isSearchable
                              isClearable
                              menuPosition="fixed"
                            />
                          </td>
                          <td>
                            <Select
                              classNamePrefix="select"
                              className={`select-control`}
                              name={`advanced[${index}].Type`}
                              options={[
                                {
                                  value: "hoa_hong",
                                  label: "Hoa hồng",
                                },
                                {
                                  value: "doanh_so",
                                  label: "Doanh số",
                                },
                              ]}
                              value={item.Type}
                              placeholder="Loại nhân viên"
                              noOptionsMessage={() => "Không có lựa chọn"}
                              onChange={(option) => {
                                setFieldValue(
                                  `advanced[${index}].Type`,
                                  option,
                                  false
                                );
                              }}
                              isSearchable={false}
                              menuPosition="fixed"
                            />
                            {item?.Type?.value === "doanh_so" && (
                              <SelectType
                                className="mt-2 select-control"
                                name={`advanced[${index}].KpiType`}
                                value={item.KpiType}
                                placeholder="Chọn loại"
                                onChange={(option) => {
                                  setFieldValue(
                                    `advanced[${index}].KpiType`,
                                    option,
                                    false
                                  );
                                }}
                              />
                            )}
                          </td>
                          <td>
                            <Select
                              classNamePrefix="select"
                              className={`select-control`}
                              name={`advanced[${index}].Staff`}
                              options={OrderInfo.nhan_vien}
                              value={item.Staff}
                              placeholder="Chọn NV"
                              noOptionsMessage={() => "Không có lựa chọn"}
                              onChange={(option) => {
                                setFieldValue(
                                  `advanced[${index}].Staff`,
                                  option,
                                  false
                                );
                              }}
                              isSearchable
                              isClearable
                              menuPosition="fixed"
                            />
                          </td>
                          <td>
                            <NumberFormat
                              allowNegative
                              name={`advanced[${index}].Value`}
                              placeholder={"Nhập giá trị"}
                              className={`form-control`}
                              isNumericString={true}
                              thousandSeparator={true}
                              value={item.Value}
                              onValueChange={(val) => {
                                setFieldValue(
                                  `advanced[${index}].Value`,
                                  val.floatValue ? val.floatValue : val.value,
                                  false
                                );
                              }}
                              onBlur={handleBlur}
                            />
                          </td>
                          <td className="vertical-align-middle">
                            <div className="text-center">
                              <button
                                type="button"
                                className="btn btn-success btn-sm h-30px"
                                onClick={() =>
                                  arrayHelpers.push(index, {
                                    Product: null,
                                    Type: {
                                      value: "hoa_hong",
                                      label: "Hoa hồng",
                                    },
                                    Staff: null,
                                    Value: "",
                                  })
                                }
                              >
                                <i className="fa-light fa-plus icon-1x pe-0"></i>
                              </button>
                              {values.advanced.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm h-30px ms-1"
                                  onClick={() => arrayHelpers.remove(index)}
                                >
                                  <i className="fa-light fa-trash icon-1x pe-0"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  />
                </tbody>
              </Table>
            </div>
            <div>
              <button
                className={`btn btn-success ${
                  loading.advanced ? "spinner spinner-white spinner-right" : ""
                }`}
                type="submit"
                disabled={loading.advanced}
              >
                Thêm mới
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}

Advanced.propTypes = {
  OrderInfo: PropTypes.object,
  loading: PropTypes.object,
  onSubmit: PropTypes.func,
};

export default Advanced;
