import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import moment from 'moment'

function PickerTimekeeping({ children, data }) {
  const [visible, setVisible] = useState(false)
  let [Days, setDays] = useState({
    NGAY_THUONG: [],
    NGAY_NGHI: [],
    NT_DI_MUON_11_30: [],
    NT_VE_SOM_16_30: [],
    NT_11_30_16_30: [],
    NN_DI_MUON_11_30: [],
    NN_VE_SOM_16_30: [],
    NN_11_30_16_30: []
  })
  useEffect(() => {
    if (data && data.length > 0) {
      let offs = data.filter(x => !x.WorkTrack?.CheckIn)
      let ons = data.filter(x => x.WorkTrack?.CheckIn)
      let NGAY_THUONG = offs.filter(
        x =>
          moment(x.Date, 'YYYY-MM-DD').format('ddd') !== 'T7' &&
          moment(x.Date, 'YYYY-MM-DD').format('ddd') !== 'CN'
      )
      let NGAY_NGHI = offs.filter(
        x =>
          moment(x.Date, 'YYYY-MM-DD').format('ddd') === 'T7' ||
          moment(x.Date, 'YYYY-MM-DD').format('ddd') === 'CN'
      )
      let NT_DI_MUON_11_30 = ons.filter(
        x =>
          moment(x.Date, 'YYYY-MM-DD').format('ddd') !== 'T7' &&
          moment(x.Date, 'YYYY-MM-DD').format('ddd') !== 'CN' &&
          moment(
            moment(x.WorkTrack?.CheckIn, 'YYYY-MM-DD HH:mm').set({
              hour: '11',
              minute: '30'
            })
          ).isSameOrBefore(
            moment(x.WorkTrack?.CheckIn, 'YYYY-MM-DD HH:mm'),
            'minutes'
          )
      )
      let NT_VE_SOM_16_30 = ons.filter(
        x =>
          moment(x.Date, 'YYYY-MM-DD').format('ddd') !== 'T7' &&
          moment(x.Date, 'YYYY-MM-DD').format('ddd') !== 'CN' &&
          moment(
            moment(x.WorkTrack?.CheckOut, 'YYYY-MM-DD HH:mm').set({
              hour: '16',
              minute: '30'
            })
          ).isSameOrAfter(
            moment(x.WorkTrack?.CheckOut, 'YYYY-MM-DD HH:mm'),
            'minutes'
          )
      )
      let NT_11_30_16_30 = ons.filter(
        x =>
          moment(x.Date, 'YYYY-MM-DD').format('ddd') !== 'T7' &&
          moment(x.Date, 'YYYY-MM-DD').format('ddd') !== 'CN' &&
          moment(
            moment(x.WorkTrack?.CheckOut, 'YYYY-MM-DD HH:mm').set({
              hour: '16',
              minute: '30'
            })
          ).isSameOrAfter(
            moment(x.WorkTrack?.CheckOut, 'YYYY-MM-DD HH:mm'),
            'minutes'
          ) &&
          moment(
            moment(x.WorkTrack?.CheckIn, 'YYYY-MM-DD HH:mm').set({
              hour: '11',
              minute: '30'
            })
          ).isSameOrBefore(
            moment(x.WorkTrack?.CheckIn, 'YYYY-MM-DD HH:mm'),
            'minutes'
          )
      )
      let NN_DI_MUON_11_30 = ons.filter(
        x =>
          (moment(x.Date, 'YYYY-MM-DD').format('ddd') === 'T7' ||
            moment(x.Date, 'YYYY-MM-DD').format('ddd') === 'CN') &&
          moment(
            moment(x.WorkTrack?.CheckIn, 'YYYY-MM-DD HH:mm').set({
              hour: '11',
              minute: '30'
            })
          ).isSameOrBefore(
            moment(x.WorkTrack?.CheckIn, 'YYYY-MM-DD HH:mm'),
            'minutes'
          )
      )
      let NN_VE_SOM_16_30 = ons.filter(
        x =>
          (moment(x.Date, 'YYYY-MM-DD').format('ddd') === 'T7' ||
            moment(x.Date, 'YYYY-MM-DD').format('ddd') === 'CN') &&
          moment(
            moment(x.WorkTrack?.CheckOut, 'YYYY-MM-DD HH:mm').set({
              hour: '16',
              minute: '30'
            })
          ).isSameOrAfter(
            moment(x.WorkTrack?.CheckOut, 'YYYY-MM-DD HH:mm'),
            'minutes'
          )
      )
      let NN_11_30_16_30 = ons.filter(
        x =>
          (moment(x.Date, 'YYYY-MM-DD').format('ddd') === 'T7' ||
            moment(x.Date, 'YYYY-MM-DD').format('ddd') === 'CN') &&
          moment(
            moment(x.WorkTrack?.CheckOut, 'YYYY-MM-DD HH:mm').set({
              hour: '16',
              minute: '30'
            })
          ).isSameOrAfter(
            moment(x.WorkTrack?.CheckOut, 'YYYY-MM-DD HH:mm'),
            'minutes'
          ) &&
          moment(
            moment(x.WorkTrack?.CheckIn, 'YYYY-MM-DD HH:mm').set({
              hour: '11',
              minute: '30'
            })
          ).isSameOrBefore(
            moment(x.WorkTrack?.CheckIn, 'YYYY-MM-DD HH:mm'),
            'minutes'
          )
      )
      setDays({
        NGAY_THUONG,
        NGAY_NGHI,
        NT_DI_MUON_11_30,
        NT_VE_SOM_16_30,
        NT_11_30_16_30,
        NN_DI_MUON_11_30,
        NN_VE_SOM_16_30,
        NN_11_30_16_30
      })
    }
  }, [data])
  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false)
      })}
      {createPortal(
        <Modal show={visible} onHide={() => setVisible(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Chi tiết chấm công</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="p-3">
              <div className='mb-3'>
                <div className="font-bold text-[15px] mb-1">Lịch nghỉ</div>
                <div className='mb-1'>
                  Nghỉ ngày thường : {Days.NGAY_THUONG.length}{' '}
                  {Days.NGAY_THUONG.length > 0 && (
                    <>
                      (
                      {Days.NGAY_THUONG.map(x =>
                        moment(x.Date, 'YYYY-MM-DD').format('DD-MM')
                      ).join(', ')}
                      )
                    </>
                  )}
                </div>
                <div>
                  Nghỉ T7, CN : {Days.NGAY_NGHI.length}{' '}
                  {Days.NGAY_NGHI.length > 0 && (
                    <>
                      (
                      {Days.NGAY_NGHI.map(x =>
                        moment(x.Date, 'YYYY-MM-DD').format('DD-MM')
                      ).join(', ')}
                      )
                    </>
                  )}
                </div>
              </div>
              <div className='mb-3'>
                <div className="font-bold text-[15px] mb-1">Ngày thường</div>
                <div className='mb-1'>
                  Đi muộn hơn 11h30 : {Days.NT_DI_MUON_11_30.length}{' '}
                  {Days.NT_DI_MUON_11_30.length > 0 && (
                    <>
                      (
                      {Days.NT_DI_MUON_11_30.map(
                        x =>
                          `${moment(x?.WorkTrack?.CheckIn, 'YYYY-MM-DD').format(
                            'DD-MM'
                          )} [${moment(
                            x?.WorkTrack?.CheckIn,
                            'YYYY-MM-DD HH:mm'
                          ).format('HH:mm')}]`
                      ).join(', ')}
                      )
                    </>
                  )}
                </div>
                <div className='mb-1'>
                  Về sớm hơn 16h30 : {Days.NT_VE_SOM_16_30.length}{' '}
                  {Days.NT_VE_SOM_16_30.length > 0 && (
                    <>
                      (
                      {Days.NT_VE_SOM_16_30.map(
                        x =>
                          `${moment(x?.WorkTrack?.CheckIn, 'YYYY-MM-DD').format(
                            'DD-MM'
                          )} [${moment(
                            x?.WorkTrack?.CheckIn,
                            'YYYY-MM-DD HH:mm'
                          ).format('HH:mm')}]`
                      ).join(', ')}
                      )
                    </>
                  )}
                </div>
                <div>
                  Đi muộn hơn 11h30 và về sớm hơn 16h30 :{' '}
                  {Days.NT_11_30_16_30.length}{' '}
                  {Days.NT_11_30_16_30.length > 0 && (
                    <>
                      (
                      {Days.NT_11_30_16_30.map(
                        x =>
                          `${moment(x?.WorkTrack?.CheckIn, 'YYYY-MM-DD').format(
                            'DD-MM'
                          )} [${moment(
                            x?.WorkTrack?.CheckIn,
                            'YYYY-MM-DD HH:mm'
                          ).format('HH:mm')} - ${moment(
                            x?.WorkTrack?.CheckOut,
                            'YYYY-MM-DD HH:mm'
                          ).format('HH:mm')}]`
                      ).join(', ')}
                      )
                    </>
                  )}
                </div>
              </div>
              <div>
                <div className="font-bold text-[15px] mb-1">Thứ 7, Chủ nhật</div>
                <div className='mb-1'>
                  Đi muộn hơn 11h30 : {Days.NN_DI_MUON_11_30.length}{' '}
                  {Days.NN_DI_MUON_11_30.length > 0 && (
                    <>
                      (
                      {Days.NN_DI_MUON_11_30.map(
                        x =>
                          `${moment(x?.WorkTrack?.CheckIn, 'YYYY-MM-DD').format(
                            'DD-MM'
                          )} [${moment(
                            x?.WorkTrack?.CheckIn,
                            'YYYY-MM-DD HH:mm'
                          ).format('HH:mm')}]`
                      ).join(', ')}
                      )
                    </>
                  )}
                </div>
                <div className='mb-1'>
                  Về sớm hơn 16h30 : {Days.NN_VE_SOM_16_30.length}{' '}
                  {Days.NN_VE_SOM_16_30.length > 0 && (
                    <>
                      (
                      {Days.NN_VE_SOM_16_30.map(
                        x =>
                          `${moment(x?.WorkTrack?.CheckIn, 'YYYY-MM-DD').format(
                            'DD-MM'
                          )} [${moment(
                            x?.WorkTrack?.CheckIn,
                            'YYYY-MM-DD HH:mm'
                          ).format('HH:mm')}]`
                      ).join(', ')}
                      )
                    </>
                  )}
                </div>
                <div>
                  Đi muộn hơn 11h30 và về sớm hơn 16h30 :{' '}
                  {Days.NN_11_30_16_30.length}{' '}
                  {Days.NN_11_30_16_30.length > 0 && (
                    <>
                      (
                      {Days.NN_11_30_16_30.map(
                        x =>
                          `${moment(x?.WorkTrack?.CheckIn, 'YYYY-MM-DD').format(
                            'DD-MM'
                          )} [${moment(
                            x?.WorkTrack?.CheckIn,
                            'YYYY-MM-DD HH:mm'
                          ).format('HH:mm')} - ${moment(
                            x?.WorkTrack?.CheckOut,
                            'YYYY-MM-DD HH:mm'
                          ).format('HH:mm')}]`
                      ).join(', ')}
                      )
                    </>
                  )}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setVisible(false)}>
              Đóng
            </Button>
          </Modal.Footer>
        </Modal>,
        document.body
      )}
    </>
  )
}

export default PickerTimekeeping
