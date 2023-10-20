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
import { useInfiniteQuery, useMutation } from 'react-query'
import { ArrayHelpers } from 'src/helpers/ArrayHelpers'
import Swal from 'sweetalert2'
import 'sweetalert2/src/sweetalert2.scss'
import PickerTakeBreak from './components/PickerTakeBreak'
import Text from 'react-texty'

function TakeBreakPage(props) {
  const navigate = useNavigate()

  const { Stocks, CrStockID } = useSelector(({ auth }) => ({
    Stocks: auth?.Info?.Stocks || [],
    CrStockID: auth?.Info?.CrStockID
  }))
  const [StocksList, setStocksList] = useState([])
  const [filters, setFilters] = useState({
    StockID: '', // ID Stock
    From: new Date(), // Ngày bắt đầu
    To: new Date(), // Ngày kết thúc
    pi: 1, // Trang hiện tại
    ps: 20 // Số lượng item
  })

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

  const { data, fetchNextPage, hasNextPage, refetch, isLoading, isFetching } =
    useInfiniteQuery({
      queryKey: ['ListWorkOff', filters],
      queryFn: async ({ pageParam = 1 }) => {
        const newObj = {
          filter: {
            From: filters.From ? moment(filters.From).format('YYYY-MM-DD') : '',
            To: filters.To ? moment(filters.To).format('YYYY-MM-DD') : '',
            StockID: filters.StockID ? filters.StockID.ID : '',
            UserIDs: filters.UserID ? [filters.UserID.value] : ''
          },
          pi: pageParam,
          ps: filters.ps
        }

        const { data } = await worksheetApi.listWorkOff(newObj)
        return (
          {
            ...data,
            pcount: data?.pcount || 1
          } || []
        )
      },
      getNextPageParam: (lastPage, pages) => {
        return lastPage.pi === lastPage.pcount ? undefined : lastPage.pi + 1
      },
      keepPreviousData: true,
      enabled: Boolean(filters.StockID && filters.From && filters.To)
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
        width: 300,
        title: 'Họ tên nhân viên',
        key: 'User.FullName',
        sortable: false,
        cellRenderer: ({ rowData }) => rowData?.User?.FullName
      },
      {
        width: 200,
        title: 'Ngày tạo',
        key: 'CreateDate',
        sortable: false,
        cellRenderer: ({ rowData }) =>
          moment(rowData.CreateDate).format('HH:mm DD-MM-YYYY')
      },
      {
        width: 200,
        title: 'Nghỉ từ',
        key: 'From',
        sortable: false,
        cellRenderer: ({ rowData }) =>
          moment(rowData.From).format('HH:mm DD-MM-YYYY')
      },
      {
        width: 200,
        title: 'Nghỉ đến',
        key: 'To',
        sortable: false,
        cellRenderer: ({ rowData }) =>
          moment(rowData.To).format('HH:mm DD-MM-YYYY')
      },
      {
        width: 350,
        title: 'Lý do',
        key: 'Desc',
        sortable: false,
        cellRenderer: ({ rowData }) => rowData?.Desc
      },
      {
        width: 150,
        title: '#',
        key: '#',
        sortable: false,
        cellRenderer: ({ rowData }) => (
          <div className="flex w-full justify-content-center">
            <PickerTakeBreak item={rowData}>
              {({ open }) => (
                <button
                  type="button"
                  className="mx-1 btn btn-xs btn-primary"
                  onClick={open}
                >
                  Sửa
                </button>
              )}
            </PickerTakeBreak>

            <button
              type="button"
              className="mx-1 btn btn-xs btn-danger"
              onClick={() => onDelete(rowData)}
            >
              Xoá
            </button>
          </div>
        ),
        headerClassName: () => 'justify-content-center',
        style: {
          textAlign: 'center'
        },
        frozen: 'right'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const deleteMutation = useMutation({
    mutationFn: body => worksheetApi.deleteWorkOff(body)
  })

  const onDelete = ({ ID }) => {
    Swal.fire({
      title: 'Xóa lịch nghỉ này',
      text: 'Bạn đang muốn thực hiện xóa lịch nghỉ này ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Thực hiện',
      cancelButtonText: 'Hủy',
      showLoaderOnConfirm: true,
      preConfirm: login =>
        new Promise((resolve, reject) => {
          deleteMutation.mutate(
            { delete: [ID] },
            {
              onSettled: () => {
                refetch().then(() => resolve())
              }
            }
          )
        })
    }).then(result => {
      if (result.isConfirmed) {
        window.top.toastr &&
          window.top.toastr.success('Xóa thành công', {
            timeOut: 1500
          })
      }
    })
  }

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

  return (
    <div className="h-100 card">
      <div className="card-header d-block p-20px min-h-125px min-h-md-auto">
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
                Danh sách xin nghỉ
              </div>
            </div>
          </h3>
          <div className="d-flex">
            <div className="w-225px">
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
            <div className="position-relative w-250px">
              <DatePicker
                onChange={dates => {
                  const [start, end] = dates
                  setFilters(prevState => ({
                    ...prevState,
                    From: start,
                    To: end
                  }))
                }}
                placeholderText="Chọn ngày"
                className="form-control form-control-solid"
                dateFormat={'dd/MM/yyyy'}
                selectsRange
                startDate={filters.From}
                endDate={filters.To}
              />
              <i className="top-0 right-0 pointer-events-none fa-regular fa-calendar-range position-absolute w-25px h-100 d-flex align-items-center font-size-md text-muted"></i>
            </div>
            <div className="h-40px w-1px border-right mx-15px"></div>
            <PickerTakeBreak>
              {({ open }) => (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={open}
                >
                  Tạo lịch nghỉ
                </button>
              )}
            </PickerTakeBreak>
          </div>
        </div>
      </div>
      <div className="relative overflow-auto card-body p-20px">
        <AutoResizer>
          {({ width, height }) => (
            <Table
              fixed
              components={{ TableCell, TableHeaderCell }}
              rowKey="ID"
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
    </div>
  )
}

export default TakeBreakPage
