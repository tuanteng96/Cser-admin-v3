import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import InfiniteScroll from 'react-infinite-scroll-component'
import bookingApi from 'src/api/booking.api'
import clsx from 'clsx'
import { Field } from 'formik'
import { Placeholder } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

Confirm.propTypes = {
  prevStep: PropTypes.func
}

function Confirm({ prevStep, formikProps, onSubmit, loadingBtn }) {
  const { t } = useTranslation()

  const { values, setFieldValue } = formikProps
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
  }, [filters, values?.StockID])

  const getListServices = async () => {
    !loading && !noLoading && setLoading(true)
    const objFilters = {
      ...filters,
      Key: filters.Key || valueS,
      StockID: values?.StockID || ''
    }
    const { data } = await bookingApi.getService(objFilters)
    const lst =
      filters.Pi > 1 ? [...new Set([...ListServices, ...data.lst])] : data.lst
    if (lst.length >= data.total) {
      setHasMore(false)
    }
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

  let RootIdS = values?.RootIdS || []

  return (
    <div className="d-flex flex-column h-100">
      <div className="text-center bg-white border-bottom p-15px text-uppercase fw-700 font-size-md position-relative">
        <div
          className="top-0 left-0 cursor-pointer position-absolute w-50px h-100 d-flex align-items-center justify-content-center"
          onClick={prevStep}
        >
          <i className="fa-regular fa-chevron-left"></i>
        </div>
        {t("booking.CHON_DICH_VU")}
      </div>
      <div className="bg-white confirm-search mt-2px p-15px">
        <div className="position-relative">
          <input
            className="form-control h-45px"
            type="text"
            placeholder={t("booking.NHAP_TEN_DICH_VU_BAN_CAN")}
            value={valueS}
            onChange={e => handleSearch(e.target.value)}
          />
          <i className="fa-regular fa-magnifying-glass"></i>
        </div>
      </div>
      <div
        className="overflow-auto bg-white flex-grow-1 px-15px"
        id="scrollableDiv"
      >
        <InfiniteScroll
          dataLength={ListServices.length}
          next={fetchMoreService}
          hasMore={hasMore}
          loader={<>{t("booking.DANG_TAI")}.</>}
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
                      <input
                        type="checkbox"
                        onChange={e => {
                          if (e.target.checked) {
                            setFieldValue('RootIdS', [...RootIdS, item])
                          } else {
                            setFieldValue(
                              'RootIdS',
                              RootIdS.filter(x =>
                                typeof x === 'object'
                                  ? x.ID !== item.ID
                                  : Number(x) !== item.ID
                              )
                            )
                          }
                        }}
                        checked={RootIdS.some(x =>
                          typeof x === 'object'
                            ? x.ID === item.ID
                            : Number(x) === item.ID
                        )}
                      />
                      <div
                        className={clsx(
                          'item-service',
                          ServiceHOT(item) && !TreatmentCard(item) && 'deal-hot'
                        )}
                      >
                        <div className="item-service__title fw-600">
                          {item.Title}
                          <label className="hot badge badge-danger ml-5px">
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
                                ? t("booking.DANG_CO_THE_BAO_HANH")
                                : t("booking.DANG_CO_THE_LIEU_TRINH")}
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
                <div>{t("booking.CHUA_CO_DICH_VU")}</div>
              )}
            </>
          )}
        </InfiniteScroll>
      </div>
      <div className="bg-white pt-15px">
        <button
          type="submit"
          className={clsx(
            'btn btn-ezs w-100 rounded-0 text-uppercase h-42px fw-500',
            loadingBtn && 'spinner spinner-white spinner-right'
          )}
          disabled={loadingBtn || !RootIdS || RootIdS.length === 0}
        >
          {values.ID ? t("booking.THAY_DOI_LICH") : t("booking.DAT_LICH_NGAY")}
        </button>
      </div>
    </div>
  )
}

export default Confirm
