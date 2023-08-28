import React, { Fragment, useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import worksheetApi from 'src/api/worksheet.api'
import clsx from 'clsx'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function TimekeepingMember(props) {
  const navigate = useNavigate()
  let { id } = useParams()

  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    From: '',
    To: '',
    StockID: '',
    key: '',
    UserID: Number(id)
  })
  const [List, setList] = useState([])
  const [CurrentUser, setCurrentUser] = useState(null)
  const [CrDate, setCrDate] = useState(new Date())

  useEffect(() => {
    setFilters(prevState => ({
      ...prevState,
      From: CrDate ? moment(CrDate).startOf('month').format('DD/MM/YYYY') : '',
      To: CrDate ? moment(CrDate).endOf('month').format('DD/MM/YYYY') : ''
    }))
  }, [CrDate])

  useEffect(() => {
    getListWorkSheet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListWorkSheet = callback => {
    if (!filters.From || !filters.To) return
    !loading && setLoading(true)
    worksheetApi
      .getAllWorkSheet(filters)
      .then(({ data }) => {
        if (data.list && data.list.length > 0) {
          setList(data.list[0].Dates)
          setCurrentUser(data.list[0])
        }
        setLoading(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const getTotal = key => {
    const newList = List.filter(o => o.UserWorks && o.UserWorks.length > 0).map(
      o => ({
        ...o,
        WorkQty: o.UserWorks[0].WorkQty,
        WorkQty1: o.UserWorks[0].WorkQty1,
        WorkQty2: o.UserWorks[0].WorkQty2
      })
    )
    return newList.reduce((a, b) => a + (b[key] || 0), 0)
  }

  return (
    <div className="card h-100 timekeeping">
      <div className="card-header d-block p-20px min-h-125px min-h-md-auto">
        <div className="d-flex w-full justify-content-between flex-column flex-md-row">
          <h3 className="text-uppercase">
            <div className="d-flex align-items-baseline">
              <div
                className="d-flex cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-20px">
                  <i className="fa-regular fa-chevron-left ml-0 vertical-align-middle text-muted"></i>
                </div>
                {loading ? 'Đang tải ...' : CurrentUser?.FullName}
              </div>
              {!loading && (
                <span className="text-muted text-capitalize fw-500 font-size-sm pl-5px">
                  {CurrentUser?.StockTitle}
                </span>
              )}
            </div>
          </h3>
          <div className="d-flex align-items-center justify-content-center mt-5px mt-md-0">
            <div className="position-relative">
              <DatePicker
                locale="vi"
                className="form-control form-control-solid fw-500"
                dateFormat={'MM/yyyy'}
                showMonthYearPicker
                selected={CrDate}
                onChange={date => setCrDate(date)}
              />
              <i className="fa-regular fa-calendar-range position-absolute w-25px h-100 top-0 right-0 d-flex align-items-center pointer-events-none font-size-md text-muted"></i>
            </div>
            <div className="h-40px w-1px border-right mx-15px"></div>
            <Navbar />
          </div>
        </div>
      </div>
      <div className="card-body overflow-auto p-0 overlay">
        <div className="timekeeping-table">
          {List &&
            List.map((item, index) => (
              <div
                className={clsx(
                  'timekeeping-item',
                  !moment().isSameOrAfter(item.Date) && 'opacity-40'
                )}
                key={index}
              >
                <div className="timekeeping-col col-name">
                  <div className="fw-700 text-truncate">
                    Ngày
                    <span className="pl-5px">
                      {moment(item.Date).format('DD-MM-YYYY')}
                    </span>
                  </div>
                </div>
                <div className="timekeeping-col col-checkinout">
                  {item.UserWorks &&
                    item.UserWorks.length > 0 &&
                    item.UserWorks[0].HourList &&
                    item.UserWorks[0].HourList.length > 0 && (
                      <Fragment>
                        {item.UserWorks[0].HourList.map((hour, idx) => (
                          <div className="event-main" key={idx}>
                            <div className="event-main__label bg-success h-20px">
                              {hour.From}
                            </div>
                            <div className="event-main__line">
                              <i className="fa-regular fa-arrow-right-long"></i>
                            </div>
                            <div className="event-main__label bg-danger h-20px">
                              {hour.To}
                            </div>
                          </div>
                        ))}
                      </Fragment>
                    )}
                </div>
                <div className="timekeeping-col">
                  <label className="name-control">Công</label>
                  <div className="fw-600">
                    {item.UserWorks && item.UserWorks.length > 0
                      ? item.UserWorks[0].WorkQty || 0
                      : 0}
                  </div>
                </div>
                <div className="timekeeping-col">
                  <label className="name-control">Tăng ca</label>
                  <div className="fw-600">
                    {item.UserWorks && item.UserWorks.length > 0
                      ? item.UserWorks[0].WorkQty1 || 0
                      : 0}
                  </div>
                </div>
                <div className="timekeeping-col">
                  <label className="name-control">Thiếu giờ</label>
                  <div className="fw-600">
                    {item.UserWorks && item.UserWorks.length > 0
                      ? item.UserWorks[0].WorkQty2 || 0
                      : 0}
                  </div>
                </div>
                <div className="timekeeping-col">
                  <label className="name-control">Ghi chú thêm</label>
                  <div className="fw-600">
                    {item.UserWorks && item.UserWorks.length > 0
                      ? item.UserWorks[0].Desc || 'Không'
                      : 'Không'}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div
          className={clsx(
            'overlay-layer bg-dark-o-10 top-0 zindex-1001 top-0',
            loading && 'overlay-block'
          )}
        >
          <div className="spinner spinner-primary"></div>
        </div>
      </div>
      <div className="card-footer d-flex flex-column px-0 overflow-hidden">
        <div className="d-flex h-100">
          <div className="py-0 w-280px d-none d-xl-block"></div>
          <div className="py-0 w-215px d-none d-lg-block"></div>
          <div className="px-20px flex-grow-1 d-flex flex-column justify-content-center">
            <div className="name-control mb-5px">Tổng công</div>
            {loading ? (
              <div>Đang tải ...</div>
            ) : (
              <div className="fw-600 font-number text-primary font-size-lg line-height-1">
                {getTotal('WorkQty')}
              </div>
            )}
          </div>
          <div className="px-20px flex-grow-1 d-flex flex-column justify-content-center border-left h-100">
            <div className="name-control mb-5px">Tổng tăng ca</div>
            {loading ? (
              <div>Đang tải ...</div>
            ) : (
              <div className="fw-600 font-number text-success font-size-lg line-height-1">
                {getTotal('WorkQty1')}
              </div>
            )}
          </div>
          <div className="px-20px flex-grow-1 d-flex flex-column justify-content-center border-left h-100">
            <div className="name-control mb-5px">Tổng thiếu giờ</div>
            {loading ? (
              <div>Đang tải ...</div>
            ) : (
              <div className="fw-600 font-number text-danger font-size-lg line-height-1">
                {getTotal('WorkQty2')}
              </div>
            )}
          </div>
          <div className="px-20px flex-grow-1 d-flex flex-column justify-content-center border-left h-100">
            <div className="name-control mb-5px">Tổng Công</div>
            {loading ? (
              <div>Đang tải ...</div>
            ) : (
              <div className="fw-600 font-number text-success font-size-lg line-height-1">
                {getTotal('WorkQty') +
                  getTotal('WorkQty1') -
                  getTotal('WorkQty2')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimekeepingMember
