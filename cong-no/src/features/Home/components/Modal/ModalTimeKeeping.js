import React, { Fragment, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { FieldArray, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Button, Dropdown, Modal } from 'react-bootstrap'
import { TimePicker } from 'antd'
import { NumericFormat } from 'react-number-format'
import locale from 'antd/es/date-picker/locale/de_DE'
import { clsx } from 'clsx'
import moreApi from 'src/api/more.api'

import moment from 'moment'
import 'moment/locale/vi'

moment.locale('vi')

ModalTimeKeeping.propTypes = {
  show: PropTypes.bool,
  onHide: PropTypes.func
}

const initialValue = {
  UserID: '',
  Date: '',
  Hours: [],
  Desc: '',
  WorkQty: 1,
  WorkQty1: '',
  WorkQty2: ''
}

const CreateSchema = Yup.object().shape({
  Hours: Yup.array().test('oneOfRequired', function (item) {
    return item[0] && item[0].filter(o => !o).length !== 2
  })
})

const getHourList = HourList => {
  let newHourList = []
  if (!HourList || HourList.length === 0) {
    newHourList = [['', '']]
  } else {
    newHourList = HourList.map(item => [
      item.From ? moment(item.From, 'HH:mm:ss') : '',
      item.To ? moment(item.To, 'HH:mm:ss') : ''
    ])
  }
  return newHourList
}

const DropdownOvertime = ({ title, onChange, name, value }) => {
  const [List, setList] = useState([])

  useEffect(() => {
    var nameConfig = 'cauhinhcong'
    if (name === 'TRU') {
      nameConfig = 'cauhinhtru'
    }
    getList(nameConfig)
  }, [name])

  const getList = name => {
    moreApi
      .getNameConfig(name)
      .then(({ data }) => {
        if (data && data.data && data.data[0].Value) {
          setList(JSON.parse(data.data[0].Value))
        }
      })
      .catch(error => console.log(error))
  }

  if (!List || List.length === 0) return null
  return (
    <Dropdown>
      <Dropdown.Toggle
        id="dropdown-autoclose-true"
        className="h-auto btn-xs btn-success py-0 px-5px"
      >
        {title}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {List &&
          List.map((item, index) => (
            <Dropdown.Item
              className={clsx(
                Number(value) === Number(item.value) && 'bg-primary text-white'
              )}
              href="#"
              key={index}
              onClick={() => onChange(item)}
            >
              {item.label}
            </Dropdown.Item>
          ))}
      </Dropdown.Menu>
    </Dropdown>
  )
}

function ModalTimeKeeping({
  show,
  initialModal,
  onHide,
  onSubmit,
  onDelete,
  loading,
  loadingDelete
}) {
  const [initialValues, setInitialValues] = useState(initialValue)

  useEffect(() => {
    if (show) {
      setInitialValues(prevState => ({
        ...prevState,
        Date: initialModal?.Date,
        UserID: initialModal?.Member?.ID,
        Hours: getHourList(initialModal?.HourList),
        Desc:
          initialModal?.UserWorks && initialModal?.UserWorks.length > 0
            ? initialModal?.UserWorks[0].Desc
            : '',
        WorkQty:
          initialModal?.UserWorks && initialModal?.UserWorks.length > 0
            ? initialModal?.UserWorks[0].WorkQty
            : 1,
        WorkQty1:
          initialModal?.UserWorks && initialModal?.UserWorks.length > 0
            ? initialModal?.UserWorks[0].WorkQty1
            : '',
        WorkQty2:
          initialModal?.UserWorks && initialModal?.UserWorks.length > 0
            ? initialModal?.UserWorks[0].WorkQty2
            : ''
      }))
    } else {
      setInitialValues(initialValue)
    }
  }, [initialModal, show])

  if (!initialModal) return null
  return (
    <Modal
      show={show}
      onHide={onHide}
      dialogClassName="modal-content-right max-w-350px"
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
            setFieldValue,
            handleChange,
            handleBlur,
            errors,
            touched
          } = formikProps

          return (
            <Form className="d-flex flex-column h-100">
              <Modal.Header closeButton>
                <Modal.Title className="font-title text-uppercase">
                  <div className="text-capitalize">
                    {initialModal?.Member?.FullName}
                  </div>
                  <div className="font-size-sm text-capitalize font-base text-muted">
                    <span className="text-capitalize">
                      {moment(initialModal?.Date).format('dddd')}
                    </span>
                    , Ngày
                    <span className="pl-3px">
                      {moment(initialModal?.Date).format('DD/MM/YYYY')}
                    </span>
                  </div>
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-0">
                <div className="border-bottom py-15px">
                  <FieldArray
                    name="Hours"
                    render={arrayHelpers => (
                      <Fragment>
                        {values.Hours &&
                          values.Hours.map((hour, index) => (
                            <div
                              className="form-group px-20px py-3px"
                              key={index}
                            >
                              <div
                                className={clsx(
                                  'd-flex TimePicker-button',
                                  index === 0 &&
                                    errors.Hours &&
                                    touched.Hours &&
                                    'is-invalid'
                                )}
                              >
                                <div className="flex-1">
                                  <TimePicker.RangePicker
                                    locale={{
                                      ...locale,
                                      lang: {
                                        ...locale.lang,
                                        ok: 'Lưu giờ'
                                      }
                                    }}
                                    placeholder={['Bắt đầu', 'Kết thúc']}
                                    onChange={(value, dateString) => {
                                      setFieldValue(`Hours[${index}]`, value)
                                    }}
                                    value={hour}
                                    allowEmpty={[true, true]}
                                    order={false}
                                  />
                                </div>
                                {values.Hours.length - 1 === index && (
                                  <button
                                    type="button"
                                    className="btn w-35px"
                                    onClick={() =>
                                      arrayHelpers.push(index, ['', ''])
                                    }
                                  >
                                    <i className="fa-regular fa-plus text-success"></i>
                                  </button>
                                )}
                                {values.Hours.length > 1 &&
                                  values.Hours.length - 1 !== index && (
                                    <button
                                      type="button"
                                      className="btn w-35px"
                                      onClick={() => arrayHelpers.remove(index)}
                                    >
                                      <i className="fa-regular fa-xmark text-danger"></i>
                                    </button>
                                  )}
                              </div>
                            </div>
                          ))}
                      </Fragment>
                    )}
                  />
                </div>
                <div className="form-group mb-20px px-20px mt-20px">
                  <label className="font-label text-muted mb-5px">Công</label>
                  <NumericFormat
                    className="form-control form-control-solid"
                    type="text"
                    placeholder="Nhập số công"
                    name="WorkQty"
                    value={values.WorkQty}
                    onValueChange={val =>
                      setFieldValue(
                        'WorkQty',
                        val.floatValue ? val.floatValue : val.value
                      )
                    }
                    onBlur={handleBlur}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group mb-20px px-20px">
                  <div className="d-flex justify-content-between align-items-center mb-6px">
                    <label className="font-label text-muted mb-0">
                      Công tăng ca
                    </label>
                    <DropdownOvertime
                      title="Chọn thời gian"
                      onChange={val => setFieldValue('WorkQty1', val.value)}
                      name="CONG"
                      value={values.WorkQty1}
                    />
                  </div>
                  <NumericFormat
                    className="form-control form-control-solid"
                    type="text"
                    placeholder="Nhập công tăng ca"
                    name="WorkQty1"
                    value={values.WorkQty1}
                    onValueChange={val =>
                      setFieldValue(
                        'WorkQty1',
                        val.floatValue ? val.floatValue : val.value
                      )
                    }
                    onBlur={handleBlur}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group mb-20px px-20px">
                  <div className="d-flex justify-content-between align-items-center mb-6px">
                    <label className="font-label text-muted mb-0">
                      Công thiếu giờ
                    </label>
                    <DropdownOvertime
                      title="Chọn thời gian"
                      onChange={val => setFieldValue('WorkQty2', val.value)}
                      name="TRU"
                      value={values.WorkQty2}
                    />
                  </div>
                  <NumericFormat
                    className="form-control form-control-solid"
                    type="text"
                    placeholder="Nhập công thiếu"
                    name="WorkQty2"
                    value={values.WorkQty2}
                    onValueChange={val =>
                      setFieldValue(
                        'WorkQty2',
                        val.floatValue ? val.floatValue : val.value
                      )
                    }
                    onBlur={handleBlur}
                    autoComplete="off"
                  />
                </div>
                <div className="form-group mb-20px px-20px">
                  <label className="font-label text-muted mb-5px">
                    Ghi chú
                  </label>
                  <textarea
                    className="form-control form-control-solid"
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
                <div>
                  <Button type="button" variant="secondary" onClick={onHide}>
                    Đóng
                  </Button>
                  {initialModal && initialModal?.UserWorks.length > 0 && (
                    <Button
                      className={clsx(
                        'ml-6px',
                        loadingDelete && 'spinner spinner-white spinner-right'
                      )}
                      type="button"
                      variant="danger"
                      onClick={() => onDelete(initialModal)}
                      disabled={loadingDelete}
                    >
                      Hủy
                    </Button>
                  )}
                </div>
                <Button
                  type="submit"
                  className={clsx(
                    'ml-8px',
                    loading && 'spinner spinner-white spinner-right'
                  )}
                  variant="primary"
                  disabled={loading}
                >
                  Cập nhập
                </Button>
              </Modal.Footer>
            </Form>
          )
        }}
      </Formik>
    </Modal>
  )
}

export default ModalTimeKeeping
