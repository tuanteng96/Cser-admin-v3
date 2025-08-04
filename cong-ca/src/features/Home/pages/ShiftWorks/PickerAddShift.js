import clsx from 'clsx'
import { Form, Formik } from 'formik'
import { values } from 'lodash'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import * as Yup from 'yup'
const AddSchema = Yup.object().shape({
  Title: Yup.string().required('Vui lòng nhập tên loại ca.')
})

function PickerAddShift({ children, onSubmit, Title }) {
  const [visible, setVisible] = useState(false)
  const [initialValues, setInitialValues] = useState({
    Title: '',
    flexible: false
  })

  useEffect(() => {
    if (visible) {
      if (Title) {
        setInitialValues(prevState => ({
          ...prevState,
          Title
        }))
      } else {
        setInitialValues({
          Title: '',
          flexible: false
        })
      }
    }
  }, [visible])

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
            const { handleChange, handleBlur, errors, touched, values } = formikProps
            return (
              <Form className="h-100 card" autoComplete="off">
                <Modal.Header closeButton>
                  <Modal.Title>
                    {Title ? 'Chỉnh sửa ca làm việc' : 'Thêm mới ca làm việc'}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="mb-4 form-group last:!mb-0">
                    <div className="mb-1">Tên loại ca</div>
                    <input
                      value={values.Title}
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
                  {!Title && (
                    <div className="mb-4 last:!mb-0">
                      <label className="checkbox checkbox-solid">
                        <input
                          type="checkbox"
                          checked={values.flexible}
                          name="flexible"
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <span className="icon"></span>
                        <span className="pl-2 font-medium cursor-pointer">
                          Ca linh hoạt
                        </span>
                      </label>
                    </div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={onHide}>
                    Đóng
                  </Button>
                  <Button type="submit" variant="primary">
                    Tiếp tục
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
