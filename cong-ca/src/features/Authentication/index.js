import React from 'react'
import { useSelector } from 'react-redux'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'

function Authentication(props) {
  const { CrStockID } = useSelector(({ auth }) => ({
    CrStockID: auth?.Info?.CrStockID || ''
  }))
  return (
    <div className="h-100 w-100 bg-white d-flex align-items-center justify-content-center">
      <div>
        <div className="text-uppercase fw-700 font-size-h3 text-center mb-10px text-danger">
          Yêu cầu quyền truy cập
        </div>
        <div className="text-center font-size-md fw-300 max-w-400px m-auto">
          {!CrStockID && (
            <div className="text-danger fw-400 mb-5px">
              <i className="fas fa-exclamation-triangle mr-2px"></i> Bạn vui
              lòng chọn điểm để thực hiện thao tác.
            </div>
          )}
          Bạn không có quyền truy cập chức năng này. Vui lòng xin cấp quyền truy
          cập chức năng này
        </div>
        <div className="ps-5">
          <img
            className="max-w-400px"
            src={AssetsHelpers.toAbsoluteUrl('/_assets/images/authen.png')}
            alt="Bạn không có quyền."
          />
        </div>
      </div>
    </div>
  )
}

export default Authentication
