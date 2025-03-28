import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Nav, Tab } from 'react-bootstrap'
import DatePicker from 'react-datepicker'
import Carousel from 'nuka-carousel'
import { clsx } from 'clsx'

import moment from 'moment'
import 'moment/locale/vi'
import bookingApi from 'src/api/booking.api'
import { useTranslation } from 'react-i18next'
moment.locale('vi')

DateTime.propTypes = {
  formikProps: PropTypes.object
}

const GroupByCount = (List, Count) => {
  return List.reduce((acc, x, i) => {
    const idx = Math.floor(i / Count)
    acc[idx] = [...(acc[idx] || []), x]
    return acc
  }, [])
}

const formatTimeOpenClose = ({ Text, InitialTime, Date }) => {
  let Times = { ...InitialTime }

  let CommonTime = Array.from(Text.matchAll(/\[([^\][]*)]/g), x => x[1])

  if (CommonTime && CommonTime.length > 0) {
    let CommonTimeJs = CommonTime[0].split(';')
    Times.TimeOpen = CommonTimeJs[0]
    Times.TimeClose = CommonTimeJs[1]
  }

  let PrivateTime = Array.from(Text.matchAll(/{+([^}]+)}+/g), x => x[1])
  PrivateTime = PrivateTime.filter(x => x.split(';').length > 2).map(x => ({
    DayName: x.split(';')[0],
    TimeOpen: x.split(';')[1],
    TimeClose: x.split(';')[2]
  }))
  if (Date) {
    let index = PrivateTime.findIndex(
      x => x.DayName === moment(Date, 'DD/MM/YYYY').format('ddd')
    )

    if (index > -1) {
      Times.TimeOpen = PrivateTime[index].TimeOpen
      Times.TimeClose = PrivateTime[index].TimeClose
    }
  }

  return Times
}

function DateTime({ formikProps, BookSet, ListStocks }) {
  const { t } = useTranslation()

  const [key, setKey] = useState('tab-0')
  const [ListChoose, setListChoose] = useState([])
  const [DateChoose, setDateChoose] = useState()
  const [ListLock, setListLock] = useState([])
  const { values, touched, errors, setFieldValue, setErrors } = formikProps

  useEffect(() => {
    getListDisable()
  }, [ListStocks, key])

  useEffect(() => {
    if (BookSet?.value) {
      if (
        moment(BookSet?.value).format('DD-MM-YYYY') ===
        moment().format('DD-MM-YYYY')
      ) {
        setKey('tab-0')
        setDateChoose('')
      } else if (
        moment(BookSet?.value).format('DD-MM-YYYY') ===
        moment().add(1, 'days').format('DD-MM-YYYY')
      ) {
        setKey('tab-1')
        setDateChoose('')
      } else {
        setKey('tab-2')
        setDateChoose(moment(BookSet?.value).toDate())
      }
    } else {
      setDateChoose('')
      getListChoose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [BookSet?.value])

  useEffect(() => {
    getListChoose(DateChoose)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DateChoose, ListLock, values.StockID])

  useEffect(() => {
    if (DateChoose && !BookSet?.value) {
      setFieldValue('BookDate', '', false)
      setErrors({})
      setKey('tab-2')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DateChoose, BookSet?.value])

  window.IframeTabs = () => {
    setDateChoose('')
    setKey('tab-0')
  }

  const getListDisable = () => {
    bookingApi
      .getConfigName('giocam')
      .then(({ data }) => {
        if (data && data.data && data?.data.length > 0) {
          const result = JSON.parse(data.data[0].Value)
          setListLock(result)
        }
      })
      .catch(error => console.log(error))
  }
  const getListChoose = DateChoose => {
    const { TimeNext } = window?.top?.GlobalConfig?.APP?.Booking

    let TimeOpen = window?.top?.GlobalConfig?.APP?.Booking?.TimeOpen
      ? { ...window?.top?.GlobalConfig?.APP?.Booking?.TimeOpen }
      : ''
    let TimeClose = window?.top?.GlobalConfig?.APP?.Booking?.TimeClose
      ? { ...window?.top?.GlobalConfig?.APP?.Booking?.TimeClose }
      : ''

    //
    let indexCr = ListStocks
      ? ListStocks.findIndex(x => Number(x.ID) === Number(values.StockID))
      : -1

    if (indexCr > -1) {
      let StockI = ListStocks[indexCr].KeySEO
      if (StockI) {
        let bookDate = moment().format('DD/MM/YYYY')
        if (key === 'tab-1') {
          bookDate = moment().add(1, 'day').format('DD/MM/YYYY')
        }
        if (DateChoose) {
          bookDate = moment(DateChoose).format('DD/MM/YYYY')
        }
        let TimesObj = formatTimeOpenClose({
          Text: StockI,
          InitialTime: {
            TimeOpen: TimeOpen
              ? moment().set(TimeOpen).format('HH:mm:ss')
              : '06:00:00',
            TimeClose: TimeClose
              ? moment().set(TimeClose).format('HH:mm:ss')
              : '18:00:00'
          },
          Date: bookDate
        })
        TimeOpen.hour = TimesObj.TimeOpen.split(':')[0]
        TimeOpen.minute = TimesObj.TimeOpen.split(':')[1]
        TimeClose.hour = TimesObj.TimeClose.split(':')[0]
        TimeClose.minute = TimesObj.TimeClose.split(':')[1]
      } else {
        TimeOpen = window?.top?.GlobalConfig?.APP?.Booking?.TimeOpen
        TimeClose = window?.top?.GlobalConfig?.APP?.Booking?.TimeClose
      }
    }

    //
    const newListChoose = []
    let ListDisable = []
    if (ListLock && ListLock.length > 0) {
      const indexLock = ListLock.findIndex(
        item => Number(item.StockID) === Number(values.StockID)
      )

      if (indexLock > -1) {
        ListDisable = ListLock[indexLock].ListDisable
      }
    }
    for (let index = 0; index < 3; index++) {
      let day = moment().add(index, 'days').toDate()
      if (DateChoose && index === 2) {
        day = DateChoose
      }
      let startDate = moment(day).set(TimeOpen)
      let closeDate = moment(day)
        .set(TimeClose)
        .subtract(
          window?.top?.GlobalConfig?.APP?.ScheduledMinutes || 0,
          'minutes'
        )
      var duration = moment.duration(closeDate.diff(startDate))
      var MinutesTotal = duration.asMinutes()
      let newListTime = []
      for (let minute = 0; minute <= MinutesTotal; minute += TimeNext) {
        const datetime = moment(startDate).add(minute, 'minute').toDate()
        let isDayOff = false
        if (ListDisable && ListDisable.length > 0) {
          const indexDayOf = ListDisable.findIndex(
            x =>
              moment(x.Date, 'DD/MM/YYYY').format('DD/MM/YYYY') ===
              moment(datetime).format('DD/MM/YYYY')
          )
          if (indexDayOf > -1) {
            if (
              ListDisable[indexDayOf].TimeClose &&
              ListDisable[indexDayOf].TimeClose.length > 0
            ) {
              isDayOff = ListDisable[indexDayOf].TimeClose.some(time => {
                const DateStartDayOf = moment(
                  ListDisable[indexDayOf].Date + time.Start,
                  'DD/MM/YYYY HH:mm'
                )
                const DateEndDayOf = moment(
                  ListDisable[indexDayOf].Date + time.End,
                  'DD/MM/YYYY HH:mm'
                )
                let isStart =
                  moment(datetime, 'HH:mm').isSameOrAfter(
                    moment(DateStartDayOf, 'HH:mm')
                  ) ||
                  moment(datetime).format('HH:mm') ===
                    moment(DateStartDayOf).format('HH:mm')
                let isEnd =
                  moment(datetime, 'HH:mm').isSameOrBefore(
                    moment(DateEndDayOf, 'HH:mm')
                  ) ||
                  moment(datetime).format('HH:mm') ===
                    moment(DateEndDayOf).format('HH:mm')
                return isStart && isEnd
              })
            } else {
              isDayOff = true
            }
          }
        }
        newListTime.push({
          Time: datetime,
          Disable:
            moment()
              .add(
                window?.top?.GlobalConfig?.APP?.ScheduledMinutes || 0,
                'minutes'
              )
              .diff(datetime, 'minutes') > 0 || isDayOff
        })
      }

      const TotalDisable = newListTime.filter(o => o.Disable)
      const slideIndex =
        TotalDisable.length > 0 ? Math.floor((TotalDisable.length - 1) / 4) : 0

      let newObj = {
        day: day,
        children: newListTime,
        childrenGroup: GroupByCount(newListTime, 4),
        slideIndex: slideIndex
      }
      newListChoose.push(newObj)
    }
    setListChoose(newListChoose)
  }

  const settings = {
    wrapAround: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    slideIndex: 0,
    cellSpacing: 10,
    renderBottomCenterControls: () => false,
    renderCenterLeftControls: null,
    renderCenterRightControls: ({ nextDisabled, nextSlide }) => (
      <div
        className={`support-scroll && ${nextDisabled ? 'd-none' : ''}`}
        onClick={nextSlide}
      >
        <div className="support-scroll__text">
          {t('booking.CHON_KHUNG_GIO_KHAC')} {nextDisabled}
        </div>
        <div className="support-scroll__icon">
          <div className="line"></div>
          <div className="arrow">
            <i className="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
    )
    // afterChange: current => {},
    // beforeChange: (current, next) => {}
  }

  return (
    <div className="bg-white mt-1px pt-15px pl-15px pr-15px pb-10px date-time">
      <div className="fw-700 text-uppercase mb-10px">{(t('booking.CHON_THOI_GIAN'))}</div>
      <Tab.Container activeKey={key}>
        <div className="border-bottom pb-15px mb-15px">
          <div className="p-0 container-fluid">
            <Nav
              as="ul"
              className="row mx--6px"
              onSelect={_key => {
                setFieldValue('BookDate', '', false)
                setErrors({})
                BookSet.set('')
                setDateChoose('')
                setKey(_key)
              }}
            >
              {ListChoose &&
                ListChoose.map((item, index) => (
                  <Nav.Item className="col-4 px-5px" as="li" key={index}>
                    {index === ListChoose.length - 1 ? (
                      <div className="position-relative">
                        <DatePicker
                          onChange={date => {
                            setFieldValue('BookDate', '', false)
                            setErrors({})
                            setDateChoose(date)
                          }}
                          selected={DateChoose}
                          placeholderText={t('booking.CHON_KHUNG_GIO_KHAC')}
                          className={clsx(
                            'form-control min-h-38px min-h-md-auto',
                            DateChoose && 'border-ezs text-ezs'
                          )}
                          dateFormat="dd/MM/yyyy"
                          //isClearable={DateChoose}
                        />
                      </div>
                    ) : (
                      <Nav.Link
                        className="text-center py-9px fw-500 date-time-navlink"
                        eventKey={`tab-${index}`}
                      >
                        {moment(item.day).calendar({
                          sameDay: now =>
                            `[${t('booking.HOM_NAY')}] ${moment(item.day).format('DD/MM')}`,
                          nextDay: now =>
                            `[${t('booking.NGAY_MAI')}] ${moment(item.day).format('DD/MM')}`
                        })}
                      </Nav.Link>
                    )}
                  </Nav.Item>
                ))}
            </Nav>
          </div>
        </div>
        {!window?.top?.GlobalConfig?.APP?.Booking?.hideNoteTime && (
          <div className="d-flex justify-content-between mb-15px">
            <div className="d-flex align-items-center">
              <div className="border rounded-sm box w-45px h-25px bg-stripes"></div>
              <span className="fw-500 pl-8px note-text">{t('booking.HET_CHO')}</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="bg-white border rounded-sm box w-45px h-25px"></div>
              <span className="fw-500 pl-8px note-text">{t('booking.CON_CHO')}</span>
            </div>
            <div className="d-flex align-items-center">
              <div className="border rounded-sm box w-45px h-25px bg-ezs border-ezs"></div>
              <span className="fw-500 pl-8px note-text">{t('booking.DANG_CHON')}</span>
            </div>
          </div>
        )}
        <Tab.Content>
          {ListChoose &&
            ListChoose.map((item, index) => (
              <Tab.Pane eventKey={`tab-${index}`} key={index}>
                <div className="mx--5px">
                  <Carousel {...{ ...settings, slideIndex: item.slideIndex }}>
                    {item.childrenGroup &&
                      item.childrenGroup.map((group, groupIndex) => (
                        <div key={groupIndex}>
                          {group &&
                            group.map((time, timeIndex) => (
                              <div
                                className="font-number mb-10px date-time-radio position-relative"
                                key={timeIndex}
                              >
                                <div
                                  className={clsx(
                                    'h-40px border rounded-sm d-flex align-items-center justify-content-center fw-600 time',
                                    time.Disable && 'disabled bg-stripes',
                                    moment(values.BookDate).diff(
                                      time.Time,
                                      'minutes'
                                    ) === 0 && 'active',
                                    !time.Disable &&
                                      errors.BookDate &&
                                      touched.BookDate &&
                                      'border-danger'
                                  )}
                                  onClick={() =>
                                    !time.Disable &&
                                    setFieldValue('BookDate', time.Time)
                                  }
                                >
                                  {moment(time.Time).format('HH:mm A')}
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                  </Carousel>
                </div>
              </Tab.Pane>
            ))}
        </Tab.Content>
      </Tab.Container>
      {!window?.top?.GlobalConfig?.APP?.Booking?.hideNoteWarning && (
        <div className="text-danger font-size-sm mt-8px">
          (*) {t('booking.NOTE_KHUNG_GIO')}
        </div>
      )}
    </div>
  )
}

export default DateTime
