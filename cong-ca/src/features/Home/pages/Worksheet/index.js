import React, { useEffect, useRef, useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import CalendarFull from '../../components/CalendarFull'
import DatePicker from 'react-datepicker'
import Navbar from '../../components/Navbar'
import ModalHolidaySchedule from '../../components/Modal/ModalHolidaySchedule'
import { useSelector } from 'react-redux'
import worksheetApi from 'src/api/worksheet.api'
import ModalTimeKeeping from '../../components/Modal/ModalTimeKeeping'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function Worksheet(props) {
  const { Stocks, CrStockID, rightsSum } = useSelector(({ auth }) => ({
    Stocks: auth?.Info?.Stocks || [],
    CrStockID: auth?.Info?.CrStockID,
    rightsSum: auth?.Info?.rightsSum?.cong_ca
  }))
  const [List, setList] = useState([])
  const [StocksList, setStocksList] = useState([])
  const [CrDate, setCrDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    From: '',
    To: '',
    StockID: '',
    key: ''
  })
  const [ModalKeep, setModalKeep] = useState({
    initialValues: null,
    show: false,
    loading: false,
    delete: false
  })
  const [ModalHoliday, setModalHoliday] = useState({
    initialValues: null,
    show: false,
    loading: false
  })

  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    let newStocks = Stocks.filter(stock => stock.ParentID !== 0)
    if (rightsSum?.hasRight) {
      if (rightsSum?.IsAllStock) {
        newStocks = [{ ID: '', Title: 'Tất cả cơ sở' }, ...newStocks]
      } else {
        newStocks = newStocks.filter(
          o => rightsSum.stocks && rightsSum.stocks.some(x => x.ID === o.ID)
        )
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
    }
    setStocksList(newStocks)
  }, [Stocks, CrStockID, rightsSum])

  useEffect(() => {
    setFilters(prevState => ({
      ...prevState,
      From: CrDate
        ? moment(CrDate).clone().weekday(0).format('DD/MM/YYYY')
        : '',
      To: CrDate ? moment(CrDate).clone().weekday(6).format('DD/MM/YYYY') : ''
    }))
  }, [CrDate])

  useEffect(() => {
    getListWorkSheet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListWorkSheet = callback => {
    if (!filters.StockID || !filters.From || !filters.To) return
    !loading && setLoading(true)
    const newObj = {
      ...filters,
      From: moment(CrDate).clone().weekday(0).format('DD/MM/YYYY'),
      To: moment(CrDate).clone().weekday(6).format('DD/MM/YYYY'),
      StockID: filters.StockID ? filters.StockID.ID : ''
    }
    worksheetApi
      .getAllWorkSheet(newObj)
      .then(({ data }) => {
        setList(data.list)
        setLoading(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onOpenModalKeep = value => {
    setModalKeep(prevState => ({
      ...prevState,
      initialValues: value,
      show: true
    }))
  }

  const onHideModalKeep = () => {
    setModalKeep({
      initialValues: null,
      show: false,
      loading: false,
      delete: false
    })
  }

  const onOpenModalHoliday = value => {
    setModalHoliday({
      initialValues: value,
      show: true
    })
  }

  const onHideModalHoliday = () => {
    setModalHoliday({
      initialValues: null,
      show: false,
      loading: false
    })
  }

  const onSubmitKeep = values => {
    setModalKeep(prevState => ({
      ...prevState,
      loading: true
    }))
    const newValues = {
      list: [
        {
          ...values,
          Date: moment(values.Date).format('DD/MM/YYYY'),
          Hours: values.Hours.map(hour => ({
            From: hour && hour[0] ? hour[0].format('HH:mm:ss') : '',
            To: hour && hour[1] ? hour[1].format('HH:mm:ss') : ''
          })).filter(hour => hour.From)
        }
      ]
    }
    worksheetApi
      .checkinWorkSheet(newValues)
      .then(({ data }) => {
        getListWorkSheet(() => {
          onHideModalKeep()
          window.top.toastr &&
            window.top.toastr.success('Cập nhập thành công !', {
              timeOut: 1500
            })
        })
      })
      .catch(error => console.log(error))
  }

  const onSubmitHoliday = (values, { resetFrom }) => {
    setModalHoliday(prevState => ({
      ...prevState,
      loading: true
    }))
    const newValues = {
      ...values,
      UserID: values?.UserID ? values?.UserID.value : '',
      From: values.From
        ? moment(values.From).format('DD/MM/YYYY HH:mm:ss')
        : '',
      To: values.To ? moment(values.To).format('DD/MM/YYYY HH:mm:ss') : ''
    }
    worksheetApi
      .addWorkOff(newValues)
      .then(({ data }) => {
        getListWorkSheet(() => {
          onHideModalHoliday()
          window.top.toastr &&
            window.top.toastr.success('Xin nghỉ thành công !', {
              timeOut: 1500
            })
        })
      })
      .catch(error => console.log(error))
  }

  const onDeleteHoliday = GroupTick => {
    setModalHoliday(prevState => ({
      ...prevState,
      loading: true
    }))
    worksheetApi
      .deleteWorkOff({ GroupTick: GroupTick })
      .then(({ data }) => {
        getListWorkSheet(() => {
          onHideModalHoliday()
          window.top.toastr &&
            window.top.toastr.success('Xóa lịch nghỉ thành công !', {
              timeOut: 1500
            })
        })
      })
      .catch(error => console.log(error))
  }

  const onDeleteKeep = values => {
    setModalKeep(prevState => ({
      ...prevState,
      delete: true
    }))
    const newValues = {
      list: [
        {
          Date: moment(values.Date).format('DD/MM/YYYY'),
          UserID: values?.Member?.ID
        }
      ]
    }
    worksheetApi
      .deleteWorkSheet(newValues)
      .then(({ data }) => {
        getListWorkSheet(() => {
          onHideModalKeep()
          window.top.toastr &&
            window.top.toastr.success('Hủy thành công !', {
              timeOut: 1500
            })
        })
      })
      .catch(error => console.log(error))
  }

  return (
    <>
      <div className="card h-100 card-timesheets">
        <div className="card-header p-20px">
          <Dropdown className="d-inline mx-0 mx-md-2">
            <Dropdown.Toggle className="btn-none">
              <h3 className="text-uppercase">
                {filters.StockID?.Title}
                <i className="fa-regular fa-chevron-down pl-3px"></i>
              </h3>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {StocksList &&
                StocksList.map((o, index) => (
                  <Dropdown.Item
                    href="#"
                    key={index}
                    active={o.ID === filters.StockID.ID}
                    onClick={() =>
                      setFilters(prevState => ({
                        ...prevState,
                        StockID: o
                      }))
                    }
                  >
                    {o.Title}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>
          <div className="d-flex align-items-center justify-content-center">
            <Navbar />
          </div>
        </div>
        <div className="card-body p-20px">
          <div className="d-flex flex-column flex-md-row justify-content-between">
            <div className="d-flex mb-md-0 mb-12px">
              <div className="mr-8px position-relative date-range flex-1">
                <DatePicker
                  selected={CrDate}
                  onChange={date => setCrDate(date)}
                  className="form-control w-100 w-md-200px w-lg-250px"
                  dateFormat={'dd/MM/yyyy'}
                />
                <div className="date-current fw-500">
                  {filters.From} - {filters.To}
                </div>
                <i className="fa-regular fa-calendar-range position-absolute w-25px h-100 top-0 right-0 d-flex align-items-center pointer-events-none font-size-md text-muted"></i>
              </div>
              <button
                className="btn btn-light w-35px border"
                onClick={() =>
                  setCrDate(moment(CrDate).subtract(1, 'weeks').toDate())
                }
                disabled={loading}
              >
                <i className="fa-regular fa-angle-left text-muted"></i>
              </button>
              <button
                className="btn btn-light ml-5px w-35px border"
                onClick={() =>
                  setCrDate(moment(CrDate).add(1, 'weeks').toDate())
                }
                disabled={loading}
              >
                <i className="fa-regular fa-angle-right text-muted"></i>
              </button>
            </div>
            <div className="d-flex">
              <button className="btn btn-light border fw-600 mr-10px">
                <i className="fa-regular fa-gear mr-8px"></i>
                Ca làm việc
              </button>
              <button
                className="btn btn-light-danger fw-600 mr-8px w-120px"
                onClick={() => onOpenModalHoliday()}
              >
                Tạo ngày nghỉ
              </button>
              <div className="position-relative flex-1">
                <input
                  className="form-control w-100 w-lg-300px"
                  type="text"
                  placeholder="Nhập tên nhân viên"
                  onChange={evt => {
                    setLoading(true)
                    if (typingTimeoutRef.current) {
                      clearTimeout(typingTimeoutRef.current)
                    }
                    typingTimeoutRef.current = setTimeout(() => {
                      setFilters(prevState => ({
                        ...prevState,
                        Key: evt.target.value
                      }))
                    }, 800)
                  }}
                />
                <i className="fa-regular fa-magnifying-glass position-absolute w-30px h-100 top-0 right-0 d-flex align-items-center pointer-events-none font-size-md text-muted"></i>
              </div>
            </div>
          </div>
          <CalendarFull
            data={List}
            loading={loading}
            CrDate={CrDate}
            onOpenModalKeep={onOpenModalKeep}
            onOpenModalHoliday={onOpenModalHoliday}
          />
        </div>
        <ModalHolidaySchedule
          show={ModalHoliday.show}
          onHide={onHideModalHoliday}
          onSubmit={onSubmitHoliday}
          onDelete={onDeleteHoliday}
          loading={ModalHoliday.loading}
          initialModal={ModalHoliday.initialValues}
        />
        <ModalTimeKeeping
          show={ModalKeep.show}
          initialModal={ModalKeep.initialValues}
          onHide={onHideModalKeep}
          onSubmit={onSubmitKeep}
          onDelete={onDeleteKeep}
          loading={ModalKeep.loading}
          loadingDelete={ModalKeep.delete}
        />
      </div>
    </>
  )
}

export default Worksheet
