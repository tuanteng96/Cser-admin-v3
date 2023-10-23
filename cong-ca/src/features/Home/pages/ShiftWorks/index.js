import clsx from 'clsx'
import { FieldArray, Form, Formik } from 'formik'
import moment from 'moment'
import React, { useState } from 'react'
import ReactDatePicker from 'react-datepicker'
import { NumericFormat } from 'react-number-format'
import { useMutation, useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import uuid from 'react-uuid'
import moreApi from 'src/api/more.api'

let getInitial = () => {
  let data = []
  for (let index = 0; index < 7; index++) {
    let obj = {}
    obj.Title = moment().clone().weekday(index).format('dddd')
    obj.index = index
    obj.TimeFrom = '06:00'
    obj.TimeTo = '18:00'
    obj.Value = 1
    if (index === 6) {
      obj.isOff = true
    } else {
      obj.isOff = false
    }
    data.push(obj)
  }
  return data
}

function ShiftWorks(props) {
  const navigate = useNavigate()

  const [indexActive, setIndexActive] = useState(0)
  const [textAdd, setTextAdd] = useState('')

  const [initialValues, setInitialValues] = useState({
    CONG_CA: []
  })

  const { isLoading } = useQuery({
    queryKey: ['calamviecconfig'],
    queryFn: async () => {
      const { data } = await moreApi.getNameConfig('calamviecconfig')
      return data?.data || []
    },
    onSuccess: data => {
      if (data && data.length > 0) {
        let result = data[0].Value ? JSON.parse(data[0].Value) : []
        setInitialValues({
          CONG_CA: result
        })
      }
    }
  })

  const saveConfigMutation = useMutation({
    mutationFn: body => moreApi.saveConfigName(body)
  })

  const onSubmit = values => {
    saveConfigMutation.mutate(
      {
        name: 'calamviecconfig',
        data: values.CONG_CA
      },
      {
        onSuccess: data => {
          window.top.toastr &&
            window.top.toastr.success('Cập nhập thành công !', {
              timeOut: 1500
            })
        },
        onError: error => console.log(error)
      }
    )
  }

  const getTotalTime = day => {
    if (day.isOff) return 'Nghỉ'
    var a = moment(day.TimeFrom, 'HH:mm')
    var b = moment(day.TimeTo, 'HH:mm')
    var duration = moment.duration(b.diff(a))
    var hours = duration.asHours()
    return Math.round(hours) + 'h'
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {formikProps => {
        // errors, touched, handleChange, handleBlur
        const { values, setFieldValue, handleBlur } = formikProps
        return (
          <Form className="h-100 card" autoComplete="off">
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
                <button
                  type="submit"
                  className="btn fw-500 btn-primary"
                  disabled={saveConfigMutation.isLoading}
                >
                  {saveConfigMutation.isLoading && (
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
                </button>
              </div>
            </div>
            <div className="card-body p-20px overflow-auto relative">
              <div className="d-flex max-w-[1200px] mx-auto">
                <div className="w-350px">
                  {values.CONG_CA && values.CONG_CA.length > 0 && (
                    <FieldArray
                      name="CONG_CA"
                      render={arrayHelpers => (
                        <div className="mb-20px border rounded overflow-hidden">
                          {values.CONG_CA.map((item, index) => (
                            <div
                              className={clsx(
                                'px-20px py-8px fw-500 cursor-pointer flex items-center',
                                indexActive === index &&
                                  'bg-primary text-white',
                                values.CONG_CA.length - 1 !== index &&
                                  'border-bottom'
                              )}
                              onClick={() => setIndexActive(index)}
                              key={index}
                            >
                              <div className="flex-1 pr-3">{item.Name}</div>
                              <div
                                className="w-35px h-35px flex items-center justify-center rounded-full hover:bg-danger hover:text-white transiton"
                                onClick={e => {
                                  e.stopPropagation()
                                  setIndexActive(0)
                                  arrayHelpers.remove(index)
                                }}
                              >
                                <svg
                                  className="w-6"
                                  fill="currentColor"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M8.159 2.659A2.25 2.25 0 0 1 9.75 2h4.5a2.25 2.25 0 0 1 2.25 2.25V5h3.75a.75.75 0 0 1 0 1.5h-.75V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V6.5h-.75a.75.75 0 0 1 0-1.5H7.5v-.75c0-.597.237-1.169.659-1.591ZM6 6.5V20h12V6.5H6ZM15 5H9v-.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75V5ZM9.75 9.5a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Zm3.75.75a.75.75 0 0 1 1.5 0v6a.75.75 0 0 1-1.5 0v-6Z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                  )}
                  <FieldArray
                    name="CONG_CA"
                    render={arrayHelpers => (
                      <div className="border rounded p-20px">
                        <div>
                          <input
                            type="text"
                            className="form-control form-control-solid h-[45px]"
                            placeholder="Nhập tên loại ca làm việc"
                            value={textAdd}
                            onChange={e => setTextAdd(e.target.value)}
                          />
                        </div>
                        <button
                          type="button"
                          className="btn fw-500 btn-success w-100 mt-15px"
                          onClick={() => {
                            if (textAdd) {
                              arrayHelpers.push({
                                ID: uuid(),
                                Name: textAdd,
                                Days: getInitial()
                              })
                              setTextAdd('')
                            } else {
                              window.top?.toastr &&
                                window.top?.toastr.error(
                                  'Vui lòng nhập loại ca.',
                                  '',
                                  {
                                    timeOut: 2000
                                  }
                                )
                            }
                          }}
                        >
                          Thêm mới
                        </button>
                        <div
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
                            Khi không tìm thấy loại ca làm việc, bạn có thể thêm
                            mới.
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>
                <div className="flex-1 pl-20px">
                  <FieldArray
                    name="CONG_CA"
                    render={arrayHelpers => (
                      <div className="border rounded p-20px">
                        {values.CONG_CA &&
                          values.CONG_CA.length > 0 &&
                          values.CONG_CA.map((item, index) => (
                            <div
                              className={clsx(
                                indexActive !== index && 'hidden'
                              )}
                              key={index}
                            >
                              <div className="text-3xl mb-8 font-bold">
                                {item.Name}
                              </div>
                              <FieldArray
                                name={`CONG_CA[${index}].Days`}
                                render={daysHelpers => (
                                  <div>
                                    {values.CONG_CA[index].Days.map(
                                      (day, i) => (
                                        <div
                                          className="d-flex mb-4 last:!mb-0"
                                          key={i}
                                        >
                                          <div className="flex items-center h-[42px]">
                                            <label className="checkbox checkbox-lg">
                                              <input
                                                type="checkbox"
                                                checked={!day.isOff}
                                                name={`CONG_CA[${index}].Days[${i}.isOff]`}
                                                onChange={() =>
                                                  setFieldValue(
                                                    `CONG_CA[${index}].Days[${i}.isOff]`,
                                                    !day.isOff
                                                  )
                                                }
                                                onBlur={handleBlur}
                                              />
                                              <span></span>
                                            </label>
                                          </div>
                                          <div className="flex-1 flex flex-col justify-between pl-15px">
                                            <div className="font-bold capitalize">
                                              {day.Title}
                                            </div>
                                            <div className="leading-4 text-[13px] text-[#878c93]">
                                              {getTotalTime(day)}
                                            </div>
                                          </div>
                                          <div className="d-flex align-items-center px-15px w-[450px]">
                                            {day.isOff && (
                                              <div className="text-muted">
                                                Không có ca
                                              </div>
                                            )}
                                            {!day.isOff && (
                                              <>
                                                <div className="position-relative">
                                                  <ReactDatePicker
                                                    className="form-control"
                                                    selected={
                                                      day.TimeFrom
                                                        ? moment(
                                                            day.TimeFrom,
                                                            'HH:mm'
                                                          ).toDate()
                                                        : null
                                                    }
                                                    onChange={val =>
                                                      setFieldValue(
                                                        `CONG_CA[${index}].Days[${i}].TimeFrom`,
                                                        val
                                                          ? moment(val).format(
                                                              'HH:mm'
                                                            )
                                                          : ''
                                                      )
                                                    }
                                                    timeCaption="Thời gian"
                                                    showTimeSelect
                                                    timeFormat="HH:mm"
                                                    timeIntervals={5}
                                                    showTimeSelectOnly
                                                    dateFormat="HH:mm"
                                                  />
                                                  <div className="position-absolute right-0 top-0 h-100 w-40px d-flex justify-content-center pointer-events-none">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      fill="none"
                                                      viewBox="0 0 24 24"
                                                      strokeWidth="1.5"
                                                      stroke="currentColor"
                                                      aria-hidden="true"
                                                      className="w-18px"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                                      />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="w-40px text-center">
                                                  -
                                                </div>
                                                <div className="position-relative">
                                                  <ReactDatePicker
                                                    className="form-control"
                                                    selected={
                                                      day.TimeTo
                                                        ? moment(
                                                            day.TimeTo,
                                                            'HH:mm'
                                                          ).toDate()
                                                        : null
                                                    }
                                                    onChange={val =>
                                                      setFieldValue(
                                                        `CONG_CA[${index}].Days[${i}].TimeTo`,
                                                        val
                                                          ? moment(val).format(
                                                              'HH:mm'
                                                            )
                                                          : ''
                                                      )
                                                    }
                                                    timeCaption="Thời gian"
                                                    showTimeSelect
                                                    timeFormat="HH:mm"
                                                    timeIntervals={5}
                                                    showTimeSelectOnly
                                                    dateFormat="HH:mm"
                                                  />
                                                  <div className="position-absolute right-0 top-0 h-100 w-40px d-flex justify-content-center pointer-events-none">
                                                    <svg
                                                      xmlns="http://www.w3.org/2000/svg"
                                                      fill="none"
                                                      viewBox="0 0 24 24"
                                                      strokeWidth="1.5"
                                                      stroke="currentColor"
                                                      aria-hidden="true"
                                                      className="w-18px"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                                      />
                                                    </svg>
                                                  </div>
                                                </div>
                                                <div className="ml-3 position-relative w-[200px]">
                                                  <div className="input-group">
                                                    <div className="input-group-prepend">
                                                      <span
                                                        className="input-group-text"
                                                        style={{
                                                          height: '100%',
                                                          borderTopRightRadius: 0,
                                                          borderBottomRightRadius: 0,
                                                          fontSize: 13,
                                                          border:
                                                            '1px solid #e4e6ef',
                                                          color: '#3F4254'
                                                        }}
                                                      >
                                                        Số công
                                                      </span>
                                                    </div>
                                                    <NumericFormat
                                                      allowNegative
                                                      className="form-control text-center"
                                                      placeholder="Số công"
                                                      name={`CONG_CA[${index}].Days[${i}].Value`}
                                                      value={day.Value}
                                                      onValueChange={({
                                                        value,
                                                        floatValue
                                                      }) => {
                                                        setFieldValue(
                                                          `CONG_CA[${index}].Days[${i}].Value`,
                                                          floatValue
                                                        )
                                                      }}
                                                      allowLeadingZeros={true}
                                                    />
                                                  </div>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                          <div className="w-50px d-flex justify-content-center">
                                            {!day.isOff && (
                                              <button
                                                type="button"
                                                className="rounded-full border-0 bg-transparent w-[42px] hover:!bg-[#f1f1f1] transition"
                                                onClick={() =>
                                                  setFieldValue(
                                                    `CONG_CA[${index}].Days[${i}.isOff]`,
                                                    !day.isOff
                                                  )
                                                }
                                              >
                                                <svg
                                                  className="w-24px"
                                                  fill="currentColor"
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  viewBox="0 0 24 24"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M8.159 2.659A2.25 2.25 0 0 1 9.75 2h4.5a2.25 2.25 0 0 1 2.25 2.25V5h3.75a.75.75 0 0 1 0 1.5h-.75V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20V6.5h-.75a.75.75 0 0 1 0-1.5H7.5v-.75c0-.597.237-1.169.659-1.591ZM6 6.5V20h12V6.5H6ZM15 5H9v-.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75V5ZM9.75 9.5a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Zm3.75.75a.75.75 0 0 1 1.5 0v6a.75.75 0 0 1-1.5 0v-6Z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              />
                            </div>
                          ))}
                        {(!values.CONG_CA || values.CONG_CA.length === 0) && (
                          <div>
                            Bạn chưa có nhóm ca làm việc. Vui lòng thêm mới!
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              <div
                className={clsx(
                  'overlay-layer bg-dark-o-10 absolute top-0 left-0 w-full h-full flex items-center justify-center',
                  isLoading ? 'visible' : 'invisible'
                )}
              >
                <div className="spinner spinner-primary"></div>
              </div>
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

export default ShiftWorks
