import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import ListStocks from './components/ListStocks'
import DateTime from './components/DateTime'
import PerfectScrollbar from 'react-perfect-scrollbar'
import StaffAtHome from './components/StaffAtHome'
import InfoBook from './components/InfoBook'
import bookingApi from 'src/api/booking.api'

Booking.propTypes = {
  onSubmit: PropTypes.func
}

const perfectScrollbarOptions = {
  wheelSpeed: 2,
  wheelPropagation: false
}

function Booking({ formikProps, nextStep, BookSet }) {
  const { errors, submitForm, setErrors } = formikProps
  const [isSubmiting, setIsSubmiting] = useState(false)

  const [loading, setLoading] = useState(false)
  const [ListsStocks, setListsStocks] = useState([])

  useEffect(() => {
    if (
      !errors.StockID &&
      !errors.FullName &&
      !errors.Phone &&
      !errors.StockID
    ) {
      setIsSubmiting(true)
    } else {
      setIsSubmiting(false)
    }
  }, [errors])

  useEffect(() => {
    getListStock()
  }, [])

  const getListStock = () => {
    setLoading(false)
    bookingApi
      .getStock()
      .then(({ data }) => {
        const StocksNotBook = window?.GlobalConfig?.StocksNotBook || ''
        const newStocks = data?.data?.all
          ? data.data.all
              .filter(
                item => item.ParentID !== 0 && !StocksNotBook.includes(item.ID)
              )
              .map(item => ({ ...item, ID: `${item.ID}` }))
          : []
        setListsStocks(newStocks)
        setLoading(false)
      })
      .catch(error => console.log(error))
  }

  const onSubmit = () => {
    if (isSubmiting) {
      nextStep(setErrors)
    } else {
      submitForm()
    }
  }

  return (
    <div className="d-flex flex-column h-100">
      <div className="text-center bg-white border-bottom p-15px text-uppercase fw-700 font-size-md">
        Đặt lịch dịch vụ
      </div>
      <PerfectScrollbar
        options={perfectScrollbarOptions}
        className="flex-grow-1 scroll"
      >
        <ListStocks
          formikProps={formikProps}
          loading={loading}
          ListStocks={ListsStocks}
        />
        <DateTime
          formikProps={formikProps}
          BookSet={BookSet}
          ListStocks={ListsStocks}
        />
        <StaffAtHome formikProps={formikProps} />
        <InfoBook formikProps={formikProps} />
      </PerfectScrollbar>
      <div>
        <button
          type="button"
          className="btn btn-ezs w-100 rounded-0 text-uppercase h-42px fw-500"
          onClick={onSubmit}
        >
          Chọn dịch vụ
        </button>
      </div>
    </div>
  )
}

export default Booking
