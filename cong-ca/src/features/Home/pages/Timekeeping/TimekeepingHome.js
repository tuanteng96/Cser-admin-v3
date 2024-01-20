import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
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
import { Dropdown, Modal } from 'react-bootstrap'
import PickerMachineCode from '../../components/Picker/PickerMachineCode'
import PickerTypeShift from '../../components/Picker/PickerTypeShift'
import Table, { AutoResizer } from 'react-base-table'
import {
  ArrowLeftOnRectangleIcon,
  ArrowRightOnRectangleIcon,
  BarsArrowDownIcon
} from '@heroicons/react/24/solid'
import Portal from 'react-overlays/cjs/Portal'
import { CheckInOutHelpers } from 'src/helpers/CheckInOutHelpers'
import {
  arrow,
  FloatingArrow,
  FloatingPortal,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  flip,
  autoUpdate
} from '@floating-ui/react'
import useWindowSize from 'src/hooks/useWindowSize'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const CalendarContainer = ({ children }) => {
  const el = document.getElementById('calendar-portal')

  return <Portal container={el}>{children}</Portal>
}

const PopoverCustom = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const arrowRef = useRef(null)
  const { x, y, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom',
    middleware: [
      offset(8),
      flip(),
      arrow({
        element: arrowRef
      })
    ],
    whileElementsMounted: autoUpdate
  })

  const click = useClick(context)
  const dismiss = useDismiss(context)

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss
  ])

  return (
    <>
      <button
        type="button"
        className="border !w-8 !h-8 md:!w-11 md:!h-11 !rounded-full flex items-center justify-center after:hidden !p-0 !text-[#7e8299] relative"
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        <i className="fa-regular fa-gear text-[13px] md:text-[15px]"></i>
      </button>
      {isOpen && (
        <FloatingPortal>
          <div
            className="fixed"
            style={{
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 1009
            }}
            ref={refs.setFloating}
            {...getFloatingProps()}
          >
            {children({
              onClose: () => setIsOpen(false)
            })}
            <FloatingArrow
              className="fill-white"
              ref={arrowRef}
              context={context}
            />
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

function TimekeepingHome(props) {
  const navigate = useNavigate()
  const { Stocks, CrStockID, rightsSum } = useSelector(({ auth }) => ({
    Stocks: auth?.Info?.Stocks || [],
    rightsSum: auth?.Info?.rightsSum?.cong_ca || {},
    CrStockID: auth?.Info?.CrStockID
  }))
  const [StocksList, setStocksList] = useState([])
  const [CrDate, setCrDate] = useState(new Date())
  const [visible, setVisible] = useState(false)
  const [filters, setFilters] = useState({
    From: '',
    To: '',
    StockID: '',
    key: ''
  })
  const { width } = useWindowSize()
  const typingTimeoutRef = useRef(null)

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
    setStocksList(newStocks)
  }, [Stocks, CrStockID, rightsSum])

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
                        },
                    isFinish:
                      (item?.End &&
                        item?.End?.Info &&
                        Boolean(item?.End?.Info?.LUONG)) ||
                      false
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
        width: width > 767 ? 300 : 120,
        title: 'Nhân viên',
        key: 'User.FullName',
        sortable: false,
        frozen: 'left',
        cellRenderer: ({ rowData }) => (
          <div className="flex items-center w-full h-full">
            <div className="flex-1">
              <NavLink
                to={`/bang-cham-cong/${rowData.UserID}?CrDate=${CrDate}`}
                className="font-semibold text-black text-name text-decoration-none text-[12px] md:text-[15px] text-capitalize d-block pr-15px"
              >
                <div>{rowData.FullName}</div>
                {rowData.Dates.map((date, i) => (
                  <Fragment key={i}>
                    {date.WorkTrack?.Info?.WorkToday?.Title && (
                      <div className="text-[12px] text-muted">
                        {date.WorkTrack?.Info?.WorkToday?.Title} (
                        {date.WorkTrack?.Info?.WorkToday?.TimeFrom} -{' '}
                        {date.WorkTrack?.Info?.WorkToday?.TimeTo})
                      </div>
                    )}
                    {date.WorkTrack?.StockID &&
                    date.WorkTrack?.StockID !== rowData.StockID ? (
                      <div className="text-danger text-[12px]">
                        <span className="pr-2">Khác điểm :</span>
                        {date.WorkTrack?.StockTitle || 'Không xác định'}
                      </div>
                    ) : (
                      ''
                    )}
                  </Fragment>
                ))}
              </NavLink>
            </div>
            <PopoverCustom>
              {({ onClose }) => (
                <div className="bg-white shadow-lg py-2.5 min-w-[150px]">
                  {
                    <PickerTypeShift item={rowData}>
                      {({ open }) => (
                        <div
                          className="text-[#3f4254] py-2.5 px-3 hover:bg-[#f3f6f9] cursor-pointer"
                          onClick={() => {
                            open()
                            //onClose()
                          }}
                        >
                          Loại công ca
                        </div>
                      )}
                    </PickerTypeShift>
                  }
                  {
                    <PickerMachineCode item={rowData}>
                      {({ open }) => (
                        <div
                          className="text-[#3f4254] py-2.5 px-3 hover:bg-[#f3f6f9] cursor-pointer"
                          onClick={() => {
                            open()
                            //onClose()
                          }}
                        >
                          Mã máy
                        </div>
                      )}
                    </PickerMachineCode>
                  }
                </div>
              )}
            </PopoverCustom>

            {/* <Dropdown>
              <Dropdown.Toggle
                className="border !w-8 !h-8 md:!w-11 md:!h-11 !rounded-full flex items-center justify-center after:hidden !p-0 !text-[#7e8299] relative"
                id="dropdown-basic"
              >
                <i className="fa-regular fa-gear text-[13px] md:text-[15px]"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu
                renderOnMount={true}
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
            </Dropdown> */}
          </div>
        )
      },
      {
        width: width > 767 ? 180 : 140,
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
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <DatePicker
                              disabled={date?.isFinish}
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
                                    : ''
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
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <DatePicker
                              disabled={date?.isFinish}
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
                                    : ''
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
        width: width > 767 ? 250 : 220,
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
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <Select
                              isDisabled={date?.isFinish}
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
                                  otp
                                )
                              }
                            />
                          )}
                        </FastField>
                      </div>
                      <div className="w-full relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.TimekeepingType`}
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <Select
                              isDisabled={date?.isFinish}
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
                                  value: 'VE_SOM',
                                  label: 'Về sớm'
                                },
                                {
                                  value: 'VE_MUON',
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
                                  otp
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
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <NumericFormat
                              disabled={date?.isFinish}
                              allowLeadingZeros
                              thousandSeparator={true}
                              allowNegative={true}
                              className="form-control"
                              type="text"
                              placeholder="Nhập số tiền"
                              onValueChange={({ floatValue }) => {
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.Info.TimekeepingTypeValue`,
                                  floatValue
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
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <NumericFormat
                              disabled={date?.isFinish}
                              allowLeadingZeros
                              thousandSeparator={true}
                              allowNegative={true}
                              className="form-control"
                              type="text"
                              placeholder="Nhập số tiền"
                              onValueChange={({ floatValue }) =>
                                form.setFieldValue(
                                  `list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.TimekeepingTypeValue`,
                                  floatValue
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
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <Select
                              isDisabled={date?.isFinish}
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
                                  otp
                                )
                              }
                            />
                          )}
                        </FastField>
                      </div>
                      <div className="w-full relative mb-2 last:!mb-0">
                        <FastField
                          name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.CheckOut.Type`}
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <Select
                              isDisabled={date?.isFinish}
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
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <input
                              disabled={date?.isFinish}
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
                          meta={{
                            update: date?.isFinish
                          }}
                          shouldUpdate={() => (nextProps, currentProps) =>
                            nextProps.meta?.update !==
                            currentProps.meta?.update}
                        >
                          {({ field, form, meta }) => (
                            <input
                              disabled={date?.isFinish}
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
                    <div className="relative w-full" key={index}>
                      <FastField
                        name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.CountWork`}
                        meta={{
                          update: date?.isFinish
                        }}
                        shouldUpdate={() => (nextProps, currentProps) =>
                          nextProps.meta?.update !== currentProps.meta?.update}
                      >
                        {({ field, form, meta }) => (
                          <NumericFormat
                            disabled={date?.isFinish}
                            className="text-center form-control"
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
                    <div className="relative w-full" key={index}>
                      <FastField
                        name={`list[${rowIndex}].Dates[${index}].WorkTrack.Info.Note`}
                        meta={{
                          update: date?.isFinish
                        }}
                        shouldUpdate={() => (nextProps, currentProps) =>
                          nextProps.meta?.update !== currentProps.meta?.update}
                      >
                        {({ field, form, meta }) => (
                          <textarea
                            disabled={date?.isFinish}
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
    [width, CrDate]
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

  const rowClassName = ({ rowData }) => {
    return (
      (rowData.Dates.some(x => x?.WorkTrack?.Info?.WorkToday?.isOff) &&
        '!bg-[#ffe2e5]') ||
      (rowData.Dates.some(x => x?.WorkTrack?.Info?.WarningWifi) &&
        '!bg-[#FFF4DE]')
    )
  }

  return (
    <>
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
              <div className="card h-100 timekeeping !overflow-x-hidden">
                <div className="card-header !px-[15px] md:!px-[1.75rem]">
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
                    <div className="hidden lg:flex">
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
                        <i className="top-0 right-0 pointer-events-none fa-regular fa-magnifying-glass position-absolute w-30px h-100 d-flex align-items-center font-size-md text-muted"></i>
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
                        <i className="top-0 right-0 pointer-events-none fa-regular fa-calendar-range position-absolute w-25px h-100 d-flex align-items-center font-size-md text-muted"></i>
                      </div>
                    </div>
                    <div className="h-40px w-1px border-right mx-15px"></div>
                    <div className="xl:hidden">
                      <Dropdown>
                        <Dropdown.Toggle className="!h-[40px] w-[40px] btn-success after:hidden">
                          <BarsArrowDownIcon className="w-7 absolute top-[10px] left-[11px]" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              navigate('/bang-cham-cong/ca-lam-viec')
                            }
                          >
                            Ca làm việc
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => navigate('thuong-phat')}
                          >
                            Thưởng phạt
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              navigate('/bang-cham-cong/phuong-thuc-cham-cong')
                            }
                          >
                            Định vị - Wifi
                          </Dropdown.Item>
                          <Dropdown.Divider
                            style={{
                              borderTop: '1px solid #ebebec',
                              opacity: 1
                            }}
                          />
                          <Dropdown.Item
                            onClick={() => navigate('danh-sach-xin-nghi')}
                          >
                            Danh sách ngày nghỉ
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => navigate('danh-sach-theo-thang')}
                          >
                            Chấm công theo tháng
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => navigate('lich-lam-viec')}
                          >
                            Lịch làm việc
                          </Dropdown.Item>
                          <Dropdown.Divider
                            style={{
                              borderTop: '1px solid #ebebec',
                              opacity: 1
                            }}
                          />
                          <Dropdown.Item
                            className="lg:hidden"
                            onClick={() => setVisible(true)}
                          >
                            Bộ lọc
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    <div className="hidden xl:flex">
                      <Dropdown>
                        <Dropdown.Toggle
                          className="border !w-11 !h-11 flex items-center justify-center after:hidden !p-0 !text-[#7e8299]"
                          id="dropdown-basic"
                        >
                          <i className="fa-regular fa-gear"></i>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              navigate('/bang-cham-cong/ca-lam-viec')
                            }
                          >
                            Ca làm việc
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => navigate('thuong-phat')}
                          >
                            Thưởng phạt
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              navigate('/bang-cham-cong/phuong-thuc-cham-cong')
                            }
                          >
                            Định vị - Wifi
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <Dropdown>
                        <Dropdown.Toggle
                          className="border !w-11 !h-11 flex items-center justify-center after:hidden !p-0 !text-[#7e8299] ml-3"
                          id="dropdown-basic"
                        >
                          {/* <i className="fa-regular fa-gear"></i> */}
                          <i className="far fa-ellipsis-h"></i>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => navigate('danh-sach-theo-thang')}
                          >
                            Chấm công theo tháng
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => navigate('lich-lam-viec')}
                          >
                            Lịch làm việc
                          </Dropdown.Item>
                          <Dropdown.Item
                            className="text-danger"
                            onClick={() => navigate('danh-sach-xin-nghi')}
                          >
                            Danh sách xin nghỉ
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                </div>
                <div className="p-0 card-body">
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
                            rowClassName={rowClassName}
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
                                <div className="top-0 flex justify-center overlay-layer bg-dark-o-10 h-100 zindex-1001 overlay-block">
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
      <Modal
        show={visible}
        onHide={() => setVisible(false)}
        dialogClassName="modal-content-right max-w-400px"
        scrollable={true}
        enforceFocus={false}
      >
        <Modal.Header closeButton>
          <Modal.Title className="font-title text-uppercase">
            Bộ lọch
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="w-full !mb-5">
            <div className="mb-1">Nhân viên</div>
            <div className="position-relative">
              <input
                className="form-control"
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
              <i className="top-0 right-0 pointer-events-none fa-regular fa-magnifying-glass position-absolute w-30px h-100 d-flex align-items-center font-size-md text-muted"></i>
            </div>
          </div>
          <div className="w-full !mb-5">
            <div className="mb-1">Cơ sở</div>
            <Select
              options={StocksList}
              className="select-control"
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
          <div>
            <div className="mb-1">Ngày nghỉ</div>
            <div className="position-relative">
              <DatePicker
                selected={CrDate}
                onChange={date => setCrDate(date)}
                className="form-control"
                dateFormat={'dd/MM/yyyy'}
                maxDate={new Date()}
              />
              <i className="top-0 right-0 pointer-events-none fa-regular fa-calendar-range position-absolute w-25px h-100 d-flex align-items-center font-size-md text-muted"></i>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}

export default TimekeepingHome
