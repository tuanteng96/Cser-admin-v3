import clsx from 'clsx'
import { Form, Formik } from 'formik'
import React from 'react'
import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import * as Yup from 'yup'
const AddSchema = Yup.object().shape({
  Title: Yup.string().required('Vui lòng nhập tên loại ca.')
})

function PickerAddShift({ children, onSubmit }) {
  const [visible, setVisible] = useState(false)
  const [initialValues] = useState({ Title: '' })
  const onHide = () => {
    setVisible(false)
  }

  return (
    <>
      {children({
        open: () => setVisible(true)
      })}
      <Modal
        show={visible}
        onHide={onHide}
        dialogClassName="!max-w-[450px]"
        centered
      >
        <Formik
          initialValues={initialValues}
          onSubmit={(values, { resetForm }) =>
            onSubmit(values, { resetForm, onHide })
          }
          enableReinitialize={true}
          validationSchema={AddSchema}
        >
          {formikProps => {
            // errors, touched, handleChange, handleBlur
            const { handleChange, handleBlur, errors, touched } = formikProps
            return (
              <Form className="h-100 card" autoComplete="off">
                <Modal.Header closeButton>
                  <Modal.Title>Thêm mới ca làm việc</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="form-group mb-0">
                    <div className="mb-1">Tên loại ca</div>
                    <input
                      name="Title"
                      type="text"
                      className={clsx(
                        'form-control h-[45px]',
                        errors.Title && touched.Title && 'solid-invalid'
                      )}
                      placeholder="Nhập tên"
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={onHide}>
                    Đóng
                  </Button>
                  <Button type="submit" variant="primary">
                    Tạo mới
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

export default PickerAddShift
