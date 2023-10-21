import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import worksheetApi from 'src/api/worksheet.api'
import { useMutation, useQueryClient } from 'react-query'
import AsyncSelect from 'react-select/async'
import moreApi from 'src/api/more.api'

function PickerTypeShift({ children, item }) {
  const queryClient = useQueryClient()

  const [visible, setVisible] = useState(false)
  const [initialValues, setInitialValues] = useState({
    UserID: '',
    Shift: ''
  })

  useEffect(() => {
    if (item.WorkTimeSetting) {
      let WorkTimeSetting = JSON.parse(item.WorkTimeSetting)
      if (WorkTimeSetting.ShiftID) {
        setInitialValues({
          UserID: item?.UserID,
          Shift: {
            label: WorkTimeSetting.ShiftName,
            value: WorkTimeSetting.ShiftID
          }
        })
      }
    }
  }, [item])

  const addTypeShiftMutation = useMutation({
    mutationFn: body => worksheetApi.saveTypeShift(body)
  })

  const getTypeShiftMutation = useMutation({
    mutationFn: name => moreApi.getNameConfig(name)
  })

  const onSubmit = values => {
    addTypeShiftMutation.mutate(
      {
        updateList: [
          {
            UserID: item?.UserID,
            ShiftName: values?.Shift?.label || "",
            ShiftID: values?.Shift?.value || ""
          }
        ]
      },
      {
        onSuccess: data => {
          queryClient
            .invalidateQueries({ queryKey: ['ListWorkSheet'] })
            .then(() => {
              setVisible(false)
              window.top.toastr &&
                window.top.toastr.success('Cập nhập thành công !', {
                  timeOut: 1500
                })
            })
        },
        onError: err => console.log(err)
      }
    )
  }

  const promiseOptions = () =>
    new Promise(resolve => {
      getTypeShiftMutation.mutate('calamviecconfig', {
        onSuccess: ({ data }) => {
          let result = []
          if (data.data && data.data.length > 0) {
            result = JSON.parse(data.data[0].Value).map(x => ({
              ...x,
              label: x.Name,
              value: x.ID
            }))
          }
          resolve(result)
        },
        onError: error => {
          console.log(error)
        }
      })
    })

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
            const { setFieldValue, values } = formikProps

            return (
              <Modal show={visible} onHide={() => setVisible(false)} centered>
                <Form className="h-100" autoComplete="off">
                  <Modal.Header closeButton>
                    <Modal.Title>{item?.FullName}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="mb-1">Loại công ca</div>
                    <div>
                      <AsyncSelect
                        isClearable
                        cacheOptions
                        defaultOptions
                        loadOptions={promiseOptions}
                        className="select-control"
                        classNamePrefix="select"
                        placeholder="Chọn loại"
                        noOptionsMessage={() => 'Không có dữ liệu'}
                        onChange={val => setFieldValue('Shift', val)}
                        value={values.Shift}
                      />
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
                      type="submit"
                      variant="primary"
                      disabled={addTypeShiftMutation.isLoading}
                    >
                      {addTypeShiftMutation.isLoading && (
                        <svg
                          aria-hidden="true"
                          role="status"
                          className="inline w-5 h-5 mr-3 text-white animate-spin"
                          viewBox="0 0 100 101"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                            fill="#E5E7EB"
                          />
                          <path
                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                      Lưu thay đổi
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

export default PickerTypeShift
