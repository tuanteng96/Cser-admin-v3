import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import { NumericFormat } from 'react-number-format'

function PickerRatio({ children, filters, onSubmit }) {
  const [visible, setVisible] = useState(false)
  const [Value, setValue] = useState('')

  useEffect(() => {
    if (visible) setValue('')
  }, [visible])

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false)
      })}
      {createPortal(
        <Modal show={visible} onHide={() => setVisible(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Tỉ lệ thưởng thêm ngày {filters.From}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="mb-1">Tỉ lệ thưởng</div>
            <div>
              <NumericFormat
                name="Value"
                className="form-control"
                type="text"
                placeholder="Nhập tỉ lệ"
                value={Value}
                onValueChange={val => {
                  setValue(val.floatValue ? val.floatValue : val.value)
                }}
                autoComplete="off"
                allowLeadingZeros
                thousandSeparator={false}
                allowNegative
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="mr-5px"
              variant="secondary"
              onClick={() => setVisible(false)}
            >
              Huỷ
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onSubmit(Value)
                setVisible(false)
              }}
            >
              Xác nhận
            </Button>
          </Modal.Footer>
        </Modal>,
        document.body
      )}
    </>
  )
}

export default PickerRatio
