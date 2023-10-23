import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import bookingApi from 'src/api/booking.api'
import { Placeholder } from 'react-bootstrap'
import { clsx } from 'clsx'
import { Field } from 'formik'

ListStocks.propTypes = {
  formikProps: PropTypes.object
}

function ListStocks({ formikProps }) {
  const [loading, setLoading] = useState(false)
  const [ListStocks, setListStocks] = useState([])

  const { touched, errors, setFieldValue, values } = formikProps

  useEffect(() => {
    setFieldValue('UserServiceIDs', '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.StockID])

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
        setListStocks(newStocks)
        setLoading(false)
      })
      .catch(error => console.log(error))
  }

  return (
    <div className="bg-white mt-3px pt-15px pl-15px pr-15px pb-5px location">
      <div className="fw-700 text-uppercase mb-10px">Chọn cơ sở</div>
      <div className="container-fluid p-0">
        <div className="row mx--6px">
          {!loading &&
            ListStocks &&
            ListStocks.map((item, index) => (
              <div className="col-6 px-6px" key={index}>
                <div className="location-item mb-10px">
                  <Field type="radio" name="StockID" value={item.ID} />
                  <div
                    className={clsx(
                      'location-item__title',
                      errors.StockID && touched.StockID && 'border-danger'
                    )}
                  >
                    <span>{item.Title}</span>
                    <i className="fa-solid fa-street-view"></i>
                  </div>
                </div>
              </div>
            ))}
          {loading &&
            Array(2)
              .fill()
              .map((item, index) => (
                <div className="col-6 px-6px" key={index}>
                  <div className="location-item">
                    <div className="location-item__title">
                      <Placeholder animation="glow">
                        <Placeholder xs={8} />
                      </Placeholder>
                      <i className="fa-solid fa-street-view"></i>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  )
}

export default ListStocks
