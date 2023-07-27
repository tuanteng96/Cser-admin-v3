import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { Form, Formik, useFormikContext } from "formik";

const ValueChangeListener = () => {
  const { submitForm, values } = useFormikContext();

  useEffect(() => {
    submitForm();
  }, [values, submitForm]);

  return null;
};

function CheckInFilter({ onSubmit, initialValues }) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {(formikProps) => {
        const { values, setFieldValue, handleBlur, handleChange } = formikProps;
        window.ResetForm = function() {
          formikProps.resetForm();
        };
        return (
          <Form>
            <div className="d-flex">
              <div className="flex-grow-1 position-relative">
                <input
                  type="text"
                  className="form-control font-size-xs rounded-4px pl-35px"
                  placeholder="Tìm kiếm khách hàng"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.Key}
                  name="Key"
                />
                <i className="far fa-search font-size-sm position-absolute top-12px left-12px"></i>
              </div>
              <div className="w-180px pl-12px">
                <Select
                  className="select-control"
                  classNamePrefix="select"
                  isLoading={false}
                  isClearable
                  isSearchable
                  //menuIsOpen={true}
                  name="Type"
                  value={values.Type}
                  onChange={(option) => setFieldValue("Type", option, false)}
                  placeholder="Chọn loại"
                  options={[
                    {
                      label: "Phát sinh đơn hàng",
                      value: 0,
                    },
                    {
                      label: "Không phát sinh",
                      value: 1,
                    },
                    {
                      label: "CheckOut chưa hoàn thành",
                      value: 2,
                    },
                  ]}
                />
              </div>
            </div>
            <ValueChangeListener />
          </Form>
        );
      }}
    </Formik>
  );
}

CheckInFilter.propTypes = {
  onSubmit: PropTypes.func,
};

export default CheckInFilter;
