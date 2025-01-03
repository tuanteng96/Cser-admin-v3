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
import { useTranslation } from 'react-i18next'
moment.locale('vi')

export default function Home() {
  const { t } = useTranslation()

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
    UserServiceIDs: '',
    AmountPeople: {
      value: 1,
      label: '1 ' + t('booking.KHACH')
    },
    OldBook: null
  }

  const BookingSchema = Yup.object().shape({
    StockID: Yup.string().required(t('booking.VUI_ONG_CHON_CS')),
    BookDate: Yup.string().required(t('booking.CHON_NGAY_DAT_LICH')),
    Phone: Yup.string().required(t('booking.NHAP_SO_DIEN_THOAI')),
    FullName: Yup.string().required(t('booking.NHAP_HO_TEN')),
    RootIdS: Yup.array().required(t('booking.CHON_DICH_VU'))
  })

  const [key, setKey] = useState('booking')
  const [loadingBtn, setLoadingBtn] = useState(false)
  const [initialValues] = useState(initialValue)
  const [BookSet, setBookSet] = useState()

  const onSubmit = (values, { resetForm }) => {
    setLoadingBtn(true)
    const itemBooking = {
      ...values
    }

    let Tags = []

    if (itemBooking.ID) {
      delete itemBooking.ID
    }
    if (itemBooking.RootIdS && itemBooking.RootIdS.length > 0) {
      if (
        itemBooking.RootIdS.some(
          item =>
            item.OsBook > 0 ||
            item.OsDoing > 0 ||
            item.OsNew > 0 ||
            item.OsBH > 0
        )
      ) {
        Tags.push('Có thẻ')
      }
      if (
        itemBooking.RootIdS.some(
          item =>
            item.OsBook === 0 &&
            item.OsDoing === 0 &&
            item.OsNew === 0 &&
            item.OsBH === 0
        )
      ) {
        Tags.push('Không thẻ')
      }
    }

    const newValues = {
      booking: [
        {
          ...itemBooking,
          BookDate: itemBooking.BookDate
            ? moment(itemBooking.BookDate).format('YYYY-MM-DD HH:mm')
            : '',
          RootIdS: itemBooking.RootIdS
            ? itemBooking.RootIdS.map(x => x.ID).join(',')
            : '',
          UserServiceIDs: itemBooking.UserServiceIDs
            ? itemBooking.UserServiceIDs.value
            : '',
          Desc:
            window.GlobalConfig?.APP?.SL_khach && itemBooking.AmountPeople
              ? `Số lượng khách: ${
                  itemBooking.AmountPeople.value
                }. \nTags: ${Tags.toString()} \n Ghi chú: ${
                  (itemBooking.Desc
                    ? itemBooking.Desc.replaceAll('\n', '</br>')
                    : '') +
                  (itemBooking?.OldBook
                    ? ` (Thay đổi từ ${
                        itemBooking?.OldBook?.RootTitles
                      } - ${moment(itemBooking?.OldBook?.BookDate).format(
                        'HH:mm DD-MM-YYYY'
                      )})`
                    : '')
                }`
              : (itemBooking.Desc
                  ? itemBooking.Desc.replaceAll('\n', '</br>')
                  : '') +
                (itemBooking?.OldBook
                  ? ` (Thay đổi từ ${
                      itemBooking?.OldBook?.RootTitles
                    } - ${moment(itemBooking?.OldBook?.BookDate).format(
                      'HH:mm DD-MM-YYYY'
                    )}`
                  : '')
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
            window.top?.toastr.success(
              t('booking.THAY_DOI_LICH_THANH_CONG') + '!',
              {
                timeOut: 2500
              }
            )
        } else {
          setLoadingBtn(false)
          resetForm()
          window.top?.toastr &&
            window.top?.toastr.success(t('booking.DAT_LICH_THANH_CONG') + '!', {
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
    <div className="overflow-hidden h-100 position-relative tab-book">
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

            let newDesc = obj.Desc
            let indexCut = newDesc && newDesc.indexOf('(Thay đổi từ')
            if (indexCut > -1) {
              newDesc = newDesc.substring(0, indexCut)
            }
            if (newDesc) {
              let newAmountPeople = {
                label: '1 ' + t('booking.KHACH'),
                value: 1
              }
              let descSplit = newDesc?.split('\n')
              for (let i of descSplit) {
                if (i.includes('Số lượng khách:')) {
                  let SL = Number(i.match(/\d+/)[0])
                  newAmountPeople = {
                    label: SL + ' ' + t('booking.KHACH'),
                    value: SL
                  }
                }
                if (i.includes('Ghi chú:')) {
                  newDesc = i.replaceAll('Ghi chú: ', '')
                }
              }
              formikProps.setFieldValue(
                'Desc',
                newDesc ? newDesc.replaceAll('</br>', '\n') : ''
              )
              formikProps.setFieldValue('AmountPeople', newAmountPeople)
            } else {
              formikProps.setFieldValue(
                'Desc',
                newDesc ? newDesc.replaceAll('</br>', '\n') : ''
              )
            }

            formikProps.setFieldValue('StockID', obj.StockID)
            formikProps.setFieldValue('Phone', obj.MobilePhone)
            formikProps.setFieldValue('FullName', obj.FullName)
            formikProps.setFieldValue('UserServiceIDs', obj.UserServiceIDs)
            formikProps.setFieldValue('OldBook', obj)
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
