import React, { Fragment, useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import DatePicker from 'react-datepicker'
import { useMutation } from 'react-query'
import worksheetApi from 'src/api/worksheet.api'
import moment from 'moment'
import clsx from 'clsx'

function PickerAutoMarkOffday({ children, filters, refetch }) {
  const [visible, setVisible] = useState(false)
  const [CrDate, setCrDate] = useState(new Date())
  const [Items, setItems] = useState([])

  useEffect(() => {
    if (visible) {
      setCrDate(new Date())
      setItems([])
    }
  }, [visible])

  const rosterMutation = useMutation({
    mutationFn: async body => {
      let keyFind = window?.top?.GlobalConfig?.Admin?.roster_phep || 'NP'

      const newObj = {
        ...filters,
        From: moment(body?.filter?.Mon, 'YYYY-MM')
          .startOf('month')
          .format('DD/MM/YYYY'),
        To: moment(body?.filter?.Mon).endOf('month').format('DD/MM/YYYY'),
        StockID: body?.filter?.StockID,
        key: ''
      }

      const { data: AllWorkSheet } = await worksheetApi.getAllWorkSheet(newObj)
      let { list } = AllWorkSheet

      let { data } = await worksheetApi.getRoster(body)
      let rs = []

      if (data?.items && data?.items.length > 0) {
        for (let item of data?.items[0]?.Data?.Users || []) {
          let newDates = item.Dates
            ? item.Dates.filter(
                x =>
                  x.WorkShiftType &&
                  x.WorkShiftType.length > 0 &&
                  x.WorkShiftType.some(k => k?.Symbol === keyFind)
              )
            : []
          if (newDates && newDates.length > 0) {
            rs.push({
              ...item,
              Dates: newDates
            })
          }
        }
      }

      rs = rs
        .map(item => {
          let newObj = { ...item }
          let itemFind = list.find(x => x.UserID === item.UserID)
          if (itemFind) {
            newObj.Dates = newObj.Dates.map(d => {
              let newD = { ...d }
              let index = itemFind.Dates.findIndex(
                x =>
                  moment(x.Date, 'YYYY-MM-DD').format('YYYY-MM-DD') === d.Date
              )
              if (index > -1 && itemFind.Dates[index].WorkTrack) {
                newD['WorkTrack'] = itemFind.Dates[index].WorkTrack
              }
              return newD
            }).filter(
              x => !x.WorkTrack || (x?.WorkTrack && !x?.WorkTrack?.CheckIn)
            )
          }
          return newObj
        })
        .filter(x => x.Dates && x.Dates.length > 0)

      return rs
    }
  })

  const saveTimeKeepMutation = useMutation({
    mutationFn: async body => {
      let data = await worksheetApi.checkinWorkSheet(body)
      await refetch()
      return data
    }
  })

  const getRoster = () => {
    rosterMutation.mutate(
      {
        pi: 1,
        ps: 500,
        filter: {
          //"ID": ",2,3",
          Status: '3',
          Mon: moment(CrDate).format('YYYY-MM'),
          StockID: filters?.StockID?.value
        }
      },
      {
        onSuccess: rs => {
          if (!rs || rs.length === 0) {
            window?.top?.toastr &&
              window?.top?.toastr.error(
                '',
                'Chưa có dữ liệu hoặc đã thực hiện chấm công.',
                {
                  timeOut: 1500
                }
              )

            setItems([])
          } else {
            setItems(rs)
          }
        }
      }
    )
  }

  const onSubmit = () => {
    let edit = []

    for (let item of Items) {
      for (let d of item.Dates) {
        edit.push({
          CheckIn: moment(d.Date, 'YYYY-MM-DD')
            .set({
              hour: 0,
              minute: 0,
              second: 0
            })
            .format('YYYY-MM-DD HH:mm:ss'), // YYYY-MM-DD HH:mm:ss
          CheckOut: moment(d.Date, 'YYYY-MM-DD')
            .set({
              hour: 0,
              minute: 0,
              second: 0
            })
            .format('YYYY-MM-DD HH:mm:ss'), // YYYY-MM-DD HH:mm:ss
          CreateDate: d.Date, // YYYY-MM-DD
          ID: 0,
          StockID: item.StockID,
          UserID: item.UserID,
          Info: {
            CheckOut: {
              Desc: '',
              TimekeepingType: '',
              TimekeepingTypeValue: ''
            },
            CountWork: '',
            Desc: '',
            Note: 'Tự động chấm công',
            TimekeepingType: '',
            TimekeepingTypeValue: '',
            Type: '',
            WorkToday: {
              Value: 1
            }
          }
        })
      }
    }

    saveTimeKeepMutation.mutate(
      {
        edit
      },
      {
        onSuccess: () => {
          window.top.toastr &&
            window.top.toastr.success('Cập nhập thành công !', {
              timeOut: 1500
            })
          setItems([])
        },
        onError: error => console.log(error)
      }
    )
  }

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false)
      })}
      {createPortal(
        <Modal
          show={visible}
          onHide={() => setVisible(false)}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Tự động tạo công cho ngày nghỉ</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="flex gap-2.5">
              <div className="flex-1 position-relative">
                <DatePicker
                  locale="vi"
                  className="form-control fw-500"
                  dateFormat={'MM/yyyy'}
                  showMonthYearPicker
                  selected={CrDate}
                  onChange={date => setCrDate(date)}
                  popperProps={{
                    strategy: 'fixed' // ép position: fixed
                  }}
                />
                <i className="top-0 right-0 pointer-events-none fa-regular fa-calendar-range position-absolute w-25px h-100 d-flex align-items-center font-size-md text-muted"></i>
              </div>
              <div>
                <button
                  disabled={
                    rosterMutation.isLoading || saveTimeKeepMutation.isLoading
                  }
                  onClick={getRoster}
                  type="button"
                  className="h-[41px] outline-none bg-primary text-white border-0 rounded cursor-pointer px-3.5 disabled:opacity-40 relative"
                >
                  {rosterMutation.isLoading && (
                    <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
                      <svg
                        aria-hidden="true"
                        className="w-6 animate-spin fill-primary"
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
                    </div>
                  )}

                  <span
                    className={clsx(rosterMutation.isLoading && 'opacity-0')}
                  >
                    Thực hiện
                  </span>
                </button>
              </div>
            </div>
            {Items && Items.length > 0 && (
              <div className="overflow-x-auto border border-[#eee] relative grow mt-3.5">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead
                    className="sticky top-0 bg-[#f8f8f8] z-[1000] border-b border-b-[#eee]"
                    style={{
                      boxShadow: 'rgba(82, 63, 105, 0.08) 0px 10px 30px 0px'
                    }}
                  >
                    <tr>
                      <th className="px-3.5 py-2.5 text-sm font-semibold text-left z-[1000] max-w-[120px] min-w-[120px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 bg-[#f8f8f8] h-[50px] uppercase">
                        ID Nhân viên
                      </th>
                      <th className="px-3.5 py-2.5 text-sm font-semibold text-left z-[1000] max-w-[200px] min-w-[200px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 bg-[#f8f8f8] h-[50px] uppercase">
                        Tên Nhân viên
                      </th>
                      <th className="px-3.5 py-2.5 text-sm font-semibold text-left z-[1000] max-w-[140px] min-w-[140px] border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 bg-[#f8f8f8] h-[50px] uppercase">
                        Ngày
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Items.map((item, index) => (
                      <Fragment key={index}>
                        {item.Dates.map((d, i) => (
                          <tr key={i}>
                            {i === 0 && (
                              <>
                                <td
                                  className="px-3.5 py-2.5 border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0"
                                  rowSpan={item.Dates.length}
                                >
                                  {item.UserID}
                                </td>
                                <td
                                  className="px-3.5 py-3.5 border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0"
                                  rowSpan={item.Dates.length}
                                >
                                  {item.UserName}
                                </td>
                              </>
                            )}
                            <td className="px-3.5 py-3.5 border-b border-b-[#eee] border-r border-r-[#eee] last:border-r-0 min-h-[50px]">
                              {d.Date}
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="mr-5px"
              variant="secondary"
              onClick={() => setVisible(false)}
            >
              Huỷ
            </Button>
            {Items && Items.length > 0 && (
              <Button
                disabled={
                  saveTimeKeepMutation.isLoading || rosterMutation.isLoading
                }
                type="button"
                variant="primary"
                onClick={onSubmit}
                className="relative"
              >
                {saveTimeKeepMutation.isLoading && (
                  <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
                    <svg
                      aria-hidden="true"
                      className="w-6 animate-spin fill-primary"
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
                  </div>
                )}

                <span
                  className={clsx(
                    saveTimeKeepMutation.isLoading && 'opacity-0'
                  )}
                >
                  Bắt đầu tạo công
                </span>
              </Button>
            )}
          </Modal.Footer>
        </Modal>,
        document.body
      )}
    </>
  )
}

export default PickerAutoMarkOffday
