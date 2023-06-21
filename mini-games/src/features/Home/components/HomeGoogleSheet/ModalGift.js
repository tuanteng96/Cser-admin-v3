import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'
import { useForm, Controller } from 'react-hook-form'
import { NumericFormat } from 'react-number-format'
import clsx from 'clsx'

function ModalGift({ show, onHide, gift, onSubmit, btnLoading }) {
  const { register, handleSubmit, control } = useForm()
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="sm"
      centered
      dialogClassName="max-w-350px"
      contentClassName="mt-50px animate__animated animate__flipInY"
      backdrop={!btnLoading ? 'static' : true}
    >
      <div className="position-absolute top--120px position-left-center">
        <img
          className="w-500px"
          src={AssetsHelpers.toAbsoluteUrl('/images/gift/gift-finish.png')}
          alt=""
        />
      </div>
      <div className="pt-145px pb-20px">
        <div className="text-center">
          <div className="fw-500 font-size-mdd text-capitalize">Phần quà</div>
          <div className="text-danger fw-700 text-uppercase font-size-h2 my-6px">
            {gift?.option}
          </div>
          <div className="font-size-md text-capitalize">Chúc mừng bạn !</div>
        </div>
        <div className="px-20px mt-20px">
          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
            <div className="mb-12px">
              <input
                type="text"
                className="form-control form-control-solid text-center h-45px form-control-pill fw-500"
                placeholder="Họ và tên"
                {...register('FullName')}
              />
            </div>
            <div className="mb-12px">
              <Controller
                control={control}
                name="Phone"
                render={({ field: { onChange, name, value } }) => (
                  <NumericFormat
                    allowNegative
                    className="form-control form-control-solid text-center h-45px form-control-pill fw-500"
                    placeholder="Số điện thoại"
                    name={name}
                    value={value}
                    onValueChange={({ value }) => {
                      onChange(value)
                    }}
                    allowLeadingZeros={true}
                  />
                )}
              />
            </div>
            <button
              type="submit"
              className={`btn btn-danger w-100 text-uppercase fw-500 h-45px btn-pill ${clsx(
                { 'spinner spinner-white spinner-right pr-12px': btnLoading }
              )}`}
              disabled={btnLoading}
            >
              Nhận quà
            </button>
          </form>
        </div>
        <div
          className="mt-15px text-uppercase fw-600 font-size-xs text-center text-gray-500 text-underline cursor-pointer"
          onClick={onHide}
        >
          Cảm ơn, Đóng
        </div>
      </div>
    </Modal>
  )
}

ModalGift.propTypes = {
  show: PropTypes.bool
}

export default ModalGift
