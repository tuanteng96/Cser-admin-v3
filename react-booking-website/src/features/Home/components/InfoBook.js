import React from 'react'
import PropTypes from 'prop-types'
import { NumericFormat } from 'react-number-format'
import clsx from 'clsx'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'

InfoBook.propTypes = {
  formikProps: PropTypes.object
}

function InfoBook({ formikProps }) {
  const { t } = useTranslation()
  
  const { values, handleBlur, handleChange, setFieldValue, errors, touched } =
    formikProps
  return (
    <div className="bg-white mt-1px pt-15px pl-15px pr-15px pb-10px date-time">
      <div className="fw-700 text-uppercase mb-10px">{t("booking.THONG_TIN_KHACH_HANG")}</div>
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
                placeholder={t("booking.HO_VA_TEN")}
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
                placeholder={t("booking.SO_DIEN_THOAI")}
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
            {window.GlobalConfig?.APP?.SL_khach && (
              <Select
                isClearable
                className="select-control mt-10px"
                classNamePrefix="select"
                options={Array(10)
                  .fill()
                  .map((_, x) => ({
                    label: x + 1 + ' ' + t("booking.KHACH"),
                    value: x + 1
                  }))}
                menuPlacement="top"
                placeholder={t("booking.CHON_SO_KHACH")}
                value={values.AmountPeople}
                onChange={value => setFieldValue('AmountPeople', value)}
                noOptionsMessage={() => t("booking.KHONG_CO_DU_LIEU")}
              />
            )}
          </div>
          <div className="col-12 px-6px">
            <textarea
              name="Desc"
              className="form-control mt-10px"
              placeholder={t("booking.GHI_CHU")}
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
