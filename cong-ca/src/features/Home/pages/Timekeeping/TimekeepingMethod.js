import { FieldArray, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import worksheetApi from 'src/api/worksheet.api'

function TimekeepingMethod(props) {
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState({
    updated: []
  })

  let { StockRights } = useSelector(({ auth }) => ({
    StockRights: auth?.Info?.rightsSum?.cong_ca?.stocks || []
  }))
  const { isLoading, refetch } = useQuery({
    queryKey: ['ListStocks', StockRights],
    queryFn: async () => {
      const { data } = await worksheetApi.getStocks()
      return data?.data?.all
        ? data?.data?.all
            .filter(x => x.ParentID !== 0)
            .filter(x => StockRights.some(o => o.ID === x.ID))
        : []
    },
    onSuccess: data => {
      if (data) {
        setInitialValues(prevState => ({
          ...prevState,
          updated: data.map(x => ({
            ID: x.ID,
            Lat: x.Lat || '',
            Lng: x.Lng || '',
            WifiName: x.WifiName || '',
            WifiID: x.WifiID || '',
            Title: x.Title
          }))
        }))
      }
    },
    enabled: Boolean(StockRights && StockRights.length > 0)
  })

  const updateMutation = useMutation({
    mutationFn: body => worksheetApi.updateLatLng(body)
  })

  const onSubmit = values => {
    updateMutation.mutate(
      {
        ...values,
        updated: values.updated.map(x => ({
          ID: x.ID,
          Lat: x.Lat || 0,
          Lng: x.Lng || 0,
          WifiName: x.WifiName || '',
          WifiID: x.WifiID || ''
        }))
      },
      {
        onSuccess: () => {
          refetch(() => {
            window.top.toastr &&
              window.top.toastr.success('Cập nhập thành công.', {
                timeOut: 1500
              })
          })
        }
      }
    )
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {formikProps => {
        // errors, touched, handleChange, handleBlur
        const { values, setFieldValue } = formikProps

        return (
          <Form className="h-100 card" autoComplete="off">
            <div className="card-header d-block p-20px !min-h-[75px] !md-min-h-[125px]">
              <div className="d-flex justify-content-between">
                <h3 className="text-uppercase">
                  <div className="d-flex align-items-baseline">
                    <div
                      className="cursor-pointer d-flex"
                      onClick={() => navigate('/')}
                    >
                      <div className="w-20px">
                        <i className="ml-0 fa-regular fa-chevron-left vertical-align-middle text-muted"></i>
                      </div>
                      Phương thức chấm công
                    </div>
                  </div>
                </h3>
                <button
                  type="submit"
                  className="btn fw-500 btn-primary"
                  disabled={updateMutation.isLoading}
                >
                  {updateMutation.isLoading && (
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
            <div className="relative overflow-auto card-body p-20px">
              {!isLoading && (
                <div className="max-w-[900px] mx-auto">
                  <FieldArray
                    name="updated"
                    render={arrayHelpers => (
                      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                        {values.updated &&
                          values.updated.length > 0 &&
                          values.updated.map((item, index) => (
                            <div
                              className="border rounded shadow-sm"
                              key={index}
                            >
                              <div
                                className="uppercase font-bold text-lg px-4 py-3"
                                style={{
                                  borderBottom: '1px solid #ebedf3'
                                }}
                              >
                                {item.Title}
                              </div>
                              <div className="p-4">
                                <div className="mb-3">
                                  <div className="text-[13px] text-muted mb-px">
                                    Latitude
                                  </div>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name={`updated[${index}].Lat`}
                                    onChange={e =>
                                      setFieldValue(
                                        `updated[${index}].Lat`,
                                        e.target.value
                                      )
                                    }
                                    value={item.Lat}
                                  />
                                </div>
                                <div className="mb-3">
                                  <div className="text-[13px] text-muted mb-px">
                                    Longitude
                                  </div>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name={`updated[${index}].Lng`}
                                    onChange={e =>
                                      setFieldValue(
                                        `updated[${index}].Lng`,
                                        e.target.value
                                      )
                                    }
                                    value={item.Lng}
                                  />
                                </div>
                                <div className="mb-3">
                                  <div className="text-[13px] text-muted mb-px">
                                    Tên Wifi
                                  </div>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name={`updated[${index}].WifiName`}
                                    onChange={e =>
                                      setFieldValue(
                                        `updated[${index}].WifiName`,
                                        e.target.value
                                      )
                                    }
                                    value={item.WifiName}
                                  />
                                </div>
                                <div>
                                  <div className="text-[13px] text-muted mb-px">
                                    ID Wifi
                                  </div>
                                  <input
                                    className="form-control"
                                    type="text"
                                    name={`updated[${index}].WifiID`}
                                    onChange={e =>
                                      setFieldValue(
                                        `updated[${index}].WifiID`,
                                        e.target.value
                                      )
                                    }
                                    value={item.WifiID}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  />
                </div>
              )}

              {isLoading && (
                <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="text-gray-200 w-9 h-9 animate-spin dark:text-gray-300 fill-primary"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          </Form>
        )
      }}
    </Formik>
  )
}

export default TimekeepingMethod
