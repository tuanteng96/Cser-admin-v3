import React, { Fragment, useEffect, useRef, useState } from 'react'
import Navbar from '../../components/Navbar'
import { NumericFormat } from 'react-number-format'
import { NavLink } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import { useSelector } from 'react-redux'
import worksheetApi from 'src/api/worksheet.api'
import locale from 'antd/es/date-picker/locale/de_DE'
import { FastField, FieldArray, Form, Formik } from 'formik'
import clsx from 'clsx'
import { TimePicker } from 'antd'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

function TimekeepingHome(props) {
  const { Stocks, CrStockID } = useSelector(({ auth }) => ({
    Stocks: auth?.Info?.Stocks || [],
    CrStockID: auth?.Info?.CrStockID
  }))
  const [StocksList, setStocksList] = useState([])
  const [CrDate, setCrDate] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    From: '',
    To: '',
    StockID: '',
    key: ''
  })
  const [initialValues, setInitialValues] = useState({ list: [] })

  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    const newStocks = Stocks.filter(stock => stock.ParentID !== 0).map(
      stock => ({
        ...stock,
        value: stock.ID,
        label: stock.Title
      })
    )
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
    setStocksList(newStocks)
  }, [Stocks, CrStockID])

  useEffect(() => {
    setFilters(prevState => ({
      ...prevState,
      From: CrDate ? moment(CrDate).format('DD/MM/YYYY') : '',
      To: CrDate ? moment(CrDate).format('DD/MM/YYYY') : ''
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
      From: filters.From,
      To: filters.To,
      StockID: filters.StockID ? filters.StockID.ID : ''
    }
    worksheetApi
      .getAllWorkSheet(newObj)
      .then(({ data }) => {
        if (data.list) {
          setInitialValues(prevState => ({
            ...prevState,
            list: data.list.map(item => {
              let newObj = {
                Date: CrDate,
                Hours: [
                  ['', ''],
                  ['', '']
                ],
                Desc: '',
                WorkQty: '',
                WorkQty1: '',
                WorkQty2: ''
              }
              if (
                item.Dates[0].UserWorks &&
                item.Dates[0].UserWorks.length > 0
              ) {
                const newHours =
                  item.Dates[0].UserWorks[0].HourList.length > 0
                    ? item.Dates[0].UserWorks[0].HourList.map(hour => [
                        hour.From ? moment(hour.From, 'HH:mm:ss') : '',
                        hour.To ? moment(hour.To, 'HH:mm:ss') : ''
                      ])
                    : []

                newObj = {
                  ...item.Dates[0].UserWorks[0],
                  Hours: newHours
                    ? newHours.length >= 2
                      ? newHours
                      : [...newHours, ['', '']]
                    : [
                        ['', ''],
                        ['', '']
                      ]
                }
              }
              return {
                ...item,
                ...newObj
              }
            })
          }))
        }
        setLoading(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onSubmit = values => {
    const newValues = {
      list: values.list
        ? values.list.map(item => ({
            UserID: item.UserID,
            Date: moment(item.Date).format('DD/MM/YYYY'),
            Hours: item.Hours
              ? item.Hours.map(hour => ({
                  From: hour && hour[0] ? hour[0].format('HH:mm:ss') : '',
                  To: hour && hour[1] ? hour[1].format('HH:mm:ss') : ''
                })).filter(hour => hour.From && hour.To)
              : [],
            Desc: item.Desc,
            WorkQty: item.WorkQty,
            WorkQty1: item.WorkQty1,
            WorkQty2: item.WorkQty2
          }))
        : []
    }
    worksheetApi
      .checkinWorkSheet(newValues)
      .then(({ data }) => {
        getListWorkSheet(() => {
          window.top.toastr &&
            window.top.toastr.success('Cập nhập thành công !', {
              timeOut: 1500
            })
        })
      })
      .catch(error => console.log(error))
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {formikProps => {
        // errors, touched, handleChange, handleBlur
        const { values } = formikProps
        return (
          <Form className="h-100" autoComplete="off">
            <div className="card h-100 timekeeping">
              <div className="card-header">
                <h3 className="text-uppercase">
                  <div>
                    Chấm công
                    <span className="text-muted text-capitalize fw-500 font-size-sm pl-5px">
                      Ngày
                      <span className="font-number pl-3px">
                        {moment(CrDate).format('DD-MM-YYYY')}
                      </span>
                    </span>
                  </div>
                </h3>
                <div className="d-flex align-items-center justify-content-center">
                  <div className="position-relative">
                    <input
                      className="form-control form-control-solid w-250px"
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
                  <div className="w-250px mx-15px">
                    <Select
                      options={StocksList}
                      className="select-control select-control-solid"
                      classNamePrefix="select"
                      placeholder="Chọn cơ sở"
                      value={filters.StockID}
                      onChange={otp =>
                        setFilters(prevState => ({
                          ...prevState,
                          StockID: otp
                        }))
                      }
                    />
                  </div>
                  <div className="position-relative">
                    <DatePicker
                      selected={CrDate}
                      onChange={date => setCrDate(date)}
                      className="form-control form-control-solid"
                      dateFormat={'dd/MM/yyyy'}
                      maxDate={new Date()}
                    />
                    <i className="fa-regular fa-calendar-range position-absolute w-25px h-100 top-0 right-0 d-flex align-items-center pointer-events-none font-size-md text-muted"></i>
                  </div>
                  <div className="h-40px w-1px border-right mx-15px"></div>
                  <NavLink
                    to="ca-lam-viec"
                    className="btn btn-light border fw-600 mr-10px"
                  >
                    <i className="fa-regular fa-gear mr-8px"></i>
                    Ca làm việc
                  </NavLink>
                  <Navbar />
                </div>
              </div>
              <div
                className={clsx(
                  'card-body p-0 overlay',
                  loading ? 'overflow-hidden' : 'overflow-auto'
                )}
              >
                <FieldArray
                  name="list"
                  render={arrayHelpers => (
                    <Fragment>
                      {values.list &&
                        values.list.map((item, index) => (
                          <div className="timekeeping-item" key={index}>
                            <div className="timekeeping-col col-name">
                              <NavLink
                                to={`/bang-cham-cong/${index}`}
                                className="fw-700 text-truncate text-name text-decoration-none text-black font-size-15px text-capitalize"
                              >
                                {item.FullName}
                              </NavLink>
                            </div>
                            <div className="timekeeping-col col-name">
                              {
                                <FieldArray
                                  name="Hours"
                                  render={hoursHelpers => (
                                    <Fragment>
                                      {item.Hours.slice(0, 2).map((hour, i) => (
                                        <div
                                          className={clsx(i === 0 && 'mb-6px')}
                                          key={i}
                                        >
                                          <FastField
                                            name={`list[${index}].Hours[${i}]`}
                                            placeholder="F"
                                          >
                                            {({ field, form, meta }) => (
                                              <TimePicker.RangePicker
                                                locale={{
                                                  ...locale,
                                                  lang: {
                                                    ...locale.lang,
                                                    ok: 'Lưu giờ'
                                                  }
                                                }}
                                                placeholder={[
                                                  'Bắt đầu',
                                                  'Kết thúc'
                                                ]}
                                                onChange={(
                                                  value,
                                                  dateString
                                                ) => {
                                                  form.setFieldValue(
                                                    `list[${index}].Hours[${i}]`,
                                                    value,
                                                    false
                                                  )
                                                }}
                                                value={field.value}
                                                allowEmpty={[true, true]}
                                              />
                                            )}
                                          </FastField>
                                          {/* <TimePicker.RangePicker
                                            locale={{
                                              ...locale,
                                              lang: {
                                                ...locale.lang,
                                                ok: 'Lưu giờ'
                                              }
                                            }}
                                            placeholder={[
                                              'Bắt đầu',
                                              'Kết thúc'
                                            ]}
                                            onChange={(value, dateString) => {
                                              setFieldValue(
                                                `list[${index}].Hours[${i}]`,
                                                value,
                                                false
                                              )
                                            }}
                                            value={hour}
                                          /> */}
                                        </div>
                                      ))}
                                    </Fragment>
                                  )}
                                />
                              }
                            </div>
                            <div className="timekeeping-col col-input">
                              <label className="name-control">Công</label>
                              <FastField name={`list[${index}].WorkQty`}>
                                {({ field, form }) => (
                                  <NumericFormat
                                    className="form-control form-control-solid"
                                    type="text"
                                    placeholder="Nhập số công"
                                    onValueChange={val =>
                                      form.setFieldValue(
                                        `list[${index}].WorkQty`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      )
                                    }
                                    autoComplete="off"
                                    {...field}
                                  />
                                )}
                              </FastField>
                            </div>
                            <div className="timekeeping-col col-input">
                              <label className="name-control">Tăng ca</label>
                              <FastField name={`list[${index}].WorkQty1`}>
                                {({ field, form }) => (
                                  <NumericFormat
                                    className="form-control form-control-solid"
                                    type="text"
                                    placeholder="Thời gian tăng ca"
                                    onValueChange={val =>
                                      form.setFieldValue(
                                        `list[${index}].WorkQty1`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      )
                                    }
                                    autoComplete="off"
                                    {...field}
                                  />
                                )}
                              </FastField>
                            </div>
                            <div className="timekeeping-col col-input">
                              <label className="name-control">Thiếu giờ</label>
                              <FastField name={`list[${index}].WorkQty2`}>
                                {({ field, form }) => (
                                  <NumericFormat
                                    className="form-control form-control-solid"
                                    type="text"
                                    placeholder="Thời gian thiếu"
                                    onValueChange={val =>
                                      form.setFieldValue(
                                        `list[${index}].WorkQty2`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      )
                                    }
                                    autoComplete="off"
                                    {...field}
                                  />
                                )}
                              </FastField>
                            </div>
                            <div className="timekeeping-col">
                              <label className="name-control">
                                Ghi chú thêm
                              </label>
                              <FastField name={`list[${index}].Desc`}>
                                {({ field }) => (
                                  <input
                                    className="form-control form-control-solid"
                                    type="text"
                                    placeholder="Ghi chú"
                                    {...field}
                                  />
                                )}
                              </FastField>
                            </div>
                          </div>
                        ))}
                    </Fragment>
                  )}
                />
                <div
                  className={clsx(
                    'overlay-layer bg-dark-o-10 top-0 h-100 zindex-1001',
                    loading && 'overlay-block'
                  )}
                >
                  <div className="spinner spinner-primary"></div>
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end align-items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    'btn btn-success fw-500',
                    loading && 'spinner spinner-white spinner-right'
                  )}
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

export default TimekeepingHome
