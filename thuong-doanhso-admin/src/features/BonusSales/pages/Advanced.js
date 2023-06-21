import React from 'react'
import PropTypes from 'prop-types'
import { Table } from 'react-bootstrap'
import Select from "react-select"
import NumberFormat from "react-number-format"
import { Formik, FieldArray, Form } from 'formik';

const initialValues = {
    advanced: [
        {
            Product: null,
            Type: {
                value: "hoa_hong",
                label: "Hoa hồng"
            },
            Staff: null,
            Value: "",
        }
    ]
}

function Advanced({ OrderInfo, onSubmit, loading }) {
    return (
        <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={onSubmit}
        >
            {(formikProps) => {
                const {
                    values,
                    handleBlur,
                    setFieldValue,
                } = formikProps;

                return (
                  <Form>
                    <Table bordered responsive>
                      <thead>
                        <tr>
                          <th className="min-w-200px w-30">Sản phẩm</th>
                          <th className="text-center min-w-200px w-25">Loại</th>
                          <th className="text-center min-w-200px w-25">
                            Nhân viên
                          </th>
                          <th className="text-center min-w-200px w-20">
                            Giá trị
                          </th>
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
                                    options={OrderInfo.oiItems}
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
                                    allowNegative={false}
                                    name={`advanced[${index}].Value`}
                                    placeholder={"Nhập giá trị"}
                                    className={`form-control`}
                                    isNumericString={true}
                                    thousandSeparator={true}
                                    value={item.Value}
                                    onValueChange={(val) => {
                                      setFieldValue(
                                        `advanced[${index}].Value`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
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
                                        onClick={() =>
                                          arrayHelpers.remove(index)
                                        }
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
                    <div>
                      <button
                        className={`btn btn-success ${
                          loading.advanced
                            ? "spinner spinner-white spinner-right"
                            : ""
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
    )
}

Advanced.propTypes = {
    OrderInfo: PropTypes.object,
    loading: PropTypes.object,
    onSubmit: PropTypes.func
}

export default Advanced
