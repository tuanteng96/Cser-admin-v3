import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Select, { components } from 'react-select'
import ReactStars from 'react-rating-stars-component'
import bookingApi from 'src/api/booking.api'
import { useTranslation } from 'react-i18next'

StaffAtHome.propTypes = {
  formikProps: PropTypes.object
}

const CustomOption = ({ children, data, ...props }) => {
  return (
    <components.Option {...props}>
      <div className="d-flex justify-content-between align-items-center">
        {children}
        {window.GlobalConfig?.Admin?.dat_lich_nhan_vien_sao ? (
          <ReactStars
            count={5}
            size={20}
            activeColor="#f3cd00"
            value={data.source.AverRate}
            edit={false}
            isHalf={true}
          />
        ) : (
          <></>
        )}
      </div>
    </components.Option>
  )
}

function StaffAtHome({ formikProps }) {
  const { t } = useTranslation()

  const { values, setFieldValue, handleBlur } = formikProps
  const [ListStaff, setListStaff] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getListStaff()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.StockID])

  const getListStaff = () => {
    setLoading(true)
    bookingApi
      .getListStaff(values.StockID)
      .then(({ data }) => {
        if (data.data) {
          const newData = data.data.map(item => ({
            ...item,
            value: item.id,
            label: item.text
          }))
          setListStaff(newData)
        }
        setLoading(false)
      })
      .catch(error => console.log(error))
  }
  if (
    window.GlobalConfig?.Admin?.dat_lich_nhan_vien !== 1 &&
    !window.GlobalConfig?.APP?.Booking?.AtHome
  ) {
    return <></>
  }
  return (
    <div className="bg-white mt-1px pt-15px pl-15px pr-15px pb-10px date-time">
      <div className="fw-700 text-uppercase mb-10px">
        {window.GlobalConfig?.Admin?.dat_lich_nhan_vien === 1
          ? t('booking.NHAN_VIEN_THUC_HIEN')
          : t('booking.LOAI_DICH_VU')}
      </div>
      {window.GlobalConfig?.Admin?.dat_lich_nhan_vien === 1 && (
        <>
          <div>
            <Select
              isLoading={loading}
              isClearable
              className="select-control"
              classNamePrefix="select"
              options={ListStaff}
              menuPlacement="top"
              placeholder={t('booking.CHON_NHAN_VIEN')}
              value={values.UserServiceIDs}
              onChange={value => setFieldValue('UserServiceIDs', value)}
              components={{ Option: CustomOption }}
              noOptionsMessage={() => t('booking.KHONG_CO_NHAN_VIEN')}
            />
          </div>
        </>
      )}

      {window.GlobalConfig?.APP?.Booking?.AtHome && (
        <div className="mt-3 d-flex align-items-center justify-content-between">
          <label className="mr-3">{t('booking.SU_DUNG_DICH_VU_TAI_NHA')}</label>
          <span className="switch switch-sm switch-icon">
            <label>
              <input
                type="checkbox"
                name="AtHome"
                onChange={evt => setFieldValue('AtHome', evt.target.checked)}
                onBlur={handleBlur}
                checked={values.AtHome}
              />
              <span />
            </label>
          </span>
        </div>
      )}
    </div>
  )
}

export default StaffAtHome
