import React, { useEffect, useMemo, useRef, useState } from 'react'
// import Navbar from '../../components/Navbar'
import { NumericFormat } from 'react-number-format'
import { NavLink, useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import Select, { components } from 'react-select'
import { useSelector } from 'react-redux'
import worksheetApi from 'src/api/worksheet.api'
import { FastField, FieldArray, Form, Formik } from 'formik'
import clsx from 'clsx'
import 'react-base-table/styles.css'
import { useMutation, useQuery } from 'react-query'
import { Dropdown } from 'react-bootstrap'
import PickerMachineCode from '../../components/Picker/PickerMachineCode'
import PickerTypeShift from '../../components/Picker/PickerTypeShift'
import Table, { AutoResizer } from 'react-base-table'
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/solid'
import Portal from 'react-overlays/cjs/Portal'
import { CheckInOutHelpers } from 'src/helpers/CheckInOutHelpers'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const CalendarContainer = ({ children }) => {
  const el = document.getElementById('calendar-portal')

  return <Portal container={el}>{children}</Portal>
}

function TimekeepingHome(props) {
  const navigate = useNavigate()
  const { Stocks, CrStockID } = useSelector(({ auth }) => ({
    Stocks: auth?.Info?.Stocks || [],
    CrStockID: auth?.Info?.CrStockID
  }))
  const [StocksList, setStocksList] = useState([])
  const [CrDate, setCrDate] = useState(new Date())
  const [filters, setFilters] = useState({
    From: '',
    To: '',
    StockID: '',
    key: ''
  })

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

  const { isLoading, isFetching, refetch, ...ListWorkSheet } = useQuery({
    queryKey: ['ListWorkSheet', filters],
    queryFn: async () => {
      const newObj = {
        ...filters,
        From: filters.From,
        To: filters.To,
        StockID: filters.StockID ? filters.StockID.ID : ''
      }

      const { data } = await worksheetApi.getAllWorkSheet(newObj)
      return data?.list
        ? {
            list: data.list.map(item => ({
              ...item,
              Dates: item.Dates
                ? item.Dates.map(date => ({
                    ...date,
                    WorkTrack: date?.WorkTrack
                      ? {
                          ...date?.WorkTrack,
                          Info: date?.WorkTrack?.Info
                            ? {
                                ...date?.WorkTrack?.Info,
                                TimekeepingType:
                                  CheckInOutHelpers.getTimekeepingType(
                                    date?.WorkTrack?.Info
                                  ).Option,
                                TimekeepingTypeValue:
                                  CheckInOutHelpers.getTimekeepingType(
                                    date?.WorkTrack?.Info
                                  ).Value,
                                Type: date?.WorkTrack?.Info?.Type
                                  ? {
                                      label:
                                        date?.WorkTrack?.Info?.Type ===
                                        'CA_NHAN'
                                          ? 'Việc cá nhân'
                                          : 'Việc công ty',
                                      value: date?.WorkTrack?.Info?.Type
                                    }
                                  : '',
                                Desc: date?.WorkTrack?.Info?.Desc || '',
                                CountWork:
                                  date?.WorkTrack?.Info?.WorkToday?.Value || 0,
                                Note: date?.WorkTrack?.Info?.Note || '',
                                CheckOut: {
                                  TimekeepingType:
                                    CheckInOutHelpers.getTimekeepingType(
                                      date?.WorkTrack?.Info?.CheckOut
                                    ).Option,
                                  TimekeepingTypeValue:
                                    CheckInOutHelpers.getTimekeepingType(
                                      date?.WorkTrack?.Info?.CheckOut
                                    ).Value,
                                  Type: date?.WorkTrack?.Info?.CheckOut?.Type
                                    ? {
                                        label:
                                          date?.WorkTrack?.Info?.CheckOut
                                            ?.Type === 'CA_NHAN'
                                            ? 'Việc cá nhân'
                                            : 'Việc công ty',
                                        value:
                                          date?.WorkTrack?.Info?.CheckOut?.Type
                                      }
                                    : '',
                                  Desc:
                                    date?.WorkTrack?.Info?.CheckOut?.Desc || ''
                                }
                              }
                            : {
                                TimekeepingType: '',
                                TimekeepingTypeValue: '',
                                Type: '',
                                Desc: '',
                                CountWork: '',
                                Note: '',
                                CheckOut: {
                                  TimekeepingType: '',
                                  TimekeepingTypeValue: '',
                                  Type: '',
                                  Desc: ''
                                }
                              }
                        }
                      : {
                          CheckIn: '',
                          CheckOut: '',
                          Info: {
                            TimekeepingType: '',
                            TimekeepingTypeValue: '',
                            Type: '',
                            Desc: '',
                            CountWork: '',
                            Note: '',
                            CheckOut: {
                              TimekeepingType: '',
                              TimekeepingTypeValue: '',
                              Type: '',
                              Desc: ''
                            }
                          }
                        }
                  }))
                : []
            }))
          }
        : { list: [] }
    },
    enabled: Boolean(filters.StockID && filters.From && filters.To),
    keepPreviousData: true
  })

  const columns = useMemo(
    () => [
      {
        width: 300,
        title: 'Họ tên nhân viên',
        key: 'User.FullName',
        sortable: false,
        frozen: 'left',
        cellRenderer: ({ rowData }) => (
          <div className="flex items-center w-full h-full">
            <NavLink
              to={`/bang-cham-cong/${rowData.UserID}`}
              className="font-semibold text-name text-decoration-none text-black font-size-15px text-capitalize d-block flex-1 pr-15px"
            >
              {rowData.FullName}
            </NavLink>

            <Dropdown>
              <Dropdown.Toggle
                className="border !w-11 !h-11 !rounded-full flex items-center justify-center after:hidden !p-0 !text-[#7e8299] relative"
                id="dropdown-basic"
              >
                <i className="fa-regular fa-gear absolute top-[14px] left-[13px]"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu
                popperConfig={{
                  strategy: 'fixed',
                  onFirstUpdate: () =>
                    window.dispatchEvent(new CustomEvent('scroll'))
                }}
              >
                {
                  <PickerTypeShift item={rowData}>
                    {({ open }) => (
                      <Dropdown.Item onClick={open}>Loại công ca</Dropdown.Item>
                    )}
                  </PickerTypeShift>
                }
                {
                  <PickerMachineCode item={rowData}>
                    {({ open }) => (
                      <Dropdown.Item onClick={open}>Mã máy</Dropdown.Item>
                    )}
                  </PickerMachineCode>
                }
              </Dropdown.Menu>
            </Dropdown>
          </div>
        )
      },
      {
        width: 180,
        title: 'Vào / Ra',
        key: 'CheckIn/CheckOut',
        sortable: false,
        cellRenderer: ({ rowData, rowIndex }) => (
          <>
            <FieldArray
              name={`list[${rowIndex}].Dates`}
              render={() => (
                <>
                  {rowData.Dates.map((date, index) => (
                    <div className="w-full" key={index}>
                      <div className="relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.CheckIn`}
                        >
                          {({ field, form, meta }) => (
                            <DatePicker
                              selected={
                                field?.value ? new Date(field?.value) : null
                              }
                              onChange={val => {
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.CheckIn`,
                                  val
                                    ? moment(date.Date)
                                        .set({
                                          hour: moment(val).get('hour'),
                                          minute: moment(val).get('minute'),
                                          second: moment(val).get('second')
                                        })
                                        .toDate()
                                    : '',
                                  false
                                )
                              }}
                              className="form-control w-full !font-medium text-success"
                              dateFormat="HH:mm aa"
                              timeFormat="HH:mm aa"
                              showTimeSelectOnly
                              showTimeSelect
                              timeIntervals={5}
                              popperContainer={CalendarContainer}
                              placeholderText="--:--"
                            />
                          )}
                        </FastField>
                        <ArrowLeftOnRectangleIcon className="w-6 absolute right-2 top-2/4 -translate-y-2/4 !text-success pointer-events-none" />
                      </div>
                      <div className="relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.CheckOut`}
                        >
                          {({ field, form, meta }) => (
                            <DatePicker
                              selected={
                                field?.value ? new Date(field?.value) : null
                              }
                              onChange={val =>
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.CheckOut`,
                                  val
                                    ? moment(date.Date)
                                        .set({
                                          hour: moment(val).get('hour'),
                                          minute: moment(val).get('minute'),
                                          second: moment(val).get('second')
                                        })
                                        .toDate()
                                    : '',
                                  false
                                )
                              }
                              className="form-control w-full !font-medium text-danger"
                              dateFormat="HH:mm aa"
                              timeFormat="HH:mm aa"
                              showTimeSelectOnly
                              showTimeSelect
                              timeIntervals={5}
                              popperContainer={CalendarContainer}
                              placeholderText="--:--"
                            />
                          )}
                        </FastField>
                        <ArrowRightOnRectangleIcon className="w-6 absolute right-2 top-2/4 -translate-y-2/4 !text-danger pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </>
              )}
            />
          </>
        )
      },
      {
        width: 250,
        title: 'Loại',
        key: 'TimeKeepingType',
        sortable: false,
        cellRenderer: ({ rowData, rowIndex }) => (
          <>
            <FieldArray
              name={`list[${rowIndex}].Dates`}
              render={() => (
                <>
                  {rowData.Dates.map((date, index) => (
                    <div className="w-full" key={index}>
                      <div className="w-full relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.TimekeepingType`}
                        >
                          {({ field, form, meta }) => (
                            <Select
                              isClearable
                              menuPortalTarget={document.body}
                              components={{
                                Control: ({ children, ...rest }) => (
                                  <components.Control {...rest}>
                                    <ArrowLeftOnRectangleIcon className="w-5 !text-success ml-1.5" />
                                    {children}
                                  </components.Control>
                                )
                              }}
                              options={[
                                {
                                  value: 'DI_SOM',
                                  label: 'Đi sớm'
                                },
                                {
                                  value: 'DI_MUON',
                                  label: 'Đi muộn'
                                }
                              ]}
                              className="select-control"
                              classNamePrefix="select"
                              placeholder="Loại vào"
                              menuPosition="fixed"
                              value={field.value}
                              onChange={otp =>
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.Info.TimekeepingType`,
                                  otp,
                                  false
                                )
                              }
                            />
                          )}
                        </FastField>
                      </div>
                      <div className="w-full relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.TimekeepingType`}
                        >
                          {({ field, form, meta }) => (
                            <Select
                              isClearable
                              components={{
                                Control: ({ children, ...rest }) => (
                                  <components.Control {...rest}>
                                    <ArrowRightOnRectangleIcon className="w-5 !text-danger ml-1.5" />
                                    {children}
                                  </components.Control>
                                )
                              }}
                              options={[
                                {
                                  value: 'DI_SOM',
                                  label: 'Về sớm'
                                },
                                {
                                  value: 'DI_MUON',
                                  label: 'Về muộn'
                                }
                              ]}
                              menuPosition="fixed"
                              className="select-control"
                              classNamePrefix="select"
                              placeholder="Loại ra"
                              value={field.value}
                              onChange={otp =>
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.TimekeepingType`,
                                  otp,
                                  false
                                )
                              }
                              menuPortalTarget={document.body}
                            />
                          )}
                        </FastField>
                      </div>
                    </div>
                  ))}
                </>
              )}
            />
          </>
        )
      },
      {
        width: 250,
        title: 'Tiền Thưởng / Phạt',
        key: 'TimekeepingTypeValue',
        sortable: false,
        cellRenderer: ({ rowData, rowIndex }) => (
          <>
            <FieldArray
              name={`list[${rowIndex}].Dates`}
              render={() => (
                <>
                  {rowData.Dates.map((date, index) => (
                    <div className="w-full" key={index}>
                      <div className="relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.TimekeepingTypeValue`}
                        >
                          {({ field, form, meta }) => (
                            <NumericFormat
                              allowLeadingZeros
                              thousandSeparator={true}
                              allowNegative={true}
                              className="form-control"
                              type="text"
                              placeholder="Nhập số tiền"
                              onValueChange={({ floatValue }) => {
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.Info.TimekeepingTypeValue`,
                                  floatValue,
                                  false
                                )
                              }}
                              autoComplete="off"
                              value={field.value}
                            />
                          )}
                        </FastField>
                        <ArrowLeftOnRectangleIcon className="w-6 absolute right-2 top-2/4 -translate-y-2/4 !text-success pointer-events-none" />
                      </div>
                      <div className="relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.TimekeepingTypeValue`}
                        >
                          {({ field, form, meta }) => (
                            <NumericFormat
                              allowLeadingZeros
                              thousandSeparator={true}
                              allowNegative={true}
                              className="form-control"
                              type="text"
                              placeholder="Nhập số tiền"
                              onValueChange={({ floatValue }) =>
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.TimekeepingTypeValue`,
                                  floatValue,
                                  false
                                )
                              }
                              autoComplete="off"
                              value={field.value}
                            />
                          )}
                        </FastField>
                        <ArrowRightOnRectangleIcon className="w-6 absolute right-2 top-2/4 -translate-y-2/4 !text-danger pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </>
              )}
            />
          </>
        )
      },
      {
        width: 250,
        title: 'Lý do',
        key: 'Type',
        sortable: false,
        cellRenderer: ({ rowData, rowIndex }) => (
          <>
            <FieldArray
              name={`list[${rowIndex}].Dates`}
              render={() => (
                <>
                  {rowData.Dates.map((date, index) => (
                    <div className="w-full" key={index}>
                      <div className="w-full relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.Type`}
                        >
                          {({ field, form, meta }) => (
                            <Select
                              isClearable
                              menuPortalTarget={document.body}
                              components={{
                                Control: ({ children, ...rest }) => (
                                  <components.Control {...rest}>
                                    <ArrowLeftOnRectangleIcon className="w-5 !text-success ml-1.5" />
                                    {children}
                                  </components.Control>
                                )
                              }}
                              options={[
                                {
                                  value: 'CA_NHAN',
                                  label: 'Việc cá nhân'
                                },
                                {
                                  value: 'CONG_TY',
                                  label: 'Việc công ty'
                                }
                              ]}
                              className="select-control"
                              classNamePrefix="select"
                              placeholder="Lý do vào"
                              menuPosition="fixed"
                              value={field.value}
                              onChange={otp =>
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.Info.Type`,
                                  otp,
                                  false
                                )
                              }
                            />
                          )}
                        </FastField>
                      </div>
                      <div className="w-full relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.Type`}
                        >
                          {({ field, form, meta }) => (
                            <Select
                              isClearable
                              components={{
                                Control: ({ children, ...rest }) => (
                                  <components.Control {...rest}>
                                    <ArrowRightOnRectangleIcon className="w-5 !text-danger ml-1.5" />
                                    {children}
                                  </components.Control>
                                )
                              }}
                              options={[
                                {
                                  value: 'CA_NHAN',
                                  label: 'Việc cá nhân'
                                },
                                {
                                  value: 'CONG_TY',
                                  label: 'Việc công ty'
                                }
                              ]}
                              menuPosition="fixed"
                              className="select-control"
                              classNamePrefix="select"
                              placeholder="Lý do ra"
                              value={field.value}
                              onChange={otp =>
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.Type`,
                                  otp,
                                  false
                                )
                              }
                              menuPortalTarget={document.body}
                            />
                          )}
                        </FastField>
                      </div>
                    </div>
                  ))}
                </>
              )}
            />
          </>
        )
      },
      {
        width: 300,
        title: 'Mô tả lý do',
        key: 'Desc',
        sortable: false,
        cellRenderer: ({ rowData, rowIndex }) => (
          <>
            <FieldArray
              name={`list[${rowIndex}].Dates`}
              render={() => (
                <>
                  {rowData.Dates.map((date, index) => (
                    <div className="w-full" key={index}>
                      <div className="relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.Desc`}
                        >
                          {({ field, form, meta }) => (
                            <input
                              className="form-control"
                              placeholder="Nhập mô tả"
                              {...field}
                            />
                          )}
                        </FastField>
                        <ArrowLeftOnRectangleIcon className="w-6 absolute right-2 top-2/4 -translate-y-2/4 !text-success pointer-events-none" />
                      </div>
                      <div className="relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.Desc`}
                        >
                          {({ field, form, meta }) => (
                            <input
                              className="form-control"
                              placeholder="Nhập mô tả"
                              {...field}
                            />
                          )}
                        </FastField>
                        <ArrowRightOnRectangleIcon className="w-6 absolute right-2 top-2/4 -translate-y-2/4 !text-danger pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </>
              )}
            />
          </>
        )
      },
      {
        width: 150,
        title: 'Số công',
        key: 'CountWork',
        sortable: false,
        cellRenderer: ({ rowData, rowIndex }) => (
          <>
            <FieldArray
              name={`list[${rowIndex}].Dates`}
              render={() => (
                <>
                  {rowData.Dates.map((date, index) => (
                    <div className="w-full relative" key={index}>
                      <FastField
                        name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.CountWork`}
                      >
                        {({ field, form, meta }) => (
                          <NumericFormat
                            className="form-control text-center"
                            type="text"
                            placeholder="Nhập số công"
                            onValueChange={val =>
                              form.setFieldValue(
                                `list[${rowIndex}].Dates[${index}].WorkTrack.Info.CountWork`,
                                val.floatValue ? val.floatValue : val.value,
                                false
                              )
                            }
                            autoComplete="off"
                            {...field}
                          />
                        )}
                      </FastField>
                    </div>
                  ))}
                </>
              )}
            />
          </>
        )
      },
      {
        width: 300,
        title: 'Ghi chú',
        key: 'Note',
        sortable: false,
        cellRenderer: ({ rowData, rowIndex }) => (
          <>
            <FieldArray
              name={`list[${rowIndex}].Dates`}
              render={() => (
                <>
                  {rowData.Dates.map((date, index) => (
                    <div className="w-full relative" key={index}>
                      <FastField
                        name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.Note`}
                      >
                        {({ field, form, meta }) => (
                          <textarea
                            className="form-control resize-none h-[90px]"
                            placeholder="Nhập ghi chú"
                            {...field}
                          ></textarea>
                        )}
                      </FastField>
                    </div>
                  ))}
                </>
              )}
            />
          </>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const saveTimeKeepMutation = useMutation({
    mutationFn: body => worksheetApi.checkinWorkSheet(body)
  })

  const onSubmit = values => {
    const newValues = {
      edit: []
    }

    for (let user of values.list || []) {
      let { UserID, Dates } = user
      let { WorkTrack, Date } = Dates[0]

      let obj = {
        UserID: UserID,
        CreateDate: moment(Date).format('YYYY-MM-DD'),
        Info: {
          CheckOut: {}
        }
      }

      obj.CheckIn = WorkTrack.CheckIn
        ? moment(WorkTrack.CheckIn).format('YYYY-MM-DD HH:mm:ss')
        : WorkTrack.CheckIn
      obj.CheckOut = WorkTrack.CheckOut
        ? moment(WorkTrack.CheckOut).format('YYYY-MM-DD HH:mm:ss')
        : WorkTrack.CheckOut
      obj.Info.Desc = WorkTrack.Info.Desc || ''
      obj.Info.CheckOut.Desc = WorkTrack.Info.CheckOut.Desc || ''
      obj.Info.Note = WorkTrack.Info.Note || ''
      if (WorkTrack.ID) {
        obj.ID = WorkTrack.ID
      }
      if (WorkTrack.Info.TimekeepingType) {
        if (
          WorkTrack.Info[WorkTrack.Info.TimekeepingType.value] &&
          WorkTrack.Info[WorkTrack.Info.TimekeepingType.value].Value ===
            Math.abs(WorkTrack.Info.TimekeepingTypeValue)
        ) {
          obj.Info[WorkTrack.Info.TimekeepingType.value] = {
            ...WorkTrack.Info[WorkTrack.Info.TimekeepingType.value]
          }
        } else {
          obj.Info[WorkTrack.Info.TimekeepingType.value] = {
            Value: Math.abs(WorkTrack.Info.TimekeepingTypeValue)
          }
        }
      }
      if (WorkTrack.Info.CheckOut.TimekeepingType) {
        if (
          WorkTrack.Info.CheckOut[
            WorkTrack.Info.CheckOut.TimekeepingType.value
          ] &&
          WorkTrack.Info.CheckOut[
            WorkTrack.Info.CheckOut.TimekeepingType.value
          ] === Math.abs(WorkTrack.Info.CheckOut.TimekeepingTypeValue)
        ) {
          obj.Info.CheckOut[WorkTrack.Info.CheckOut.TimekeepingType.value] = {
            ...WorkTrack.Info[WorkTrack.Info.CheckOut.TimekeepingType.value]
          }
        } else {
          obj.Info.CheckOut[WorkTrack.Info.CheckOut.TimekeepingType.value] = {
            Value: Math.abs(WorkTrack.Info.CheckOut.TimekeepingTypeValue)
          }
        }
      }
      if (WorkTrack.Info.Type) {
        obj.Info.Type = WorkTrack.Info.Type.value
      }
      if (WorkTrack.Info.CheckOut.Type) {
        obj.Info.CheckOut.Type = WorkTrack.Info.CheckOut.Type.value
      }
      if (
        WorkTrack.Info.WorkToday &&
        WorkTrack.Info.WorkToday.Value === WorkTrack.Info.CountWork
      ) {
        obj.Info.WorkToday = WorkTrack.Info.WorkToday
      } else {
        obj.Info.WorkToday = {
          Value: WorkTrack.Info.CountWork
        }
      }
      newValues.edit.push(obj)
    }

    saveTimeKeepMutation.mutate(newValues, {
      onSuccess: () => {
        refetch().then(
          () =>
            window.top.toastr &&
            window.top.toastr.success('Cập nhập thành công !', {
              timeOut: 1500
            })
        )
      },
      onError: error => console.log(error)
    })
  }

  return (
    <Formik
      initialValues={ListWorkSheet.data}
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
                        if (typingTimeoutRef.current) {
                          clearTimeout(typingTimeoutRef.current)
                        }
                        typingTimeoutRef.current = setTimeout(() => {
                          setFilters(prevState => ({
                            ...prevState,
                            Key: evt.target.value
                          }))
                        }, 300)
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
                  <div className="position-relative w-140px">
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
                  <Dropdown>
                    <Dropdown.Toggle
                      className="border !w-11 !h-11 flex items-center justify-center after:hidden !p-0 !text-[#7e8299]"
                      id="dropdown-basic"
                    >
                      <i className="fa-regular fa-gear"></i>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      <Dropdown.Item
                        onClick={() => navigate('/bang-cham-cong/ca-lam-viec')}
                      >
                        Ca làm việc
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => navigate('thuong-phat')}>
                        Thưởng phạt
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  <NavLink
                    to="danh-sach-xin-nghi"
                    className="btn btn-light-danger fw-500 ml-10px"
                  >
                    Danh sách xin nghỉ
                  </NavLink>
                  {/* <Navbar /> */}
                </div>
              </div>
              <div className="card-body p-0">
                <FieldArray
                  name="list"
                  render={() => (
                    <AutoResizer>
                      {({ width, height }) => (
                        <Table
                          className="BaseTable--has-hover"
                          fixed
                          rowKey="UserID"
                          width={width}
                          height={height}
                          columns={columns}
                          data={values?.list || []}
                          rowHeight={115}
                          ignoreFunctionInColumnCompare={false}
                          disabled={isLoading}
                          onEndReachedThreshold={300}
                          // emptyRenderer={() =>
                          //   !isLoading && (
                          //     <div
                          //       className="h-full d-flex justify-content-center align-items-center"
                          //       style={{ fontSize: '15px' }}
                          //     >
                          //       Không có dữ liệu
                          //     </div>
                          //   )
                          // }
                          overlayRenderer={() =>
                            isLoading || isFetching ? (
                              <div className="overlay-layer bg-dark-o-10 top-0 h-100 zindex-1001 overlay-block flex justify-center">
                                <div className="spinner spinner-primary"></div>
                              </div>
                            ) : null
                          }
                        />
                      )}
                    </AutoResizer>
                  )}
                />
              </div>
              <div className="card-footer d-flex justify-content-end align-items-center">
                <button
                  type="submit"
                  disabled={saveTimeKeepMutation.isLoading}
                  className={clsx(
                    'btn btn-success fw-500',
                    saveTimeKeepMutation.isLoading &&
                      'spinner spinner-white spinner-right'
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
