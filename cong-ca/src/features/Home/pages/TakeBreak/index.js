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
import { useInfiniteQuery, useQuery } from 'react-query'
import { ArrayHelpers } from 'src/helpers/ArrayHelpers'

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
    ps: 15 // Số lượng item
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

  const { isLoading, data } = useInfiniteQuery({
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
        ps: 20
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
    enabled: Boolean(filters.StockID && filters.From && filters.To)
  })
  let List = ArrayHelpers.useInfiniteQuery(data?.pages, 'list');

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        dataKey: 'index',
        cellRenderer: ({ rowIndex }) =>
          filters.Ps * (filters.Pi - 1) + (rowIndex + 1),
        width: 60,
        sortable: false,
        align: 'center',
        mobileOptions: {
          visible: true
        }
      },
      {
        title: 'Họ tên nhân viên',
        key: 'Member.FullName',
        sortable: false,
        frozen: 'left',
        style: {
          fontWeight: 600
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="h-100 card">
      <div className="card-header d-block p-20px min-h-125px min-h-md-auto">
        <div className="d-flex justify-content-between">
          <h3 className="text-uppercase">
            <div className="d-flex align-items-baseline">
              <div
                className="d-flex cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-20px">
                  <i className="fa-regular fa-chevron-left ml-0 vertical-align-middle text-muted"></i>
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
              <i className="fa-regular fa-calendar-range position-absolute w-25px h-100 top-0 right-0 d-flex align-items-center pointer-events-none font-size-md text-muted"></i>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body p-20px overflow-auto relative">
        <AutoResizer>
          {({ width, height }) => (
            <Table
              fixed
              rowKey="ID"
              width={width}
              height={height}
              columns={columns}
              data={List}
              ignoreFunctionInColumnCompare={false}
            />
          )}
        </AutoResizer>
      </div>
    </div>
  )
}

export default TakeBreakPage
