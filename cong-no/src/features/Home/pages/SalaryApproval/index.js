import React, { Fragment, useEffect, useRef, useState } from 'react'
import Navbar from '../../components/Navbar'
import { NumericFormat } from 'react-number-format'
import DatePicker, { registerLocale } from 'react-datepicker'
import vi from 'date-fns/locale/vi'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import worksheetApi from 'src/api/worksheet.api'
import { FastField, FieldArray, Form, Formik } from 'formik'
import clsx from 'clsx'
import moreApi from 'src/api/more.api'
import uuid from 'react-uuid'

import moment from 'moment'
import 'moment/locale/vi'
import { Button, OverlayTrigger, Popover } from 'react-bootstrap'

moment.locale('vi')

registerLocale('vi', vi)

const InputFiles = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false)

  const UploadFile = event => {
    setLoading(true)
    const formData = new FormData()
    formData.append('data', event.target.files[0])
    moreApi
      .uploadFile(formData)
      .then(({ data }) => {
        setLoading(false)
        onChange(data.data)
      })
      .catch(error => console.log(error))
  }
  return (
    <div
      className={clsx(
        'input-file-custom',
        loading && 'spinner spinner-primary spinner-right'
      )}
    >
      <div className="choose">Chọn File</div>
      <div className={clsx('name', value && 'zindex-2')}>
        {value ? (
          <a
            className="text-truncate d-block"
            href={`/upload/image/${value}`}
            download
          >
            {value}
          </a>
        ) : (
          <div className="text-truncate">Chưa có File</div>
        )}
      </div>
      <input type="file" title="" name="file" onChange={UploadFile} />
    </div>
  )
}

function SalaryApproval(props) {
  const { Stocks, CrStockID, rightsSum } = useSelector(({ auth }) => ({
    Stocks: auth?.Info?.Stocks || [],
    CrStockID: auth?.Info?.CrStockID,
    rightsSum: auth?.Info?.rightsSum?.cong_ca
  }))
  const [StocksList, setStocksList] = useState([])
  const [initialValues, setInitialValues] = useState({
    list: []
  })
  const [loading, setLoading] = useState(false)
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [filters, setFilters] = useState({
    Mon: new Date(),
    StockID: '',
    key: ''
  })

  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    let newStocks = Stocks.filter(stock => stock.ParentID !== 0).map(stock => ({
      ...stock,
      value: stock.ID,
      label: stock.Title
    }))
    if (rightsSum?.hasRight) {
      if (rightsSum?.IsAllStock) {
        //newStocks = [{ value: '', label: 'Tất cả cơ sở' }, ...newStocks]
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
    getListSalary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const getListSalary = (isLoading = true, callback) => {
    if (!filters.StockID) return
    isLoading && setLoading(true)
    // setInitialValues(prevState => ({
    //   ...prevState,
    //   list: []
    // }))
    const newObj = {
      ...filters,
      Mon: moment(filters.Mon).format('MM/YYYY'),
      StockID: filters.StockID ? filters.StockID.ID : ''
    }
    worksheetApi
      .getAllSalaryApproval(newObj)
      .then(({ data }) => {
        setInitialValues(prevState => ({
          ...prevState,
          list: data
            ? data.map(o => ({
                ...o,
                Desc: o.Desc || '',
                Mon: moment(filters.Mon).format('MM/YYYY'),
                Uuid: uuid()
              }))
            : []
        }))
        setLoading(false)
        callback && callback()
      })
      .catch(error => console.log(error))
  }

  const onSubmit = values => {
    setLoadingBtn(true)
    worksheetApi
      .addSalaryApproval(values)
      .then(({ data }) => {
        getListSalary(false, () => {
          setLoadingBtn(false)
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
            <div className="card h-100">
              <div className="card-header min-h-100px min-h-sm-70px">
                <div className="d-flex align-items-xl-center justify-content-center justify-content-sm-between w-100 flex-column flex-sm-row align-items-baseline align-items-sm-center">
                  <h3 className="text-uppercase">Duyệt lương</h3>
                  <div className="d-flex align-items-center justify-content-center">
                    <div className="d-none d-xl-flex">
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
                                key: evt.target.value
                              }))
                            }, 800)
                          }}
                        />
                        <i className="fa-regular fa-magnifying-glass position-absolute w-30px h-100 top-0 right-0 d-flex align-items-center pointer-events-none font-size-md text-muted"></i>
                      </div>
                      <div className="w-225px mx-15px">
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
                      <div className="mr-8px position-relative max-w-150px">
                        <DatePicker
                          locale="vi"
                          className="form-control form-control-solid fw-500"
                          dateFormat={'MM/yyyy'}
                          showMonthYearPicker
                          selected={filters.Mon}
                          onChange={date =>
                            setFilters(prevState => ({
                              ...prevState,
                              Mon: date
                            }))
                          }
                        />
                        <i className="fa-regular fa-calendar-range position-absolute w-25px h-100 top-0 right-0 d-flex align-items-center pointer-events-none font-size-md text-muted"></i>
                      </div>
                      <div className="h-40px w-1px border-right mx-15px"></div>
                    </div>
                    <Navbar />
                    <OverlayTrigger
                      trigger="click"
                      placement="bottom"
                      overlay={
                        <Popover
                          id="popover-positioned-bottom"
                          title="Popover bottom"
                        >
                          <div className="p-10px">
                            <div className="position-relative mb-10px">
                              <input
                                className="form-control form-control-solid w-100"
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
                                      key: evt.target.value
                                    }))
                                  }, 800)
                                }}
                              />
                              <i className="fa-regular fa-magnifying-glass position-absolute w-30px h-100 top-0 right-0 d-flex align-items-center pointer-events-none font-size-md text-muted"></i>
                            </div>
                            <Select
                              options={StocksList}
                              className="select-control select-control-solid mb-10px"
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
                            <div className="position-relative">
                              <DatePicker
                                locale="vi"
                                className="form-control form-control-solid fw-500"
                                dateFormat={'MM/yyyy'}
                                showMonthYearPicker
                                selected={filters.Mon}
                                onChange={date =>
                                  setFilters(prevState => ({
                                    ...prevState,
                                    Mon: date
                                  }))
                                }
                              />
                              <i className="fa-regular fa-calendar-range position-absolute w-25px h-100 top-0 right-0 d-flex align-items-center pointer-events-none font-size-md text-muted"></i>
                            </div>
                          </div>
                        </Popover>
                      }
                    >
                      <Button className="ml-8px d-block d-xl-none">
                        <i className="far fa-filter"></i>
                      </Button>
                    </OverlayTrigger>
                  </div>
                </div>
              </div>
              <div className="card-body overflow-auto p-0 overlay">
                {!loading && (
                  <>
                    {(!values.list || values.list.length === 0) && (
                      <div className="p-25px">Không có dữ liệu</div>
                    )}
                  </>
                )}
                <FieldArray
                  name="list"
                  render={arrayHelpers => (
                    <div className="timekeeping-table">
                      {values.list &&
                        values.list.map((item, index) => (
                          <div
                            className={clsx(
                              'timekeeping-item',
                              item.IsSet && 'bg-success'
                            )}
                            key={index}
                          >
                            <div className="timekeeping-col col-name">
                              <div className="fw-700 text-truncate">
                                {item.FullName}
                              </div>
                            </div>
                            <div className="timekeeping-col">
                              <label className="name-control">Tổng công</label>
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
                            <div className="timekeeping-col">
                              <label className="name-control">
                                Lương theo công
                              </label>
                              <FastField name={`list[${index}].WorkUnitSalary`}>
                                {({ field, form }) => (
                                  <NumericFormat
                                    name={field.name}
                                    value={field.value}
                                    className="form-control form-control-solid"
                                    type="text"
                                    placeholder="Nhập số tiền"
                                    onValueChange={val =>
                                      form.setFieldValue(
                                        `list[${index}].WorkUnitSalary`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      )
                                    }
                                    onBlur={field.onBlur}
                                    autoComplete="off"
                                    allowLeadingZeros
                                    thousandSeparator={true}
                                    allowNegative={false}
                                  />
                                )}
                              </FastField>
                            </div>
                            <div className="timekeeping-col">
                              <label className="name-control">Tổng tiền</label>
                              <FastField name={`list[${index}].WorkSalary`}>
                                {({ field, form }) => (
                                  <NumericFormat
                                    name={field.name}
                                    value={field.value}
                                    className="form-control form-control-solid"
                                    type="text"
                                    placeholder="Nhập tổng tiền"
                                    onValueChange={val => {
                                      form.setFieldValue(
                                        `list[${index}].WorkSalary`,
                                        val.floatValue
                                          ? val.floatValue
                                          : val.value,
                                        false
                                      )
                                    }}
                                    onBlur={field.onBlur}
                                    autoComplete="off"
                                    allowLeadingZeros
                                    thousandSeparator={true}
                                    allowNegative={false}
                                  />
                                )}
                              </FastField>
                            </div>
                            <div className="timekeeping-col col-file">
                              <label className="name-control">
                                File đính kèm
                              </label>
                              <FastField name={`list[${index}].Src`}>
                                {({ field, form }) => (
                                  <InputFiles
                                    value={field.value}
                                    onChange={url =>
                                      form.setFieldValue(
                                        `list[${index}].Src`,
                                        url
                                      )
                                    }
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
                            <div className="timekeeping-col align-items-center col-checkbox">
                              <FastField name={`list[${index}].IsSet`}>
                                {({ field }) => (
                                  <label className="checkbox d-flex flex-column align-items-center">
                                    <input
                                      type="checkbox"
                                      {...field}
                                      checked={field.value}
                                    />
                                    <span className="name-control">
                                      Duyệt lương
                                    </span>
                                    <span className="checkbox-icon"></span>
                                  </label>
                                )}
                              </FastField>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                />
                <div
                  className={clsx(
                    'overlay-layer bg-dark-o-10 top-0 zindex-1001 top-0',
                    loading && 'overlay-block'
                  )}
                >
                  <div className="spinner spinner-primary"></div>
                </div>
              </div>
              <div className="card-footer d-flex justify-content-end align-items-center">
                <button
                  type="submit"
                  className={clsx(
                    'btn btn-success fw-500',
                    loadingBtn && 'spinner spinner-white spinner-right'
                  )}
                  disabled={
                    loadingBtn || !values.list || values.list.length === 0
                  }
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

export default SalaryApproval
