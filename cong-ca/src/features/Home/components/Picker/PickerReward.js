import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import { useQueryClient } from 'react-query'
import Select, { components } from 'react-select'
import { NumericFormat } from 'react-number-format'
import clsx from 'clsx'

function PickerReward({ children, onChange, Title }) {
  const queryClient = useQueryClient()

  const [visible, setVisible] = useState(false)
  const [initialValues, setInitialValues] = useState({
    Type: '',
    Value: ''
  })

  const onSubmit = (values, { setErrors, resetForm }) => {
    //console.log(values)
    if (!values.Type) {
      onChange(Number(values.Value))
      setVisible(false)
      resetForm()
    } else {
      onChange(
        values?.Type?.value === 1 || values?.Type?.value === 2
          ? Number(values.Value)
          : Number(values.Value * -1)
      )
      setVisible(false)
      resetForm()
    }
  }

  let options = [
    {
      label: 'Theo số tiền (x > 100)',
      value: 1,
      desc: 'Ví dụ: 5000, 10000 hay 1 số tiền Spa quy định',
      sub: '(Số nhập vào phải lớn hơn 100)'
    },
    {
      label: 'Theo lương tính theo giờ của nhân viên ( 0 <= x <=100 )',
      value: 2,
      desc: 'Ví dụ: Nhập 0.5 nếu được tính 50% lương 1 giờ của nhân viên',
      sub: '(Số nhập vào phải từ 0 đến 100)'
    },
    {
      label: 'Theo số phút & theo lương giờ từng nhân viên ( x = -60 )',
      value: 3,
      desc: 'Ví dụ: Lương 1 giờ được 60.000 VNĐ - Mỗi phút sẽ là 1.000 VNĐ; Số tiền = Số phút vênh x 1.000đ',
      sub: '(Số nhập vào phải = 60)'
    },
    {
      label: 'Theo số công làm việc ( -10 <= x < 0 )',
      value: 4,
      desc: 'Ví dụ: Nhập 0.5 nếu tính theo nữa ngày công',
      sub: '(Số nhập vào phải từ 0 đến 10)'
    },
    {
      label: 'Theo số phút & cố định số tiền ( x < -10)',
      value: 5,
      desc: 'Ví dụ: Số tiền sẽ được tính bằng số phút vênh nhân với số tiền nhập vào cho tất cả nhân viên',
      sub: '(Số nhập vào phải lớn hơn 100)'
    }
  ]

  const Option = props => {
    const { label, desc, sub } = props.data

    return (
      <components.Option {...props}>
        <div>{label}</div>
        <div style={{ fontWeight: '300', color: '#6c757d', fontSize: '13px' }}>
          <div>{desc}</div>
          <div>{sub}</div>
        </div>
      </components.Option>
    )
  }

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false)
      })}
      {createPortal(
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          enableReinitialize={true}
        >
          {formikProps => {
            // errors, touched, handleChange, handleBlur
            const {
              setFieldValue,
              setFieldError,
              values,
              errors,
              setErrors,
              resetForm
            } = formikProps

            return (
              <Modal
                show={visible}
                onHide={() => {
                  setVisible(false)
                  resetForm({})
                }}
                centered
              >
                <Form className="h-100" autoComplete="off">
                  <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '18px' }}>
                      {Title}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="mb-3.5">
                      <div className="mb-1">Loại</div>
                      <div>
                        <Select
                          isClearable
                          cacheOptions
                          defaultOptions
                          options={options}
                          className="select-control"
                          classNamePrefix="select"
                          placeholder="Chọn loại"
                          noOptionsMessage={() => 'Không có dữ liệu'}
                          onChange={val => {
                            setFieldValue('Type', val, false)
                            if (!val) {
                              setErrors({})
                            }

                            if (val?.value === 3) {
                              setErrors({})
                              setFieldValue('Value', 60, false)
                            }

                            if (values.Value) {
                              if (val?.value === 1) {
                                if (values.Value <= 100) {
                                  setFieldError(
                                    'Value',
                                    'Giá trị phải lớn hơn 100'
                                  )
                                } else {
                                  setErrors({})
                                }
                              }
                              if (val?.value === 2) {
                                if (values.Value >= 0 && values.Value <= 100) {
                                  setErrors({})
                                } else {
                                  setFieldError(
                                    'Value',
                                    'Giá trị phải nằm trong khoảng >= 0 & <= 100'
                                  )
                                }
                              }
                              if (val?.value === 3) {
                                if (values.Value === 60) {
                                  setErrors({})
                                } else {
                                  setFieldError('Value', 'Giá trị phải = 60')
                                }
                              }
                              if (val?.value === 4) {
                                if (values.Value > 0 && values.Value <= 10) {
                                  setErrors({})
                                } else {
                                  setFieldError(
                                    'Value',
                                    'Giá trị phải nằm trong khoảng > 0 & <= 10'
                                  )
                                }
                              }
                              if (val?.value === 5) {
                                if (values.Value > 100) {
                                  setErrors({})
                                } else {
                                  setFieldError('Value', 'Giá trị phải > 100')
                                }
                              }
                            }
                          }}
                          value={values.Type}
                          components={{ Option }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1">Giá trị</div>
                      <div>
                        <NumericFormat
                          name="Value"
                          className={clsx(
                            'form-control',
                            errors?.Value && 'is-invalid'
                          )}
                          type="text"
                          placeholder="Nhập giá trị"
                          value={values.Value}
                          onValueChange={val => {
                            setFieldValue(
                              'Value',
                              val.floatValue ? val.floatValue : val.value,
                              false
                            )
                            if (values.Type) {
                              if (values.Type?.value === 1) {
                                if (val.floatValue <= 100) {
                                  setFieldError(
                                    'Value',
                                    'Giá trị phải lớn hơn 100'
                                  )
                                } else {
                                  setErrors({})
                                }
                              }
                              if (values.Type?.value === 2) {
                                if (
                                  val.floatValue >= 0 &&
                                  val.floatValue <= 100
                                ) {
                                  setErrors({})
                                } else {
                                  setFieldError(
                                    'Value',
                                    'Giá trị phải nằm trong khoảng >= 0 & <= 100'
                                  )
                                }
                              }
                              if (values.Type?.value === 3) {
                                if (val.floatValue === 60) {
                                  setErrors({})
                                } else {
                                  setFieldError('Value', 'Giá trị phải = 60')
                                }
                              }
                              if (values.Type?.value === 4) {
                                if (
                                  val.floatValue > 0 &&
                                  val.floatValue <= 10
                                ) {
                                  setErrors({})
                                } else {
                                  setFieldError(
                                    'Value',
                                    'Giá trị phải nằm trong khoảng > 0 & <= 10'
                                  )
                                }
                              }
                              if (values.Type?.value === 5) {
                                if (val.floatValue > 100) {
                                  setErrors({})
                                } else {
                                  setFieldError('Value', 'Giá trị phải > 100')
                                }
                              }
                            }
                          }}
                          autoComplete="off"
                          allowLeadingZeros
                          thousandSeparator={true}
                          allowNegative={false}
                        />
                        {errors?.Value && (
                          <div
                            className="mt-1 text-danger"
                            style={{ fontSize: '13px' }}
                          >
                            {errors?.Value}
                          </div>
                        )}
                      </div>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => setVisible(false)}
                    >
                      Huỷ
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => formikProps.submitForm()}
                      disabled={values.Value === '' || errors.Value}
                    >
                      Xác nhận
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal>
            )
          }}
        </Formik>,
        document.body
      )}
    </>
  )
}

export default PickerReward
