import React, { useState } from 'react'
import { Tab } from 'react-bootstrap'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import Booking from './Booking'
import Confirm from './Confirm'
import '../../_assets/sass/pages/_home.scss'
import bookingApi from 'src/api/booking.api'

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

const initialValue = {
  AtHome: false,
  MemberID: window.top?.Member?.ID || '',
  RootIdS: '',
  BookDate: '',
  Desc: '',
  StockID:
    window?.GlobalConfig?.StocksNotBook &&
    window.top?.MemberSelectStockID &&
    window?.GlobalConfig?.StocksNotBook.includes(
      window.top?.MemberSelectStockID
    )
      ? ''
      : window.top?.MemberSelectStockID || '',
  FullName: window.top?.Member?.FullName || '',
  Phone: window.top?.Member?.MobilePhone || '',
  UserServiceIDs: ''
}

const BookingSchema = Yup.object().shape({
  StockID: Yup.string().required('Vui lòng chọn cơ sở.'),
  BookDate: Yup.string().required('Chọn ngày đặt lịch.'),
  Phone: Yup.string().required('Nhập số điện thoại.'),
  FullName: Yup.string().required('Nhập họ tên.'),
  RootIdS: Yup.array().required('Chọn dịch vụ.')
})

export default function Home() {
  const [key, setKey] = useState('booking')
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [initialValues] = useState(initialValue)
  const [BookSet, setBookSet] = useState()

  const onSubmit = (values, { resetForm }) => {
    setLoadingBtn(true)
    const itemBooking = {
      ...values
    }
    if (itemBooking.ID) {
      delete itemBooking.ID
    }
    const newValues = {
      booking: [
        {
          ...itemBooking,
          BookDate: itemBooking.BookDate
            ? moment(itemBooking.BookDate).format('YYYY-MM-DD HH:mm')
            : '',
          RootIdS: itemBooking.RootIdS ? itemBooking.RootIdS.join(',') : '',
          UserServiceIDs: itemBooking.UserServiceIDs
            ? itemBooking.UserServiceIDs.value
            : ''
        }
      ]
    }
    if (values.ID) {
      newValues.deletes = [
        {
          ID: values.ID
        }
      ]
    }
    bookingApi
      .postBooking(newValues)
      .then(response => {
        if (values.ID) {
          setLoadingBtn(false)
          resetForm()
          window.top?.toastr &&
            window.top?.toastr.success('Thay đổi lịch thành công!', {
              timeOut: 2500
            })
        } else {
          setLoadingBtn(false)
          resetForm()
          window.top?.toastr &&
            window.top?.toastr.success('Đặt lịch thành công!', {
              timeOut: 2500
            })
        }
        window.top?.onRefreshListBook && window.top?.onRefreshListBook()
        window.top?.onHideBooking && window.top.onHideBooking()
      })
      .catch(error => console.log(error))
  }

  const nextStep = setErrors => {
    setKey('confirm')
    setErrors && setErrors({})
  }

  const prevStep = () => {
    setKey('booking')
  }

  return (
    <div className="h-100 overflow-hidden position-relative tab-book">
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize={true}
        validationSchema={BookingSchema}
      >
        {formikProps => {
          // errors, touched, handleChange, handleBlur
          const { values } = formikProps
          window.top.handleReset = () => {
            setKey('booking')
            setBookSet('')
            formikProps.resetForm()
            window.IframeTabs && window.IframeTabs()
          }

          window.top.setFieldValue = ServiceID => {
            formikProps.setFieldValue('RootIdS', [ServiceID])
          }

          window.top.setInitialValue = obj => {
            formikProps.setFieldValue('ID', obj.ID)
            formikProps.setFieldValue('AtHome', obj.AtHome)
            formikProps.setFieldValue('MemberID', obj.MemberID)
            formikProps.setFieldValue('RootIdS', obj.RootIdS)
            formikProps.setFieldValue('BookDate', obj.BookDate)
            formikProps.setFieldValue('Desc', obj.Desc)
            formikProps.setFieldValue('StockID', obj.StockID)
            formikProps.setFieldValue('MobilePhone', obj.MobilePhone)
            formikProps.setFieldValue('FullName', obj.FullName)
            formikProps.setFieldValue('UserServiceIDs', obj.UserServiceIDs)
            setBookSet(obj.BookDate)
          }
          return (
            <Form className="h-100">
              <Tab.Container className="h-100" activeKey={key}>
                <Tab.Pane
                  className="h-100 tab-book__content tab-booking"
                  eventKey="booking"
                >
                  {/* <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      formikProps.setFieldValue(
                        'BookDate',
                        '2022-12-21T13:15:00'
                      )
                      setBookSet('2022-12-21T13:15:00')
                    }}
                  >
                    Click
                  </button> */}
                  <Booking
                    formikProps={formikProps}
                    nextStep={nextStep}
                    BookSet={{ value: BookSet, set: setBookSet }}
                  />
                </Tab.Pane>
                <Tab.Pane
                  className="h-100 tab-book__content tab-confirm"
                  eventKey="confirm"
                >
                  <Confirm
                    formikProps={formikProps}
                    prevStep={prevStep}
                    onSubmit={onSubmit}
                    loadingBtn={loadingBtn}
                  />
                </Tab.Pane>
              </Tab.Container>
            </Form>
          )
        }}
      </Formik>
    </div>
  )
}
