import React from "react";
import PropTypes from "prop-types";
import { Modal } from "react-bootstrap";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const MemberSchema = Yup.object().shape({
  FullName: Yup.string().required("Vui lòng nhập họ tên khách hàng."),
  Phone: Yup.string()
    .required("Vui lòng nhập số điện thoại.")
    .when([], {
      is: () => window?.top?.GlobalConfig?.Admin?.valid_phone === true,
      then: (schema) =>
        schema
          .matches(phoneRegExp, "Số điện thoại không hợp lệ.")
          .min(10, "Số điện thoại không hợp lệ.")
          .max(11, "Số điện thoại không hợp lệ."),
      otherwise: (schema) => schema, // không check regex khi isPhone = false
    }),
});

function ModalCreateMember({ show, onHide, onSubmit, initialDefault }) {
  const [initialValues, setInitialValues] = useState({});

  useEffect(() => {
    setInitialValues(initialDefault);
  }, [initialDefault]);

  return (
    <Modal
      size="md"
      dialogClassName="modal-max-sm modal-content-right"
      show={show}
      onHide={onHide}
      scrollable={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={MemberSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {(formikProps) => {
          const {
            errors,
            touched,
            values,
            handleChange,
            handleBlur,
            setFieldValue,
          } = formikProps;
          return (
            <Form className="h-100 d-flex flex-column">
              <Modal.Header className="open-close" closeButton>
                <Modal.Title className="text-uppercase">
                  Thông tin khách hàng
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-0">
                <div className="px-6 pt-3 mb-3 form-group form-group-ezs">
                  <label className="mb-1 d-none d-md-block">
                    Tên khách hàng
                  </label>
                  <input
                    className={`form-control ${
                      errors.FullName && touched.FullName
                        ? "is-invalid solid-invalid"
                        : ""
                    }`}
                    name="FullName"
                    value={values.FullName}
                    placeholder="Nhập họ tên"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="off"
                  ></input>
                </div>
                <div className="px-6 pt-3 mb-3 form-group form-group-ezs">
                  <label className="mb-1 d-none d-md-block">
                    Số điện thoại
                  </label>
                  <input
                    className={`form-control ${
                      errors.Phone && touched.Phone
                        ? "is-invalid solid-invalid"
                        : ""
                    }`}
                    name="Phone"
                    value={values.Phone}
                    placeholder="Nhập số điện thoại"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="off"
                  ></input>
                  <div className="mt-4 d-flex align-items-center justify-content-between">
                    <label className="mr-3">
                      <div>Tạo đặt lịch cho khách lẻ</div>
                      <div className="text-muted font-weight-light">
                        Mặc định sẽ tạo khách hàng mới
                      </div>
                    </label>
                    <span className="switch switch-sm switch-icon">
                      <label>
                        <input
                          type="checkbox"
                          name="PassersBy"
                          onChange={(evt) =>
                            setFieldValue("PassersBy", evt.target.checked)
                          }
                          onBlur={handleBlur}
                          checked={values.PassersBy}
                        />
                        <span />
                      </label>
                    </span>
                  </div>
                </div>
              </Modal.Body>
              <Modal.Footer className="justify-content-between">
                <div>
                  <button
                    type="submit"
                    className={`btn btn-sm btn-primary mr-2 ${
                      2 === 3 ? "spinner spinner-white spinner-right" : ""
                    } w-auto my-0 mr-0 h-auto`}
                    disabled={false}
                  >
                    Tạo mới
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={onHide}
                  >
                    Đóng
                  </button>
                </div>
                <div></div>
              </Modal.Footer>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}

ModalCreateMember.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func,
  onSubmit: PropTypes.func,
};
ModalCreateMember.defaultProps = {
  show: false,
  onHide: null,
  onSubmit: null,
};

export default ModalCreateMember;
