import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import bookingApi from 'src/api/booking.api'
import { Placeholder } from 'react-bootstrap'
import { clsx } from 'clsx'
import { Field } from 'formik'
import StocksProvincesFilter from './StocksProvincesFilter'

ListStocks.propTypes = {
  formikProps: PropTypes.object
}

function ListStocks({ formikProps, ListStocks, loading }) {
  const [StockName, setStockName] = useState('Đang kiểm tra ...')
  const [visible, setVisible] = useState(false)

  const { touched, errors, setErrors, setFieldValue, values } = formikProps

  useEffect(() => {
    setFieldValue('UserServiceIDs', '')
    setFieldValue('BookDate', '', false)
    setErrors({})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.StockID])
  
  useEffect(() => {
    if (values.StockID) {
      let index = ListStocks.findIndex(
        x => Number(x.ID) === Number(values.StockID)
      )
      if (index > -1) setStockName(ListStocks[index].Title)
    } else {
      setStockName('Đang kiểm tra ...')
    }
  }, [values.StockID, ListStocks])

  return (
    <div className="bg-white mt-3px pt-15px pl-15px pr-15px pb-5px location">
      <div className="fw-700 text-uppercase mb-10px">Chọn cơ sở</div>
      <div className="p-0 container-fluid">
        {!loading && (
          <>
            {window?.GlobalConfig?.APP?.ByProvince && (
              <div className="mb-8px">
                {values.StockID ? (
                  <div>
                    Bạn đang đặt lịch tại
                    <span className="pl-6px text-app2 fw-600">{StockName}</span>
                  </div>
                ) : (
                  'Bạn chưa chọn cơ sở đặt lịch.'
                )}

                <div
                  className="cursor-pointer text-primary mt-2px text-underline"
                  onClick={() => setVisible(true)}
                >
                  {values.StockID ? 'Thay đổi cơ sở ?' : 'Chọn cơ sở ?'}
                </div>

                {errors.StockID && touched.StockID && (
                  <div className="text-danger mt-3px">
                    Vui lòng chọn cơ sở đặt lịch.
                  </div>
                )}

                <StocksProvincesFilter
                  isOpen={visible}
                  onClose={() => setVisible(false)}
                  Stocks={ListStocks}
                  onChange={val => {
                    setFieldValue('StockID', val.ID)
                    setVisible(false)
                  }}
                  StockActive={values.StockID}
                />
              </div>
            )}
            {!window?.GlobalConfig?.APP?.ByProvince && (
              <div className="row mx--6px">
                {ListStocks &&
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
              </div>
            )}
          </>
        )}
        {loading && (
          <>
            <div className="row mx--6px">
              {Array(2)
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
          </>
        )}
      </div>
    </div>
  )
}

export default ListStocks
