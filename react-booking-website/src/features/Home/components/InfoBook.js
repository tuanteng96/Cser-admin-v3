import React from 'react'
import PropTypes from 'prop-types'
import { NumericFormat } from 'react-number-format'
import clsx from 'clsx'

InfoBook.propTypes = {
  formikProps: PropTypes.object
}

function InfoBook({ formikProps }) {
  const { values, handleBlur, handleChange, setFieldValue, errors, touched } =
    formikProps
  return (
    <div className="bg-white mt-1px pt-15px pl-15px pr-15px pb-10px date-time">
      <div className="fw-700 text-uppercase mb-10px">
        4. Thông tin khách hàng
      </div>
      <div className="container p-0">
        <div className="row mx--6px">
          <div className="col-6 px-6px">
            <div className="position-relative">
              <input
                name="FullName"
                type="text"
                value={values.FullName}
                className={clsx(
                  'form-control',
                  errors.FullName &&
                    touched.FullName &&
                    'is-invalid solid-invalid'
                )}
                placeholder="Họ và tên"
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </div>
          <div className="col-6 px-6px">
            <div className="position-relative">
              <NumericFormat
                allowNegative={false}
                allowLeadingZeros
                name="Phone"
                placeholder="Số điện thoại"
                className={clsx(
                  'form-control',
                  errors.Phone && touched.Phone && 'is-invalid solid-invalid'
                )}
                //thousandSeparator={true}
                value={values.Phone}
                onValueChange={val => {
                  setFieldValue(
                    'Phone',
                    val.value ? val.value : val.formattedValue
                  )
                }}
                onBlur={handleBlur}
                autoComplete="off"
              />
            </div>
          </div>
          <div className="col-12 px-6px">
            <textarea
              name="Desc"
              className="form-control mt-10px"
              placeholder="Ghi chú"
              rows="4"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.Desc}
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfoBook
