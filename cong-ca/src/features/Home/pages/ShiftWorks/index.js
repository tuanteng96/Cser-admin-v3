import React from 'react'
import { useNavigate } from 'react-router-dom'
import CreatableSelect from 'react-select/creatable'

function ShiftWorks(props) {
  const navigate = useNavigate()

  return (
    <div className="h-100 card">
      <div className="card-header d-block p-20px min-h-125px min-h-md-auto">
        <div className="d-flex justify-content-between">
          <h3 className="text-uppercase">
            <div className="d-flex align-items-baseline">
              <div
                className="d-flex cursor-pointer"
                onClick={() => navigate('/')}
              >
                <div className="w-20px">
                  <i className="fa-regular fa-chevron-left ml-0 vertical-align-middle text-muted"></i>
                </div>
                Ca làm việc
              </div>
            </div>
          </h3>
          <button type="button" class="btn fw-500 btn-primary">
            Lưu thay đổi
          </button>
        </div>
      </div>
      <div class="card-body p-20px overflow-auto">
        <div class="d-flex">
          <div class="w-350px">
            <div class="border rounded p-20px">
              <div>
                <input
                  type="text"
                  class="form-control form-control-solid"
                  placeholder="Nhập tên loại ca làm việc"
                />
              </div>
              <button className="btn fw-500 btn-success w-100 mt-15px">
                Thêm mới
              </button>
              {/* <div
                className="mt-15px d-flex p-20px rounded"
                style={{ backgroundColor: '#e1f0ff' }}
              >
                <svg
                  className="w-25px"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5.91 10.403A6.75 6.75 0 0119 12.752a6.724 6.724 0 01-2.942 5.544l-.058.037v4.917a.75.75 0 01-.648.743L15.25 24h-6a.75.75 0 01-.75-.75v-4.917l-.06-.04a6.75 6.75 0 01-2.613-7.646zm7.268-2.849a5.25 5.25 0 00-3.553 9.714.75.75 0 01.375.65v4.581h4.5v-4.581a.75.75 0 01.282-.587l.095-.064a5.224 5.224 0 002.623-4.52 5.25 5.25 0 00-4.322-5.193zM22.75 12a.75.75 0 01.102 1.493l-.102.007h-1.5a.75.75 0 01-.102-1.493L21.25 12h1.5zm-19.5 0a.75.75 0 01.102 1.493l-.102.007h-1.5a.75.75 0 01-.102-1.493L1.75 12h1.5zm.96-8.338l.085.072 2.12 2.121a.75.75 0 01-.976 1.133l-.084-.072-2.12-2.121a.75.75 0 01.976-1.133zm17.056.072a.75.75 0 01.072.977l-.072.084-2.121 2.12a.75.75 0 01-1.133-.976l.072-.084 2.121-2.12a.75.75 0 011.06 0zM12.25 0a.75.75 0 01.743.648L13 .75v3a.75.75 0 01-1.493.102L11.5 3.75v-3a.75.75 0 01.75-.75z"
                    fill="#101928"
                  />
                </svg>
                <div className="pl-20px flex-1">
                  Khi không tìm thấy loại ca làm việc, bạn có thể thêm mới.
                </div>
              </div> */}
            </div>
            <div className="mt-20px border rounded">
              <div className="px-20px py-15px fw-500 border-bottom">
                Ca sáng
              </div>
              <div className="px-20px py-15px fw-500 border-bottom">
                Ca chiều
              </div>
              <div className="px-20px py-15px fw-500">Ca full</div>
            </div>
          </div>
          <div class="flex-1 pl-20px">
            <div class="border rounded p-20px">b</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShiftWorks
