import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import worksheetApi from 'src/api/worksheet.api'
import { useMutation, useQueryClient } from 'react-query'

function PickerMachineCode({ children, item }) {
  const queryClient = useQueryClient()

  const [visible, setVisible] = useState(false)
  const [initialValues, setInitialValues] = useState({
    UserID: '',
    DeviceIDs: ''
  })

  useEffect(() => {
    setInitialValues({
      UserID: item?.UserID,
      DeviceIDs: item?.DeviceIDs || ''
    })
  }, [item])

  const saveMachineMutation = useMutation({
    mutationFn: body => worksheetApi.saveMachineCode(body)
  })

  const deleteMachineMutation = useMutation({
    mutationFn: body => worksheetApi.saveMachineCode(body)
  })

  const onSubmit = values => {
    saveMachineMutation.mutate(
      {
        updateList: [{ ...values }]
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

  const onDelete = () => {
    deleteMachineMutation.mutate(
      {
        updateList: [
          {
            UserID: item?.UserID,
            DeviceIDs: ''
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
                window.top.toastr.success('Xoá thành công !', {
                  timeOut: 1500
                })
            })
        },
        onError: err => console.log(err)
      }
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
            const { handleBlur, handleChange, values } = formikProps
            return (
              <Modal show={visible} onHide={() => setVisible(false)} centered>
                <Form className="h-100" autoComplete="off">
                  <Modal.Header closeButton>
                    <Modal.Title>{item?.FullName}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div className="mb-1">Mã máy</div>
                    <div>
                      <input
                        name="DeviceIDs"
                        type="text"
                        className="form-control"
                        placeholder="Nhập mã máy"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.DeviceIDs}
                      />
                    </div>
                  </Modal.Body>
                  <Modal.Footer className="justify-content-between">
                    <div>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={onDelete}
                        disabled={deleteMachineMutation.isLoading}
                      >
                        {deleteMachineMutation.isLoading && (
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
                        Xoá mã máy
                      </Button>
                    </div>
                    <div>
                      <Button
                        className="mr-5px"
                        variant="secondary"
                        onClick={() => setVisible(false)}
                      >
                        Huỷ
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={saveMachineMutation.isLoading}
                      >
                        {saveMachineMutation.isLoading && (
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
                    </div>
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

export default PickerMachineCode
