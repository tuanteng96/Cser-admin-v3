import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Select, { components } from 'react-select'
import ReactStars from 'react-rating-stars-component'
import bookingApi from 'src/api/booking.api'

StaffAtHome.propTypes = {
  formikProps: PropTypes.object
}

const CustomOption = ({ children, data, ...props }) => {
  return (
    <components.Option {...props}>
      <div className="d-flex justify-content-between align-items-center">
        {children}
        <ReactStars
          count={5}
          size={20}
          activeColor="#f3cd00"
          value={data.source.AverRate}
          edit={false}
          isHalf={true}
        />
      </div>
    </components.Option>
  )
}

function StaffAtHome({ formikProps }) {
  const { values, setFieldValue } = formikProps
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
  return (
    <div className="bg-white mt-1px pt-15px pl-15px pr-15px pb-10px date-time">
      <div className="fw-700 text-uppercase mb-10px">
        3. Nhân viên thực hiện
      </div>
      <div>
        <Select
          isLoading={loading}
          isClearable
          className="select-control"
          classNamePrefix="select"
          options={ListStaff}
          menuPlacement="top"
          placeholder="Chọn nhân viên"
          value={values.UserServiceIDs}
          onChange={value => setFieldValue('UserServiceIDs', value)}
          components={{ Option: CustomOption }}
          noOptionsMessage={() => 'Không có nhân viên.'}
        />
      </div>
    </div>
  )
}

export default StaffAtHome
