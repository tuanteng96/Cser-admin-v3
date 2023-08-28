import React, { Fragment, useEffect, useRef, useState } from 'react'
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import clsx from 'clsx'
import useWindowSize from 'src/hooks/useWindowSize'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

const HolidaycheduleLine = ({ member, item, onOpenModalHoliday }) => {
  const { TimeOpen, TimeClose } = useSelector(({ auth }) => ({
    TimeOpen: auth?.GlobalConfig?.APP?.Working?.TimeOpen || '00:00:00',
    TimeClose: auth?.GlobalConfig?.APP?.Working?.TimeClose || '23:59:00'
  }))
  const [option, setOption] = useState(null)

  useEffect(() => {
    if (item.WorkOffs && item.WorkOffs.length > 0) {
      const { Date } = item
      const newWorkOff = item.WorkOffs.map(({ GroupInfo, ...work }) => {
        const { From, To } = GroupInfo

        const isTimeOpen = moment(TimeOpen, 'HH:mm:ss').isAfter(
          moment(moment(From).format('HH:mm:ss'), 'HH:mm:ss')
        )
        const isTimeClose = moment(TimeClose, 'HH:mm:ss').isBefore(
          moment(moment(To).format('HH:mm:ss'), 'HH:mm:ss')
        )

        const FromTime = moment(Date).isAfter(moment(From), 'day')
          ? TimeOpen
          : isTimeOpen
          ? TimeOpen
          : moment(From).format('HH:mm:ss')
        const ToTime = moment(Date).isBefore(moment(To), 'day')
          ? TimeClose
          : isTimeClose
          ? TimeClose
          : moment(To).format('HH:mm:ss')

        //========================

        const TotalTime = moment(TimeClose, 'HH:mm:ss').diff(
          moment(TimeOpen, 'HH:mm:ss'),
          'seconds'
        )

        const TotalFrom = moment(FromTime, 'HH:mm:ss').diff(
          moment(TimeOpen, 'HH:mm:ss'),
          'seconds'
        )
        const TotalFromTo = moment(ToTime, 'HH:mm:ss').diff(
          moment(FromTime, 'HH:mm:ss'),
          'seconds'
        )
        const width = (TotalFromTo / TotalTime) * 100 + '%'
        const left = (TotalFrom / TotalTime) * 100 + '%'

        return {
          ...work,
          GroupInfo: {
            ...GroupInfo
          },
          style: {
            width,
            left,
            top: 0
          }
        }
      })
      setOption(newWorkOff)
    } else {
      setOption(null)
    }
  }, [item, TimeOpen, TimeClose])

  if (!option) return null
  return (
    <Fragment>
      {option &&
        option.map((otp, index) => (
          <div
            className="bg-stripes position-absolute h-100 zindex-2"
            style={{ ...otp.style }}
            key={index}
            onClick={() =>
              onOpenModalHoliday({
                ...otp,
                Member: member
              })
            }
          ></div>
        ))}
    </Fragment>
  )
}

const DayGridRender = ({ item, member, onOpenModalKeep }) => {
  const [HourList, setHourList] = useState([])
  const [isEvent, setIsEvent] = useState(false)

  useEffect(() => {
    if (item.UserWorks && item.UserWorks.length > 0) {
      setHourList(item.UserWorks[0].HourList)
    } else {
      setHourList([])
    }
  }, [item])

  useEffect(() => {
    if (item) {
      setIsEvent(moment().isAfter(item.Date))
    }
  }, [item])

  return (
    <div
      className={clsx('daygrid-day', !isEvent && 'no-event')}
      onClick={() =>
        isEvent &&
        onOpenModalKeep({
          HourList: HourList,
          ...item,
          Member: {
            ID: member.UserID,
            FullName: member.FullName
          }
        })
      }
    >
      {HourList &&
        HourList.map((hour, index) => (
          <div className="event-main" key={index}>
            <div className="event-main__label bg-success">
              {hour.From || '--'}
            </div>
            <div className="event-main__line">
              <i className="fa-regular fa-arrow-right-long"></i>
            </div>
            <div className="event-main__label bg-danger">{hour.To || '--'}</div>
          </div>
        ))}
    </div>
  )
}

function CalendarFull({
  data,
  loading,
  CrDate,
  onOpenModalKeep,
  onOpenModalHoliday
}) {
  const elmScroll = useRef(null)
  const [isScroll, setIsScroll] = useState(false)
  const size = useWindowSize()

  useEffect(() => {
    if (elmScroll.current) {
      const { node } = elmScroll.current
      var WidthParent = node.clientWidth
      var WidthChild = 0
      if (node.childNodes && node.childNodes.length > 0) {
        WidthChild = node.childNodes[0].clientWidth
      }
      setIsScroll(WidthChild > WidthParent)
    }
  }, [elmScroll, data, size])

  return (
    <ScrollSync>
      <div
        className={clsx(
          'd-flex cld-timesheets overlay',
          isScroll && 'in-scroll'
        )}
      >
        <div className="d-flex flex-column cld-timesheets__sidebar">
          <div className="cld-timesheets__sidebar-title bg--member">
            <div className="text-truncate">Danh sách nhân viên</div>
          </div>
          <ScrollSyncPane>
            <div className="cld-timesheets__sidebar-list overflow-scroll flex-grow-1 bg--member">
              {data &&
                data.map((member, index) => (
                  <div className="cld-row" key={index}>
                    <NavLink
                      to={`/bang-cham-cong/${member.UserID}`}
                      className="fw-700 text-name text-decoration-none text-black name text-capitalize w-100"
                    >
                      <div className="text-truncate">{member.FullName}</div>
                    </NavLink>
                  </div>
                ))}
            </div>
          </ScrollSyncPane>
        </div>
        <div className="flex-1 h-100 overflow-auto d-flex flex-column cld-timesheets__body">
          <ScrollSyncPane>
            <div className="d-flex cld-timesheets__body-title">
              <div className="d-flex timesheet-width-row">
                {Array(7)
                  .fill()
                  .map((o, index) => (
                    <div
                      key={index}
                      className={clsx(
                        'cls-col',
                        moment().format('DD-MM-YYYY') ===
                          moment(CrDate)
                            .clone()
                            .weekday(index)
                            .format('DD-MM-YYYY') && 'current-day'
                      )}
                    >
                      <div className="date">
                        <span className="text-capitalize">
                          {moment(CrDate).clone().weekday(index).format('dddd')}
                        </span>
                        , Ngày
                        <span className="pl-3px">
                          {moment(CrDate)
                            .clone()
                            .weekday(index)
                            .format('DD/MM')}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </ScrollSyncPane>
          <ScrollSyncPane ref={elmScroll}>
            <div className="overflow-scroll flex-grow-1 position-relative">
              {data &&
                data.map((member, idx) => (
                  <div className="cld-row timesheet-width-row" key={idx}>
                    {member.Dates &&
                      member.Dates.map((item, index) => (
                        <div
                          className={clsx(
                            'cls-col',
                            moment(item.Date).format('DD-MM-YYYY') ===
                              moment().format('DD-MM-YYYY') && 'current-day'
                          )}
                          key={index}
                        >
                          <DayGridRender
                            item={item}
                            member={member}
                            onOpenModalKeep={onOpenModalKeep}
                          />
                          <HolidaycheduleLine
                            item={item}
                            member={member}
                            onOpenModalHoliday={onOpenModalHoliday}
                          />
                        </div>
                      ))}
                  </div>
                ))}
            </div>
          </ScrollSyncPane>
        </div>
        <div
          className={clsx(
            'overlay-layer bg-dark-o-10 top-0 zindex-1001 top-20px',
            loading && 'overlay-block'
          )}
        >
          <div className="spinner spinner-primary"></div>
        </div>
      </div>
    </ScrollSync>
  )
}

export default CalendarFull
