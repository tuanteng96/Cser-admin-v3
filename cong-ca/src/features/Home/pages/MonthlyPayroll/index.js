import React, { useEffect, useMemo, useState } from 'react'
import Table, { AutoResizer } from 'react-base-table'
import { useNavigate } from 'react-router-dom'
import 'react-base-table/styles.css'
import DatePicker from 'react-datepicker'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import SelectStaffs from 'src/components/Selects/SelectStaffs'
import worksheetApi from 'src/api/worksheet.api'
import moment from 'moment'
import { useInfiniteQuery } from 'react-query'
import { ArrayHelpers } from 'src/helpers/ArrayHelpers'
import 'sweetalert2/src/sweetalert2.scss'
import Text from 'react-texty'
import { Modal } from 'react-bootstrap'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { BarsArrowDownIcon } from '@heroicons/react/24/solid'
import useWindowSize from 'src/hooks/useWindowSize'
import ExcelHepers from 'src/helpers/ExcelHepers'

function MonthlyPayroll(props) {
  const navigate = useNavigate()

  const { Stocks, CrStockID, rightsSum } = useSelector(({ auth }) => ({
    Stocks: auth?.Info?.Stocks || [],
    CrStockID: auth?.Info?.CrStockID,
    rightsSum: auth?.Info?.rightsSum?.cong_ca || {}
  }))

  const [StocksList, setStocksList] = useState([])
  const [visible, setVisible] = useState(false)
  const [filters, setFilters] = useState({
    StockID: '', // ID Stock
    Month: new Date(),
    pi: 1, // Trang hiện tại
    ps: 20 // Số lượng item
  })
  const [isExport, setIsExport] = useState(false)

  const { width } = useWindowSize()

  useEffect(() => {
    const newStocks = Stocks.filter(stock => stock.ParentID !== 0).map(
      stock => ({
        ...stock,
        value: stock.ID,
        label: stock.Title
      })
    )

    if (rightsSum?.IsAllStock) {
      newStocks.unshift({
        label: 'Tất cả cơ sở',
        value: ''
      })
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
  }, [Stocks, CrStockID])

  const { data, fetchNextPage, hasNextPage, isLoading, isFetching } =
    useInfiniteQuery({
      queryKey: ['ListUserSalary', filters],
      queryFn: async ({ pageParam = 1 }) => {
        const newObj = {
          mon: filters.Month ? moment(filters.Month).format('MM/YYYY') : '',
          stockid: filters.StockID ? filters.StockID.ID : '',
          // UserIDs: filters.UserID ? [filters.UserID.value] : '',
          pi: pageParam,
          ps: filters.ps
        }

        const { data } = await worksheetApi.listUserSalary(newObj)
        return (
          {
            ...data,
            pcount: data?.pcount || 1,
            pi: pageParam,
            list: data?.list
              ? data?.list.map(x => ({ ...x, UserID: x.User.ID }))
              : []
          } || []
        )
      },
      getNextPageParam: (lastPage, pages) => {
        return lastPage.pi === lastPage.pcount ? undefined : lastPage.pi + 1
      },
      keepPreviousData: true,
      enabled: Boolean(filters.StockID && filters.Month)
    })

  let List = ArrayHelpers.useInfiniteQuery(data?.pages, 'list')

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) =>
          filters.ps * (filters.pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center'
      },
      {
        width: width > 767 ? 300 : 200,
        title: 'Họ tên nhân viên',
        key: 'User.FullName',
        sortable: false,
        cellRenderer: ({ rowData }) => rowData?.User?.FullName
      },
      {
        width: width > 767 ? 200 : 120,
        title: 'Số công',
        key: 'TrackValue.WorkQty',
        cellRenderer: ({ rowData }) => rowData?.TrackValue?.WorkQty,
        sortable: false
      },
      {
        width: width > 767 ? 200 : 120,
        title: 'Phụ cấp ngày',
        key: 'TrackValue.WorkQtyAllowance',
        cellRenderer: ({ rowData }) => {
          return PriceHelper.formatVND(
            (rowData?.TrackValue?.WorkQtyAllowance || 0) *
              (rowData?.TrackValue?.Config?.Values?.TRO_CAP_NGAY || 0)
          )
        },
        sortable: false
      },
      {
        width: width > 767 ? 250 : 180,
        title: 'Tổng lương chấm công',
        key: 'NGAY_LUONG_CO_BAN',
        sortable: false,
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            rowData?.TrackValue?.WorkQty * rowData.NGAY_LUONG_CO_BAN
          )
      },
      {
        width: width > 767 ? 250 : 180,
        title: 'Tổng phạt (Đi muộn, về sớm)',
        key: 'DI_MUON+VE_SOM',
        sortable: false,
        cellRenderer: ({ rowData }) =>
          rowData.TrackValue.DI_MUON + rowData.TrackValue.VE_SOM > 0
            ? `-${PriceHelper.formatVND(
                rowData.TrackValue.DI_MUON + rowData.TrackValue.VE_SOM
              )}`
            : PriceHelper.formatVND(
                rowData.TrackValue.DI_MUON + rowData.TrackValue.VE_SOM
              )
      },
      {
        width: width > 767 ? 350 : 180,
        title: 'Tổng Tăng ca, Thêm giờ',
        key: 'DI_SOM+VE_MUON',
        sortable: false,
        cellRenderer: ({ rowData }) =>
          `${PriceHelper.formatVND(
            rowData.TrackValue.DI_SOM + rowData.TrackValue.VE_MUON
          )}`
      },
      {
        width: width > 767 ? 250 : 180,
        title: 'Tổng lương tháng',
        key: 'Total',
        sortable: false,
        cellRenderer: ({ rowData }) =>
          PriceHelper.formatVND(
            rowData?.TrackValue?.WorkQty * rowData.NGAY_LUONG_CO_BAN -
              (rowData.TrackValue.DI_MUON + rowData.TrackValue.VE_SOM) +
              (rowData.TrackValue.DI_SOM + rowData.TrackValue.VE_MUON) +
              (rowData?.TrackValue?.WorkQtyAllowance || 0) *
                (rowData?.TrackValue?.Config?.Values?.TRO_CAP_NGAY || 0)
          )
        // frozen: 'right'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const TableCell = ({ className, cellData }) => (
    <Text tooltipMaxWidth={280} className={className}>
      {cellData}
    </Text>
  )

  const TableHeaderCell = ({ className, column }) => (
    <Text tooltipMaxWidth={280} className={className}>
      {column.title}
    </Text>
  )

  const onExport = () => {
    window?.top?.loading &&
      window?.top?.loading('Đang thực hiện ...', () => {
        setIsExport(true)
        const newObj = {
          mon: filters.Month ? moment(filters.Month).format('MM/YYYY') : '',
          stockid: filters.StockID ? filters.StockID.ID : '',
          // UserIDs: filters.UserID ? [filters.UserID.value] : '',
          pi: 1,
          ps: 5000
        }
        worksheetApi.listUserSalary(newObj).then(({ data }) => {
          ExcelHepers.dataToExcel(
            'Chấm công tháng-' + moment(filters.Month).format('MM-YYYY'),
            (sheet, workbook) => {
              workbook.suspendPaint()
              workbook.suspendEvent()
              let Head = [
                'STT',
                'HỌ TÊN NHÂN VIÊN',
                'SỐ CÔNG',
                'PHỤ CẤP NGÀY',
                'TỔNG LƯƠNG CHẤM CÔNG',
                'TỔNG PHẠT (ĐI SỚM / VỀ MUỘN)',
                'TỔNG TĂNG CA, THÊM GIỜ',
                'TỔNG LƯƠNG THÁNG'
              ]

              let Response = [Head]

              if (data?.list && data?.list.length > 0) {
                for (let [index, item] of data?.list.entries()) {
                  let newArray = [
                    index + 1,
                    item?.User?.FullName,
                    item?.TrackValue?.WorkQty,
                    (item?.TrackValue?.WorkQtyAllowance || 0) *
                      (item?.TrackValue?.Config?.Values?.TRO_CAP_NGAY || 0),
                    item?.TrackValue?.WorkQty * item?.NGAY_LUONG_CO_BAN,
                    item?.TrackValue.DI_MUON + item?.TrackValue.VE_SOM > 0
                      ? `-${item?.TrackValue.DI_MUON + item?.TrackValue.VE_SOM}`
                      : item?.TrackValue.DI_MUON + item?.TrackValue.VE_SOM,
                    item?.TrackValue.DI_SOM + item?.TrackValue.VE_MUON,
                    item?.TrackValue?.WorkQty * item.NGAY_LUONG_CO_BAN -
                      (item.TrackValue.DI_MUON + item.TrackValue.VE_SOM) +
                      (item.TrackValue.DI_SOM + item.TrackValue.VE_MUON) +
                      (item?.TrackValue?.WorkQtyAllowance || 0) *
                        (item?.TrackValue?.Config?.Values?.TRO_CAP_NGAY || 0)
                  ]
                  Response.push(newArray)
                }
              }

              let TotalRow = Response.length
              let TotalColumn = Head.length

              sheet.setArray(2, 0, Response)

              //title
              workbook
                .getActiveSheet()
                .getCell(0, 0)
                .value(
                  'Chấm công tháng- ' + moment(filters.Month).format('MM-YYYY')
                )
              workbook.getActiveSheet().getCell(0, 0).font('18pt Arial')

              workbook
                .getActiveSheet()
                .getRange(2, 0, 1, TotalColumn)
                .font('12pt Arial')
              workbook
                .getActiveSheet()
                .getRange(2, 0, 1, TotalColumn)
                .backColor('#E7E9EB')
              //border
              var border = new window.GC.Spread.Sheets.LineBorder()
              border.color = '#000'
              border.style = window.GC.Spread.Sheets.LineStyle.thin
              workbook
                .getActiveSheet()
                .getRange(2, 0, TotalRow, TotalColumn)
                .borderLeft(border)
              workbook
                .getActiveSheet()
                .getRange(2, 0, TotalRow, TotalColumn)
                .borderRight(border)
              workbook
                .getActiveSheet()
                .getRange(2, 0, TotalRow, TotalColumn)
                .borderBottom(border)
              workbook
                .getActiveSheet()
                .getRange(2, 0, TotalRow, TotalColumn)
                .borderTop(border)
              //filter
              var cellrange = new window.GC.Spread.Sheets.Range(
                3,
                0,
                1,
                TotalColumn
              )
              var hideRowFilter =
                new window.GC.Spread.Sheets.Filter.HideRowFilter(cellrange)
              workbook.getActiveSheet().rowFilter(hideRowFilter)

              //format number
              workbook
                .getActiveSheet()
                .getCell(2, 0)
                .hAlign(window.GC.Spread.Sheets.HorizontalAlign.center)

              //auto fit width and height
              workbook.getActiveSheet().autoFitRow(TotalRow + 2)
              workbook.getActiveSheet().autoFitRow(0)

              for (let i = 1; i < TotalColumn; i++) {
                workbook.getActiveSheet().autoFitColumn(i)
              }

              for (let i = 0; i <= TotalRow; i++) {
                workbook.getActiveSheet().setFormatter(i + 3, 3, '#,#')
                workbook.getActiveSheet().setFormatter(i + 3, 4, '#,#')
                workbook.getActiveSheet().setFormatter(i + 3, 5, '#,#')
                workbook.getActiveSheet().setFormatter(i + 3, 6, '#,#')
                workbook.getActiveSheet().setFormatter(i + 3, 7, '#,#')
              }

              window.top?.toastr?.remove()

              //Finish
              workbook.resumePaint()
              workbook.resumeEvent()

              setIsExport(false)
            }
          )
        })
      })
  }

  return (
    <div className="h-100 card">
      <div className="card-header d-block p-20px !min-h-[75px] !md-min-h-[125px]">
        <div className="d-flex justify-content-between">
          <h3 className="text-uppercase">
            <div className="d-flex align-items-baseline">
              <div
                className="cursor-pointer d-flex"
                onClick={() => navigate('/')}
              >
                <div className="w-20px">
                  <i className="ml-0 fa-regular fa-chevron-left vertical-align-middle text-muted"></i>
                </div>
                Chấm công tháng
              </div>
            </div>
          </h3>
          <div className="flex">
            <div className="hidden lg:flex">
              {/* <div className="w-250px">
                <SelectStaffs
                  className="select-control select-control-solid"
                  menuPosition="fixed"
                  name="UserID"
                  onChange={otp =>
                    setFilters(prevState => ({ ...prevState, UserID: otp }))
                  }
                  value={filters.UserID}
                  isClearable={true}
                />
              </div> */}
              <button
                type="button"
                className="h-[42px] bg-primary px-4 text-white border-0 rounded hover:opacity-90 transition-all"
                onClick={onExport}
                disabled={isExport}
              >
                Xuất Excel
              </button>
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
              <div className="position-relative w-250px">
                <DatePicker
                  showMonthYearPicker
                  onChange={dates => {
                    setFilters(prevState => ({
                      ...prevState,
                      Month: dates
                    }))
                  }}
                  placeholderText="Chọn tháng"
                  className="form-control form-control-solid"
                  dateFormat={'MM/yyyy'}
                  selected={filters.Month}
                />
                <i className="top-0 right-0 pointer-events-none fa-regular fa-calendar-range position-absolute w-25px h-100 d-flex align-items-center font-size-md text-muted"></i>
              </div>
            </div>
            <div
              className="xl:hidden w-[40px] h-[40px] !bg-success rounded text-white flex items-center justify-center ml-3"
              onClick={() => setVisible(true)}
            >
              <BarsArrowDownIcon className="w-7" />
            </div>
          </div>
        </div>
      </div>
      <div className="relative overflow-auto card-body p-20px">
        <AutoResizer>
          {({ width, height }) => (
            <Table
              fixed
              components={{ TableCell, TableHeaderCell }}
              rowKey="UserID"
              width={width}
              height={height}
              columns={columns}
              data={List}
              ignoreFunctionInColumnCompare={false}
              loadingMore={hasNextPage}
              disabled={isLoading}
              onEndReached={fetchNextPage}
              onEndReachedThreshold={300}
              emptyRenderer={() =>
                (!isLoading || !isFetching) && (
                  <div
                    className="h-full d-flex justify-content-center align-items-center"
                    style={{ fontSize: '15px' }}
                  >
                    Không có dữ liệu
                  </div>
                )
              }
              overlayRenderer={() =>
                isLoading || isFetching ? (
                  <div
                    id="splash-screen"
                    className="kt-splash-screen"
                    style={{
                      background: 'rgb(255 255 255 / 58%)'
                    }}
                  >
                    <svg className="splash-spinner" viewBox="0 0 50 50">
                      <circle
                        className="path"
                        cx={25}
                        cy={25}
                        r={20}
                        fill="none"
                        strokeWidth={5}
                      />
                    </svg>
                  </div>
                ) : null
              }
            />
          )}
        </AutoResizer>
      </div>
      <Modal
        show={visible}
        onHide={() => setVisible(false)}
        dialogClassName="modal-content-right max-w-400px"
        scrollable={true}
        enforceFocus={false}
      >
        <Modal.Header closeButton>
          <Modal.Title className="font-title text-uppercase">
            Bộ lọc
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <div className="w-full !mb-5">
            <div className="mb-1">Nhân viên</div>
            <SelectStaffs
              className="select-control"
              menuPosition="fixed"
              name="UserID"
              onChange={otp =>
                setFilters(prevState => ({ ...prevState, UserID: otp }))
              }
              value={filters.UserID}
              isClearable={true}
            />
          </div> */}
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
            <div className="mb-1">Tháng</div>
            <div className="position-relative">
              <DatePicker
                showMonthYearPicker
                onChange={dates => {
                  setFilters(prevState => ({
                    ...prevState,
                    Month: dates
                  }))
                }}
                placeholderText="Chọn tháng"
                className="form-control"
                dateFormat={'MM/yyyy'}
                selected={filters.Month}
              />
              <i className="top-0 right-0 pointer-events-none fa-regular fa-calendar-range position-absolute w-25px h-100 d-flex align-items-center font-size-md text-muted"></i>
            </div>
          </div>
        </Modal.Body>
        <div className="p-[16px]">
          <button
            type="button"
            className="w-full h-[42px] bg-primary px-4 text-white border-0 rounded hover:opacity-90 transition-all"
            onClick={onExport}
            disabled={isExport}
          >
            Xuất Excel
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default MonthlyPayroll
