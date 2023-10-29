import React, {
  useEffect,
  useState,
  useMemo,
  forwardRef,
  useRef,
  useImperativeHandle
} from 'react'
import Navbar from '../../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import worksheetApi from 'src/api/worksheet.api'
import clsx from 'clsx'
import { useMutation, useQuery } from 'react-query'
import { CheckInOutHelpers } from 'src/helpers/CheckInOutHelpers'
import Table, { AutoResizer } from 'react-base-table'
import { PriceHelper } from 'src/helpers/PriceHelper'
import Text from 'react-texty'
import 'react-texty/styles.css'

import moment from 'moment'
import 'moment/locale/vi'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { NumericFormat } from 'react-number-format'
import { useSelector } from 'react-redux'
import { Field, Form, Formik } from 'formik'
import useWindowSize from 'src/hooks/useWindowSize'

moment.locale('vi')

function getScrollbarWidth() {
  // Creating invisible container
  const outer = document.createElement('div')
  outer.style.visibility = 'hidden'
  outer.style.overflow = 'scroll' // forcing scrollbar to appear
  outer.style.msOverflowStyle = 'scrollbar' // needed for WinJS apps
  document.body.appendChild(outer)

  // Creating inner element and placing it in the container
  const inner = document.createElement('div')
  outer.appendChild(inner)

  // Calculating difference between container's full width and the child width
  const scrollbarWidth = outer.offsetWidth - inner.offsetWidth

  // Removing temporary elements from the DOM
  outer.parentNode.removeChild(outer)

  return scrollbarWidth
}

const RenderFooter = forwardRef(({ data, SalaryConfigMons, refetch }, ref) => {
  let { id } = useParams()
  const [initialValues, setInitialValues] = useState({
    LUONG: 0,
    CONG_CA: 0,
    ID: 0
  })

  const refElm = useRef()
  useImperativeHandle(ref, () => ({
    getRef() {
      return refElm
    }
  }))

  useEffect(() => {
    if (data && data.length > 0) {
      let TotalPrice = getTotalPrice()
      let TotalCountWork = getTotalCountWork()
      if (
        data &&
        data[0].WorkTrack?.Info?.ForDate &&
        data[0].WorkTrack?.Info?.LUONG &&
        data[0].WorkTrack?.Info?.LUONG !== ''
      ) {
        setInitialValues(prevState => ({
          ...prevState,
          ID: data[0].WorkTrack?.ID || 0,
          CreateDate:
            data[0].WorkTrack?.Info?.ForDate ||
            moment(data[0].Date).format('YYYY-MM-DD'),
          CONG_CA: TotalCountWork,
          THUONG_PHAT: TotalPrice,
          LUONG: data[0].WorkTrack?.Info?.LUONG
        }))
      } else if (SalaryConfigMons?.Values?.LUONG) {
        let { Values, DayCount } = SalaryConfigMons
        let SalaryDay = 0
        if (Values?.NGAY_CONG) {
          SalaryDay = Values?.LUONG / Values?.NGAY_CONG
        } else {
          SalaryDay = Values?.LUONG / (DayCount - Values?.NGAY_NGHI)
        }

        setInitialValues(prevState => ({
          ...prevState,
          LUONG: Math.floor(TotalCountWork * SalaryDay + TotalPrice),
          CONG_CA: TotalCountWork,
          THUONG_PHAT: TotalPrice,
          ID: data[0].WorkTrack?.ID || 0,
          CreateDate: moment(data[0].Date).format('YYYY-MM-DD')
        }))
      } else {
        setInitialValues(prevState => ({
          ...prevState,
          LUONG: 0,
          CONG_CA: TotalCountWork,
          THUONG_PHAT: TotalPrice,
          ID: data[0].WorkTrack?.ID || 0,
          CreateDate: moment(data[0].Date).format('YYYY-MM-DD')
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SalaryConfigMons, data])

  const getTotalPrice = () => {
    if (!data || data.length === 0) return 0
    return data.reduce(
      (n, { WorkTrack }) =>
        n +
        (WorkTrack.Info.TimekeepingTypeValue || 0) +
        (WorkTrack.Info.CheckOut.TimekeepingTypeValue || 0),
      0
    )
  }

  const getTotalCountWork = () => {
    if (!data || data.length === 0) return 0
    return data.reduce(
      (n, { WorkTrack }) => n + Number(WorkTrack?.Info?.CountWork || 0),
      0
    )
  }

  const updateTimeKeepMutation = useMutation({
    mutationFn: body => worksheetApi.checkinWorkSheet(body)
  })

  const onSubmit = values => {
    let newValues = {
      edit: [
        {
          ID: values.ID,
          CreateDate: values.CreateDate,
          UserID: id,
          Info: {
            ForDate: values.CreateDate,
            CONG_CA: values.CONG_CA,
            LUONG: values.LUONG,
            THUONG_PHAT: values.THUONG_PHAT
          }
        }
      ]
    }
    updateTimeKeepMutation.mutate(newValues, {
      onSuccess: () => {
        refetch().then(
          () =>
            window.top.toastr &&
            window.top.toastr.success('Chốt lương thành công !', {
              timeOut: 1500
            })
        )
      },
      onError: error => console.log(error)
    })
  }

  return (
    <div className="flex flex-col h-100">
      <div
        className="flex overflow-auto no-scrollbar h-[45px]"
        id="el-footer"
        ref={refElm}
      >
        <div className="md:w-[300px] md:min-w-[300px] w-[120px] min-w-[120px]" />
        <div className="w-[180px] min-w-[180px]" />
        <div className="w-[200px] min-w-[200px]" />
        <div
          className={clsx(
            'w-[250px] min-w-[250px] border-l border-t-0 border-r-0 border-b-0 border-[#eee] border-solid flex items-center px-3 font-semibold text-lg',
            getTotalPrice() < 0 ? 'text-danger' : 'text-success'
          )}
        >
          {PriceHelper.formatVND(getTotalPrice())}
        </div>
        <div className="w-[220px] min-w-[220px] border-l border-t-0 border-r-0 border-b-0 border-[#eee] border-solid" />
        <div className="w-[320px] min-w-[320px]" />
        <div className="w-[150px] min-w-[150px] border-l border-t-0 border-r-0 border-b-0 border-[#eee] border-solid flex justify-center items-center font-semibold text-lg">
          {getTotalCountWork()}
        </div>
        <div className="w-[300px] min-w-[300px] border-l border-t-0 border-r-0 border-b-0 border-[#eee] border-solid" />
        <div
          style={{
            width: getScrollbarWidth() + 'px',
            minWidth: getScrollbarWidth() + 'px'
          }}
        ></div>
      </div>
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize={true}
      >
        {formikProps => {
          // errors, touched, handleChange, handleBlur
          //const { values } = formikProps
          return (
            <Form
              className="flex items-center justify-end px-3 border-top grow"
              autoComplete="off"
            >
              <div className="font-medium text-base mr-3.5">Lương dự kiến</div>
              <div className="mr-3.5">
                <Field name="LUONG">
                  {({ field, form, meta }) => (
                    <NumericFormat
                      allowLeadingZeros
                      thousandSeparator={true}
                      allowNegative={true}
                      className="form-control form-control-solid !font-bold !text-lg"
                      type="text"
                      placeholder="Nhập lương dự kiến"
                      onValueChange={({ floatValue }) => {
                        form.setFieldValue(`LUONG`, floatValue)
                      }}
                      autoComplete="off"
                      value={field.value}
                    />
                  )}
                </Field>
              </div>
              <button
                type="submit"
                disabled={updateTimeKeepMutation.isLoading}
                className={clsx(
                  'btn btn-primary min-w-[102px]',
                  updateTimeKeepMutation.isLoading &&
                    'spinner spinner-white spinner-right'
                )}
              >
                Chốt lương
              </button>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
})

function TimekeepingMember(props) {
  const navigate = useNavigate()
  let { id } = useParams()

  const { CrStockID } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID
  }))

  const [filters, setFilters] = useState({
    From: '',
    To: '',
    StockID: '',
    key: '',
    UserID: Number(id)
  })

  const [CrDate, setCrDate] = useState(new Date())

  const childCompRef = useRef()

  const { width } = useWindowSize()

  useEffect(() => {
    setFilters(prevState => ({
      ...prevState,
      From: CrDate ? moment(CrDate).startOf('month').format('DD/MM/YYYY') : '',
      To: CrDate ? moment(CrDate).endOf('month').format('DD/MM/YYYY') : ''
    }))
  }, [CrDate])

  const { isLoading, isFetching, data, refetch } = useQuery({
    queryKey: ['ListWorkSheetUserId', filters],
    queryFn: async () => {
      const newObj = {
        ...filters,
        From: filters.From,
        To: filters.To,
        StockID: CrStockID
      }

      const { data } = await worksheetApi.getAllWorkSheet(newObj)
      return (
        data?.list &&
        data?.list.length > 0 &&
        data.list.map(item => ({
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
                                    date?.WorkTrack?.Info?.Type === 'CA_NHAN'
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
                                      date?.WorkTrack?.Info?.CheckOut?.Type ===
                                      'CA_NHAN'
                                        ? 'Việc cá nhân'
                                        : 'Việc công ty',
                                    value: date?.WorkTrack?.Info?.CheckOut?.Type
                                  }
                                : '',
                              Desc: date?.WorkTrack?.Info?.CheckOut?.Desc || ''
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
        }))[0]
      )
    },
    enabled: Boolean(CrStockID && filters.From && filters.To),
    keepPreviousData: true
  })

  const columns = useMemo(
    () => [
      {
        width: width > 767 ? 300 : 120,
        title: 'Ngày',
        key: 'Date',
        sortable: false,
        frozen: 'left',
        cellRenderer: ({ rowData }) => (
          <div className="flex items-center w-full h-full font-medium">
            {moment(rowData.Date).format('DD-MM-YYYY')}
          </div>
        )
      },
      {
        width: 180,
        title: 'Vào / Ra',
        key: 'CheckIn/CheckOut',
        sortable: false,
        className: () => 'relative',
        cellRenderer: ({ rowData }) =>
          !rowData.WorkTrack.CheckIn && !rowData.WorkTrack.CheckOut ? (
            <></>
          ) : (
            <div className="grid w-full h-full grid-flow-col grid-rows-2">
              <div className="absolute w-full h-[1px] bg-[#eee] left-0 top-2/4"></div>
              <div className="flex items-center justify-between !text-success">
                <span className="font-medium">
                  {rowData.WorkTrack.CheckIn
                    ? moment(rowData.WorkTrack.CheckIn).format('HH:mm:ss')
                    : '--:--:--'}
                </span>
                {/* <ArrowLeftOnRectangleIcon className="w-6 ml-1.5" /> */}
              </div>
              <div className="flex items-center justify-between !text-danger">
                <span className="font-medium">
                  {rowData.WorkTrack.CheckOut
                    ? moment(rowData.WorkTrack.CheckOut).format('HH:mm:ss')
                    : '--:--:--'}
                </span>
                {/* <ArrowRightOnRectangleIcon className="w-6 ml-1.5" /> */}
              </div>
            </div>
          )
      },
      {
        width: 200,
        title: 'Loại',
        key: 'TimeKeepingType',
        sortable: false,
        className: () => 'relative',
        cellRenderer: ({ rowData }) =>
          !rowData.WorkTrack.Info.TimekeepingType &&
          !rowData.WorkTrack.Info.CheckOut.TimekeepingType ? (
            <></>
          ) : (
            <div className="grid w-full h-full grid-flow-col grid-rows-2">
              <div className="absolute w-full h-[1px] bg-[#eee] left-0 top-2/4"></div>
              <div className="flex items-center justify-between !text-success">
                {rowData.WorkTrack.Info.TimekeepingType &&
                  rowData.WorkTrack.Info.TimekeepingType.label}
              </div>
              <div className="flex items-center justify-between !text-danger">
                {rowData.WorkTrack.Info.CheckOut.TimekeepingType &&
                  rowData.WorkTrack.Info.CheckOut.TimekeepingType.label}
              </div>
            </div>
          )
      },
      {
        width: 250,
        title: 'Tiền thưởng / phạt',
        key: 'TimekeepingTypeValue',
        sortable: false,
        className: () => 'relative',
        cellRenderer: ({ rowData }) => (
          <div className="grid w-full h-full grid-flow-col grid-rows-2">
            <div className="absolute w-full h-[1px] bg-[#eee] left-0 top-2/4"></div>
            <div className="flex items-center justify-between !text-success">
              {PriceHelper.formatVND(
                rowData.WorkTrack.Info.TimekeepingTypeValue
              )}
            </div>
            <div className="flex items-center justify-between !text-danger">
              {PriceHelper.formatVND(
                rowData.WorkTrack.Info.CheckOut.TimekeepingTypeValue
              )}
            </div>
          </div>
        )
      },
      {
        width: 220,
        title: 'Lý do',
        key: 'Type',
        sortable: false,
        className: () => 'relative',
        cellRenderer: ({ rowData }) => (
          <div className="grid w-full h-full grid-flow-col grid-rows-2">
            <div className="absolute w-full h-[1px] bg-[#eee] left-0 top-2/4"></div>
            <div className="flex items-center justify-between !text-success">
              {rowData.WorkTrack.Info.Type && rowData.WorkTrack.Info.Type.label}
            </div>
            <div className="flex items-center justify-between !text-danger">
              {rowData.WorkTrack.Info.CheckOut.Type &&
                rowData.WorkTrack.Info.CheckOut.Type.label}
            </div>
          </div>
        )
      },
      {
        width: 320,
        title: 'Mô tả lý do',
        key: 'Desc',
        sortable: false,
        className: () => 'relative',
        cellRenderer: ({ rowData }) => (
          <div className="grid w-full h-full grid-flow-col grid-rows-2">
            <div className="absolute w-full h-[1px] bg-[#eee] left-0 top-2/4"></div>

            <div className="flex items-center justify-between !text-success truncate w-full">
              <Text tooltipMaxWidth={280}>{rowData.WorkTrack.Info.Desc}</Text>
            </div>

            <div className="flex items-center justify-between !text-danger truncate w-full">
              <Text tooltipMaxWidth={280}>
                {rowData.WorkTrack.Info.CheckOut.Desc}
              </Text>
            </div>
          </div>
        )
      },
      {
        width: 150,
        title: 'Số công',
        key: 'CountWork',
        sortable: false,
        headerClassName: () => 'justify-center',
        className: () => 'justify-center font-semibold',
        cellRenderer: ({ rowData }) => rowData.WorkTrack.Info.CountWork
      },
      {
        width: 300,
        title: 'Ghi chú',
        key: 'Note',
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div className="w-full line-clamp-3">
            <OverlayTrigger
              overlay={
                <Tooltip id="tooltip">{rowData.WorkTrack.Info.Note}</Tooltip>
              }
            >
              <div>{rowData.WorkTrack.Info.Note}</div>
            </OverlayTrigger>
          </div>
        )
      }
    ],
    [width]
  )

  const rowClassName = ({ rowData }) => {
    return rowData?.WorkTrack?.Info?.WorkToday?.isOff && '!bg-[#fff5f8]'
  }

  return (
    <div className="card h-100 timekeeping">
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
                {isLoading ? 'Đang tải ...' : data?.FullName}
              </div>
              {!isLoading && (
                <span className="text-muted text-capitalize fw-500 font-size-sm pl-5px">
                  {data?.StockTitle}
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
              <i className="top-0 right-0 pointer-events-none fa-regular fa-calendar-range position-absolute w-25px h-100 d-flex align-items-center font-size-md text-muted"></i>
            </div>
            <div className="h-40px w-1px border-right mx-15px"></div>
            <Navbar />
          </div>
        </div>
      </div>
      <div className="p-0 card-body">
        <AutoResizer>
          {({ width, height }) => (
            <Table
              className="BaseTable--has-hover"
              fixed
              rowKey="Date"
              width={width}
              height={height}
              columns={columns}
              data={data?.Dates || []}
              rowHeight={100}
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
              onScroll={({ scrollLeft }) => {
                const el = childCompRef.current.getRef()

                if (el?.current) {
                  el.current.scrollLeft = scrollLeft
                }
              }}
              footerHeight={110}
              footerRenderer={
                <RenderFooter
                  data={data?.Dates || []}
                  SalaryConfigMons={
                    data?.SalaryConfigMons ? data?.SalaryConfigMons[0] : null
                  }
                  refetch={refetch}
                  ref={childCompRef}
                />
              }
            />
          )}
        </AutoResizer>
      </div>
    </div>
  )
}

export default TimekeepingMember
