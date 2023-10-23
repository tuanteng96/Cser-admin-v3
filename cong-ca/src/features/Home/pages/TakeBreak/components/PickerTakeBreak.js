import clsx from 'clsx'
import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import SelectStaffs from 'src/components/Selects/SelectStaffs'
import DatePicker from 'react-datepicker'
import { useMutation, useQueryClient } from 'react-query'
import worksheetApi from 'src/api/worksheet.api'
import moment from 'moment'
import { useSelector } from 'react-redux'

function PickerTakeBreak({ children, item }) {
  const { TimeOpen, TimeClose } = useSelector(({ auth }) => ({
    TimeClose: auth?.GlobalConfig?.APP?.Working?.TimeClose || '23:45:00',
    TimeOpen: auth?.GlobalConfig?.APP?.Working?.TimeOpen || '00:00:00'
  }))
  const queryClient = useQueryClient()
  const [visible, setVisible] = useState(false)
  const [initialValues, setInitialValues] = useState({
    ID: 0,
    From: moment()
      .set({
        hour: moment(TimeOpen, 'HH:mm:ss').get('hour'),
        minute: moment(TimeOpen, 'HH:mm:ss').get('minute'),
        second: moment(TimeOpen, 'HH:mm:ss').get('second')
      })
      .toDate(),
    To: moment()
      .set({
        hour: moment(TimeClose, 'HH:mm:ss').get('hour'),
        minute: moment(TimeClose, 'HH:mm:ss').get('minute'),
        second: moment(TimeClose, 'HH:mm:ss').get('second')
      })
      .toDate(),
    UserID: ''
  })

  useEffect(() => {
    if (visible && item) {
      setInitialValues(prevState => ({
        ...prevState,
        ...item,
        ID: item.ID,
        From: item.From,
        To: item.To,
        UserID: {
          label: item?.User?.UserName,
          value: item?.UserID
        },
        Desc: item.Desc
      }))
    }
  }, [visible, item])

  const onHide = () => setVisible(false)

  const updateMutation = useMutation({
    mutationFn: body => worksheetApi.deleteWorkOff(body)
  })

  const onSubmit = values => {
    updateMutation.mutate(
      {
        edit: [
          {
            ...values,
            From:
              values.From && moment(values.From).format('YYYY-MM-DD HH:mm:ss'),
            To: values.To && moment(values.To).format('YYYY-MM-DD HH:mm:ss'),
            UserID: values.UserID ? values.UserID?.value : ''
          }
        ]
      },
      {
        onSettled: () => {
          queryClient
            .invalidateQueries({ queryKey: ['ListWorkOff'] })
            .then(() => {
              onHide()
              window.top.toastr &&
                window.top.toastr.success(
                  values.ID ? 'Cập nhập thành công.' : 'Thêm mới thành công',
                  {
                    timeOut: 1500
                  }
                )
            })
        }
      }
    )
  }

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: onHide
      })}
      <Modal
        show={visible}
        onHide={onHide}
        dialogClassName="modal-content-right max-w-400px"
        scrollable={true}
        enforceFocus={false}
      >
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          enableReinitialize={true}
          //validationSchema={CreateSchema}
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
                    {!values.ID ? (
                      'Tạo lịch nghỉ'
                    ) : (
                      <div className="d-flex align-items-baseline">
                        Lịch nghỉ
                        <div className="text-capitalize font-size-sm font-base fw-600 pl-5px">
                          {values?.UserID?.label}
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
                        errors.From &&
                          touched.From &&
                          'is-invalid solid-invalid'
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
                      Lý do
                    </label>
                    <textarea
                      className="form-control"
                      placeholder="Nhập lý do"
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
                  <Button
                    type="submit"
                    className={clsx(
                      'ml-8px',
                      updateMutation.isLoading &&
                        'spinner spinner-white spinner-right'
                    )}
                    disabled={updateMutation.isLoading}
                  >
                    {!values?.ID ? 'Thêm mới' : 'Cập nhập'}
                  </Button>
                </Modal.Footer>
              </Form>
            )
          }}
        </Formik>
      </Modal>
    </>
  )
}

export default PickerTakeBreak
