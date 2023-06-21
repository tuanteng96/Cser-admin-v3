import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import InfiniteScroll from 'react-infinite-scroll-component'
import bookingApi from 'src/api/booking.api'
import clsx from 'clsx'
import { Field } from 'formik'
import { Placeholder } from 'react-bootstrap'

Confirm.propTypes = {
  prevStep: PropTypes.func
}

function Confirm({ prevStep, formikProps, onSubmit, loadingBtn }) {
  const { values } = formikProps
  const [ListServices, setListServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [noLoading, setNoLoading] = useState(false)
  const [Total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [valueS, setValueS] = useState('')
  const [filters, setFilters] = useState({
    MemberID: formikProps?.values?.MemberID || '',
    Ps: 15,
    Pi: 1,
    Key: '',
    StockID: values?.StockID || ''
  })

  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    getListServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListServices = async () => {
    !loading && !noLoading && setLoading(true)
    const objFilters = {
      Key: filters.Key || valueS,
      ...filters
    }
    const { data } = await bookingApi.getService(objFilters)
    const lst =
      filters.Pi > 1 ? [...new Set([...ListServices, ...data.lst])] : data.lst
    setLoading(false)
    setTotal(data.total)
    setListServices(lst)
    setNoLoading(false)
  }

  const fetchMoreService = () => {
    if (ListServices.length >= Total) {
      return
    }
    setHasMore(true)
    setNoLoading(true)
    setFilters({
      ...filters,
      Pi: filters.Pi + 1
    })
  }

  const handleSearch = val => {
    setLoading(true)
    setValueS(val)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setFilters({
        ...filters,
        Key: val,
        Pi: 1
      })
    }, 500)
  }

  const TreatmentCard = item => {
    return (
      item.OsBook > 0 || item.OsDoing > 0 || item.OsNew > 0 || item.OsBH > 0
    )
  }

  const ServiceHOT = item => {
    return item.Status.search('2') > -1
  }

  return (
    <div className="d-flex flex-column h-100">
      <div className="border-bottom p-15px text-uppercase fw-700 font-size-md bg-white text-center position-relative">
        <div
          className="position-absolute w-50px h-100 left-0 top-0 d-flex align-items-center justify-content-center cursor-pointer"
          onClick={prevStep}
        >
          <i className="fa-regular fa-chevron-left"></i>
        </div>
        Chọn dịch vụ
      </div>
      <div className="confirm-search bg-white mt-2px p-15px">
        <div className="position-relative">
          <input
            className="form-control h-45px"
            type="text"
            placeholder="Nhập tên dịch vụ bạn cần ?"
            value={valueS}
            onChange={e => handleSearch(e.target.value)}
          />
          <i className="fa-regular fa-magnifying-glass"></i>
        </div>
      </div>
      <div
        className="flex-grow-1 bg-white overflow-auto px-15px"
        id="scrollableDiv"
      >
        <InfiniteScroll
          dataLength={ListServices.length}
          next={fetchMoreService}
          hasMore={hasMore}
          loader={ListServices.length < Total && 'Đang tải ...'}
          //inverse={true}
          scrollThreshold={1}
          scrollableTarget="scrollableDiv"
        >
          {loading && (
            <>
              {Array(5)
                .fill()
                .map((item, index) => (
                  <div className="position-relative service-box" key={index}>
                    <div className="item-service">
                      <div className="item-service__title fw-600">
                        <Placeholder animation="glow">
                          <Placeholder xs={8} />
                        </Placeholder>
                        {/* {item.Title} */}
                      </div>
                      <div className="item-service__desc text-muted">
                        <Placeholder animation="glow">
                          <Placeholder xs={8} />
                          <Placeholder xs={4} />
                        </Placeholder>
                      </div>
                      <i className="fa-regular fa-circle-check"></i>
                    </div>
                  </div>
                ))}
            </>
          )}
          {!loading && (
            <>
              {ListServices && ListServices.length > 0 ? (
                <>
                  {ListServices.map((item, index) => (
                    <div className="position-relative service-box" key={index}>
                      <Field
                        type="checkbox"
                        name="RootIdS"
                        value={item.ID.toString()}
                      />
                      <div
                        className={clsx(
                          'item-service',
                          ServiceHOT(item) && !TreatmentCard(item) && 'deal-hot'
                        )}
                      >
                        <div className="item-service__title fw-600">
                          {item.Title}
                          <label className="badge badge-danger ml-5px">
                            HOT
                          </label>
                        </div>
                        <div className="font-size-sm text-muted my-2px">
                          {item.ProdItems &&
                            item.ProdItems.map(prod => prod.Title).join(', ')}
                        </div>
                        {TreatmentCard(item) && (
                          <div className="item-desc item-treat fw-500">
                            <i className="text-ezs fa-solid fa-tag pr-8px"></i>
                            <span>
                              {item.OsBH > 0
                                ? 'Đang có thẻ bảo hành'
                                : 'Đang có thẻ liệu trình'}
                            </span>
                          </div>
                        )}
                        {item.SaleDecs && (
                          <div
                            className="item-service__desc text-muted"
                            dangerouslySetInnerHTML={{
                              __html: item.SaleDecs
                            }}
                          ></div>
                        )}
                        <i className="fa-regular fa-circle-check"></i>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div>Chưa có dịch vụ</div>
              )}
            </>
          )}
        </InfiniteScroll>
      </div>
      <div className="pt-15px bg-white">
        <button
          type="submit"
          className={clsx(
            'btn btn-ezs w-100 rounded-0 text-uppercase h-42px fw-500',
            loadingBtn && 'spinner spinner-white spinner-right'
          )}
        >
          {values.ID ? 'Thay đổi lịch' : 'Đặt lịch ngay'}
        </button>
      </div>
    </div>
  )
}

export default Confirm
