import axios from 'axios'
import React, { useState } from 'react'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'
import ModalGift from './ModalGift'
import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

function HomeGoogleSheet(props) {
  const [onPending, setOnPending] = useState(false)
  const [finalDeg, setFinalDeg] = useState(0)
  const [gift, setGift] = useState(null)
  const [isGift, setIsGift] = useState(false)
  const [btnLoading, setBtnLoading] = useState(false)

  const data = [
    {
      option: 'Tắm trắng',
      chance: 0.25,
      values: 'ADFG'
    },
    {
      option: 'Rất tiếc',
      chance: 0.25,
      values: ''
    },
    {
      option: 'Giảm béo',
      chance: 0,
      values: 'ADFG'
    },
    {
      option: 'Rất tiếc',
      chance: 0,
      values: ''
    },
    {
      option: 'Tắm trắng',
      chance: 0.25,
      values: 'ADFG'
    },
    {
      option: 'Rất tiếc',
      chance: 0.25,
      values: ''
    },
    {
      option: 'Giảm béo',
      chance: 0,
      values: 'ADFG'
    },
    {
      option: 'Rất tiếc',
      chance: 0,
      values: ''
    }
  ]

  // const data = [
  //   {
  //     option: 'Vàng ngẫu nghiên',
  //     chance: 0.5,
  //   },
  //   {
  //     option: '50 Triệu vàng',
  //     chance: 0.5,
  //   },
  //   {
  //     option: '100 Triệu vàng',
  //     chance: 0,
  //   },
  //   {
  //     option: '200 Triệu vàng',
  //     chance: 0,
  //   },
  //   {
  //     option: '300 Triệu vàng',
  //     chance: 0,
  //   },
  //   {
  //     option: '500 triệu vàng',
  //     chance: 0,
  //   },
  //   {
  //     option: 'Vàng bí ẩn',
  //     chance: 0,
  //   },
  //   {
  //     option: 'X99 thỏi vàng',
  //     chance: 0,
  //   }
  // ]

  // const data = [
  //   {
  //     option: '1000 Xu',
  //     chance: 0.5
  //   },
  //   {
  //     option: '2 Gói',
  //     chance: 0.5
  //   },
  //   {
  //     option: '100 Xu',
  //     chance: 0
  //   },
  //   {
  //     option: '500 Xu',
  //     chance: 0
  //   },
  //   {
  //     option: '2000 Xu',
  //     chance: 0
  //   },
  //   {
  //     option: '3 Gói',
  //     chance: 0
  //   }
  // ]
  const clickMp3 = new Audio(AssetsHelpers.toAbsoluteUrl('/mp3/tick.mp3'))
  const filmingMp3 = new Audio(AssetsHelpers.toAbsoluteUrl('/mp3/dangquay.mp3')) // Nhạc quay
  const clapMp3 = new Audio(AssetsHelpers.toAbsoluteUrl('/mp3/votay.mp3')) // Nhạc Vỗ tay
  const lostMp3 = new Audio(AssetsHelpers.toAbsoluteUrl('/mp3/matluot.mp3')) // Nhạc Mất lượt

  const getRandom = array => {
    var rnd = Math.floor(Math.random() * 100)
    var counter = 0
    for (let i = 0; i < array.length; i++) {
      counter += array[i].chance * 100
      if (counter > rnd) {
        return i
      }
    }
  }

  const onClickSpin = () => {
    if (onPending) return
    clickMp3.play()
    filmingMp3.play()
    setOnPending(true)
    const slicesCount = data.length
    const sliceDeg = 360 / slicesCount
    const index = getRandom(data)
    const stillDeg = finalDeg % 360
    const resultDeg = 360 * 8 + index * -sliceDeg - stillDeg + finalDeg
    setFinalDeg(resultDeg)

    setTimeout(() => {
      if (data[index].values) {
        clapMp3.play()
        setOnPending(false)
        setGift(data[index])
        setIsGift(true)
      } else {
        lostMp3.play()
        setOnPending(false)
      }
    }, 6000)
    //console.log(data[index])
    //if (onPending) return
    // clickMp3.play()
    // filmingMp3.play()
    // setOnFinish(false)
    // setOnPending(true)
    // const slicesCount = data.length
    // const sliceDeg = 360 / slicesCount
    // const min = finalDeg + 500
    // const max = finalDeg + 1500
    // const resultDeg = Math.floor(Math.random() * (max - min + 1)) + min

    // let index = Math.floor(((360 - resultDeg + 30) % 360) / sliceDeg)
    // index = (slicesCount + index) % slicesCount
    // setFinalDeg(resultDeg)
    // setTimeout(() => {
    //   clapMp3.play()
    //   setOnFinish(true)
    //   setOnPending(false)
    //   setGift(data[index])
    //   setIsGift(true)
    // }, 5000)
  }

  const onHide = () => {
    setIsGift(false)
    setGift(null)
  }

  const onSubmit = values => {
    setBtnLoading(true)
    const objSubmit = {
      ...values,
      Option: gift.option,
      CreateDate: moment().format('HH:mm DD-MM-YYYY')
    }
    axios
      .post(
        'https://sheet.best/api/sheets/8a9b8266-7b0e-4466-aa7f-6073b44188ce',
        objSubmit
      )
      .then(response => {
        setBtnLoading(false)
        onHide()
      })
  }

  return (
    <div
      className="wheel"
      style={{
        backgroundImage: `url(${AssetsHelpers.toAbsoluteUrl(
          '/images/wheel/bg.jpg'
        )})`
      }}
    >
      {gift && (
        <div className="pyro">
          <div className="before"></div>
          <div className="after"></div>
        </div>
      )}

      <div className="wheel-container">
        <div className="title text-center max-w-400px m-auto">
          <img
            className="w-100"
            src={AssetsHelpers.toAbsoluteUrl('/images/wheel/title.png')}
            alt=""
          />
        </div>
        <div className="wheel-rotate">
          <img
            className="w-100"
            src={AssetsHelpers.toAbsoluteUrl('/images/wheel/xoay-4.png')}
            alt=""
            style={{
              transform: `rotate(${finalDeg}deg)`,
              transition: 'transform 6s ease 0s'
            }}
          />
          {/* <img
            className="w-100"
            src={AssetsHelpers.toAbsoluteUrl('/images/wheel/xoay-2.png')}
            alt=""
            style={{
              transform: `rotate(${finalDeg}deg)`,
              transition: 'transform 6s ease 0s'
            }}
          /> */}
          <button onClick={onClickSpin}>
            <img
              className="w-100"
              src={AssetsHelpers.toAbsoluteUrl('/images/wheel/button.png')}
              alt=""
            />
          </button>
        </div>
      </div>

      <ModalGift
        show={isGift}
        gift={gift}
        onHide={onHide}
        onSubmit={onSubmit}
        btnLoading={btnLoading}
      />
    </div>
  )
}

export default HomeGoogleSheet
