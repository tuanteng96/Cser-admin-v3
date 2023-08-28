import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Button, Modal } from 'react-bootstrap'
import SelectStaffs from 'src/components/Selects/SelectStaffs'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import DatePicker from 'react-datepicker'
import clsx from 'clsx'
import { useSelector } from 'react-redux'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

ModalHolidaySchedule.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func
}

const initialValue = {
  UserID: '',
  From: '',
  To: '',
  Desc: ''
}

const CreateSchema = Yup.object().shape({
  UserID: Yup.object().required('Chọn nhân viên.'),
  From: Yup.string().required('Chọn thời gian'),
  To: Yup.string().required('Chọn thời gian')
})

function ModalHolidaySchedule({
  show,
  onHide,
  onSubmit,
  loading,
  initialModal,
  onDelete
}) {
  const [initialValues, setInitialValues] = useState(initialValue)

  const { TimeOpen, TimeClose } = useSelector(({ auth }) => ({
    TimeOpen: auth?.GlobalConfig?.APP?.Working?.TimeOpen || '00:00:00',
    TimeClose: auth?.GlobalConfig?.APP?.Working?.TimeClose || '23:59:00'
  }))

  useEffect(() => {
    if (initialModal) {
      setInitialValues(prevState => ({
        ...prevState,
        GroupTick: initialModal?.GroupTick,
        ...initialModal,
        From: initialModal?.GroupInfo?.From,
        To: initialModal?.GroupInfo?.To,
        UserID: {
          label: initialModal?.Member?.FullName,
          value: initialModal?.UserID
        }
      }))
    } else {
      let TimeFrom = moment(TimeOpen, 'HH:mm')
      let TimeTo = moment(TimeClose, 'HH:mm')

      setInitialValues(prevState => ({
        ...prevState,
        From: moment().set({
          hour: TimeFrom.get('hour'),
          minute: TimeFrom.get('minute'),
          second: TimeFrom.get('second')
        }),
        To: moment().set({
          hour: TimeTo.get('hour'),
          minute: TimeTo.get('minute'),
          second: TimeTo.get('second')
        })
      }))
    }
  }, [show, initialModal, TimeOpen, TimeClose])

  const filterPassedTime = time => {
    var beginningTime = moment(time, 'HH:mm:ss')
    var startTime = moment(TimeOpen, 'HH:mm:ss')
    var endTime = moment(TimeClose, 'HH:mm:ss')
    return (
      beginningTime.isSameOrAfter(startTime) &&
      beginningTime.isSameOrBefore(endTime)
    )
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      dialogClassName="modal-content-right max-w-400px"
      scrollable={true}
      enforceFocus={false}
    >
      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize={true}
        validationSchema={CreateSchema}
      >
        {formikProps => {
          // errors, touched, handleChange, handleBlur
          const {
            values,
            touched,
            errors,
            setFieldValue,
            handleChange,
            handleBlur
          } = formikProps

          return (
            <Form className="d-flex flex-column h-100" autoComplete="off">
              <Modal.Header closeButton>
                <Modal.Title className="font-title text-uppercase">
                  {!initialModal ? (
                    'Tạo ngày nghỉ'
                  ) : (
                    <div className="d-flex align-items-baseline">
                      Lịch nghỉ
                      <div className="text-capitalize font-size-sm font-base fw-600 pl-5px">
                        {initialModal.Member.FullName}
                      </div>
                    </div>
                  )}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className="form-group mb-20px">
                  <label className="font-label text-muted mb-5px">
                    Nhân viên
                  </label>
                  <SelectStaffs
                    className={clsx(
                      'select-control',
                      errors.UserID &&
                        touched.UserID &&
                        'is-invalid solid-invalid'
                    )}
                    menuPosition="fixed"
                    name="UserID"
                    onChange={otp => {
                      setFieldValue('UserID', otp, false)
                    }}
                    value={values.UserID}
                    isClearable={true}
                    adv={true}
                  />
                </div>
                <div className="form-group mb-20px">
                  <label className="font-label text-muted mb-5px">
                    Thời gian bắt đầu
                  </label>
                  <DatePicker
                    name="From"
                    selected={values.From ? new Date(values.From) : ''}
                    onChange={date => setFieldValue('From', date)}
                    onBlur={handleBlur}
                    className={clsx(
                      'form-control',
                      errors.From && touched.From && 'is-invalid solid-invalid'
                    )}
                    shouldCloseOnSelect={false}
                    dateFormat="dd/MM/yyyy HH:mm"
                    placeholderText="Chọn thời gian"
                    timeInputLabel="Thời gian"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    autoComplete="off"
                    //filterTime={filterPassedTime}
                  />
                </div>
                <div className="form-group mb-20px">
                  <label className="font-label text-muted mb-5px">
                    Thời gian kết thúc
                  </label>
                  <DatePicker
                    name="To"
                    selected={values.To ? new Date(values.To) : ''}
                    onChange={date => setFieldValue('To', date)}
                    onBlur={handleBlur}
                    className={clsx(
                      'form-control',
                      errors.To && touched.To && 'is-invalid solid-invalid'
                    )}
                    shouldCloseOnSelect={false}
                    dateFormat="dd/MM/yyyy HH:mm"
                    placeholderText="Chọn thời gian"
                    timeInputLabel="Thời gian"
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={5}
                    autoComplete="off"
                    //filterTime={filterPassedTime}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="font-label text-muted mb-5px">
                    Ghi chú
                  </label>
                  <textarea
                    className="form-control"
                    placeholder="Nhập ghi chú"
                    rows={4}
                    name="Desc"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.Desc}
                  ></textarea>
                </div>
              </Modal.Body>
              <Modal.Footer className="justify-content-between">
                <Button type="button" variant="secondary" onClick={onHide}>
                  Đóng
                </Button>
                {initialModal?.GroupTick ? (
                  <Button
                    type="button"
                    className={clsx(
                      loading && 'spinner spinner-white spinner-right'
                    )}
                    variant="danger"
                    onClick={() => onDelete(initialModal?.GroupTick)}
                    disabled={loading}
                  >
                    Xóa lịch nghỉ
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className={clsx(
                      'ml-8px',
                      loading && 'spinner spinner-white spinner-right'
                    )}
                    disabled={loading}
                  >
                    Thêm mới
                  </Button>
                )}
              </Modal.Footer>
            </Form>
          )
        }}
      </Formik>
    </Modal>
  )
}

export default ModalHolidaySchedule
