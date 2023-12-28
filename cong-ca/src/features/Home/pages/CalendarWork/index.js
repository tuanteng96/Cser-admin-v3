import React, { Fragment, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import worksheetApi from 'src/api/worksheet.api'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { useQuery } from 'react-query'

function CalendarWork(props) {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    Month: new Date(),
    StockID: ''
  })
  const { Stocks, CrStockID, rightsSum } = useSelector(({ auth }) => ({
    Stocks: auth?.Info?.Stocks || [],
    rightsSum: auth?.Info?.rightsSum?.cong_ca || {},
    CrStockID: auth?.Info?.CrStockID
  }))

  const scrollRef = useRef('')

  useEffect(() => {
    let newStocks = rightsSum?.stocks?.map(stock => ({
      ...stock,
      label: stock.Title,
      value: stock.ID
    }))
    if (rightsSum?.IsAllStock) {
      let index = Stocks.findIndex(x => x.ID === 778)
      if (index > -1) {
        newStocks.unshift({
          ...Stocks[index],
          value: Stocks[index].ID,
          label: 'Hệ thống'
        })
      }
    }
    if (newStocks.length > 0) {
      if (!CrStockID) {
        setFilters(prevState => ({
          ...prevState,
          StockID: newStocks[0]
        }))
      } else {
        setFilters(prevState => ({
          ...prevState,
          StockID: newStocks.filter(o => o.ID === CrStockID)[0]
        }))
      }
    }
  }, [Stocks, CrStockID, rightsSum])

  const { isLoading, data } = useQuery({
    queryKey: ['ListCalendarWork', filters],
    queryFn: async () => {
      const newObj = {
        mon: filters.Month ? moment(filters.Month).format('MM/YYYY') : '',
        stockid: filters.StockID ? filters.StockID.ID : ''
      }

      const { data } = await worksheetApi.getCalendarWork(newObj)
      return {
        ...data,
        days: data.days
          ? data.days.map(x => ({
              ...x,
              Users: x.Users
                ? x.Users.filter(u => u.WorkTimeSetting || u.Offs).filter(u =>
                    getTimeWork({
                      WorkTimeSetting: u.WorkTimeSetting,
                      CA_LAM_VIEC: data.calamviecconfig,
                      INDEX_NGAY:
                        Number(moment(x.Date).day()) === 0
                          ? 6
                          : Number(moment(x.Date).day()) - 1
                    })
                  )
                : []
            }))
          : []
      }
    },
    enabled: Boolean(filters.StockID),
    keepPreviousData: true
  })

  useEffect(() => {
    if (scrollRef.current) {
      if (
        moment(filters.Month).format('MM-YYYY') === moment().format('MM-YYYY')
      ) {
        scrollRef.current.scrollLeft +=
          Number(moment().format('DD')) > 7
            ? (Number(moment().format('DD')) - 1) * 275
            : Number(moment().format('DD')) * 275
      } else {
        scrollRef.current.scrollLeft = 0
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollRef, data, filters])

  const getTimeWork = ({ WorkTimeSetting, CA_LAM_VIEC, INDEX_NGAY }) => {
    if (!WorkTimeSetting || !CA_LAM_VIEC || INDEX_NGAY < 0) return
    let index = CA_LAM_VIEC.findIndex(x => x.ID === WorkTimeSetting.ShiftID)
    if (index < 0) return
    let Day =
      CA_LAM_VIEC[index].Days &&
      CA_LAM_VIEC[index].Days.findIndex(d => d.index === INDEX_NGAY)
    if (Day > -1) {
      return `${CA_LAM_VIEC[index].Name} : ${CA_LAM_VIEC[index].Days[Day].TimeFrom} - ${CA_LAM_VIEC[index].Days[Day].TimeTo}`
    }
  }

  return (
    <div className="!overflow-x-hidden card h-100 timekeeping">
      <div className="card-header d-block p-20px min-h-125px min-h-md-auto">
        <div className="w-full d-flex justify-content-between flex-column flex-md-row">
          <h3 className="text-uppercase">
            <div className="d-flex align-items-baseline">
              <div
                className="cursor-pointer d-flex"
                onClick={() => navigate('/')}
              >
                <div className="w-20px">
                  <i className="ml-0 fa-regular fa-chevron-left vertical-align-middle text-muted"></i>
                </div>
                Lịch làm việc
              </div>
            </div>
          </h3>
          <div className="d-flex align-items-center justify-content-center mt-5px mt-md-0">
            <div className="position-relative">
              <DatePicker
                locale="vi"
                className="form-control form-control-solid fw-500"
                dateFormat={'MM/yyyy'}
                showMonthYearPicker
                selected={filters.Month}
                onChange={date =>
                  setFilters(prevState => ({
                    ...prevState,
                    Month: date
                  }))
                }
              />
              <i className="top-0 right-0 pointer-events-none fa-regular fa-calendar-range position-absolute w-25px h-100 d-flex align-items-center font-size-md text-muted"></i>
            </div>
          </div>
        </div>
      </div>
      <div
        className="p-0 card-body overflow-x-auto overflow-y-hidden relative"
        ref={scrollRef}
      >
        {!isLoading && (
          <div className="flex h-full">
            {data &&
              data.days &&
              data.days.map((item, index) => (
                <div
                  className={`w-[275px] min-w-[275px] h-full border-r border-t-0 border-l-0 border-b-0 border-[#ebebec] border-solid last:border-r-0`}
                  key={index}
                >
                  <div className="bg-[#f8f8f8] h-[48px] flex items-center justify-center font-semibold border-b border-t-0 border-l-0 border-r-0 border-[#ebebec] border-solid">
                    {moment(item.Date).format('ddd, DD-MM-YYYY')}
                  </div>
                  <div className="h-[calc(100%-48px)] overflow-auto p-3">
                    {item.Users &&
                      item.Users.map((user, i) => (
                        <div
                          className="mb-1.5 last:mb-0 bg-[#777777] rounded-sm text-white p-2 cursor-pointer text-[13px]"
                          key={i}
                        >
                          <div>{user.User?.FullName}</div>
                          <div>
                            {getTimeWork({
                              WorkTimeSetting: user.WorkTimeSetting,
                              CA_LAM_VIEC: data.calamviecconfig,
                              INDEX_NGAY:
                                Number(moment(item.Date).day()) === 0
                                  ? 6
                                  : Number(moment(item.Date).day()) - 1
                            })}
                          </div>
                          <div className="mt-1">
                            {user.Offs &&
                              user.Offs.map((off, i) => (
                                <div
                                  div
                                  className="mb-1.5 last:mb-0 bg-danger rounded-sm text-white p-2 cursor-pointer"
                                  key={i}
                                >
                                  <div>
                                    <span className="pr-1.5">Nghỉ từ</span>
                                    {moment(off.From).format('HH:mm')}
                                    <span className="px-1.5">-</span>
                                    {moment(off.To).format('HH:mm')}
                                  </div>
                                  {off.Desc && <div>Lý do : {off.Desc}</div>}
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    {item.Users &&
                      item.Users.filter(x => !x.WorkTimeSetting).map(
                        (user, i) => (
                          <Fragment key={i}>
                            {user.Offs &&
                              user.Offs.map((off, i) => (
                                <div
                                  div
                                  className="mb-1.5 last:mb-0 bg-danger rounded-sm text-white p-2 cursor-pointer"
                                  key={i}
                                >
                                  <div>{user.User?.FullName}</div>
                                  <div>
                                    {moment(off.From).format('HH:mm')}
                                    <span className="px-1.5">-</span>
                                    {moment(off.To).format('HH:mm')}
                                  </div>
                                  {off.Desc && <div>{off.Desc}</div>}
                                </div>
                              ))}
                          </Fragment>
                        )
                      )}
                  </div>
                </div>
              ))}
          </div>
        )}
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-9 h-9 text-gray-200 animate-spin dark:text-gray-300 fill-primary"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarWork
