import clsx from 'clsx'
import { FieldArray, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { Table } from 'react-bootstrap'
import { useMutation, useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import moreApi from 'src/api/more.api'
import { NumericFormat } from 'react-number-format'

function PayOffPage(props) {
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState({
    list: []
  })

  const { isLoading } = useQuery({
    queryKey: ['congcaconfig'],
    queryFn: async () => {
      const { data } = await moreApi.getNameConfig('congcaconfig')
      return data?.data || []
    },
    onSettled: data => {
      if (data && data.length > 0) {
        let result = data[0].Value
          ? JSON.parse(data[0].Value)
          : {
              DI_SOM: [],
              DI_MUON: [],
              VE_SOM: [],
              VE_MUON: []
            }
        setInitialValues({
          DI_SOM: result?.DI_SOM || [],
          DI_MUON: result?.DI_MUON || [],
          VE_SOM: result?.VE_SOM || [],
          VE_MUON: result?.VE_MUON || []
        })
      }
    }
  })

  const savePayOffMutation = useMutation({
    mutationFn: body => moreApi.saveConfigName(body)
  })

  const onSubmit = values => {
    savePayOffMutation.mutate(
      {
        name: 'congcaconfig',
        data: values
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

  const getByName = name => {
    switch (name) {
      case 'DI_SOM':
        return 'Cấu hình đi sớm'
      case 'DI_MUON':
        return 'Cấu hình đi muộn'
      case 'VE_SOM':
        return 'Cấu hình về sớm'
      case 'VE_MUON':
        return 'Cấu hình về muộn'
      default:
    }
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
                      Thưởng phạt
                    </div>
                  </div>
                </h3>
                <button
                  type="submit"
                  className="btn fw-500 btn-primary"
                  disabled={savePayOffMutation.isLoading}
                >
                  {savePayOffMutation.isLoading && (
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
              <div className="max-w-[900px] mx-auto">
                {Object.keys(values).map((item, index) => (
                  <div
                    className="!border border-solid border-[#f4f4f4] !rounded !mb-4 last:!mb-0 shadow-sm"
                    key={index}
                  >
                    <div className="!p-5 !border-b !border-t-0 !border-l-0 border-r-0 border-solid border-[#f4f4f4] font-semibold text-lg">
                      {getByName(item)}
                    </div>
                    <div className="!p-5">
                      <Table responsive bordered className="mb-0">
                        <thead>
                          <tr>
                            <th className="text-center !px-3 py-3 min-w-[55px]">
                              STT
                            </th>
                            <th className="!px-3 py-3 min-w-[180px]">
                              Từ (Phút)
                            </th>
                            <th className="!px-3 py-3 min-w-[180px]">
                              Đến (Phút)
                            </th>
                            <th className="!px-3 py-3 min-w-[180px]">
                              Giá trị
                            </th>
                            <th className="text-center !px-3 py-3 w-[90px] min-w-[90px]">
                              #
                            </th>
                          </tr>
                        </thead>
                        <FieldArray
                          name={item}
                          render={arrayHelpers => (
                            <tbody>
                              {values[item] &&
                                values[item].length > 0 &&
                                values[item].map((x, i) => (
                                  <tr key={i}>
                                    <td className="align-middle text-center !px-3 py-3">
                                      {i + 1}
                                    </td>
                                    <td className="!px-3 py-3">
                                      <NumericFormat
                                        name="FromMinute"
                                        value={x.FromMinute}
                                        className="form-control"
                                        placeholder="Nhập số phút"
                                        onValueChange={val =>
                                          setFieldValue(
                                            `${item}[${i}].FromMinute`,
                                            val.floatValue
                                              ? val.floatValue
                                              : val.value
                                          )
                                        }
                                        autoComplete="off"
                                      />
                                    </td>
                                    <td className="!px-3 py-3">
                                      <NumericFormat
                                        name="ToMinute"
                                        value={x.ToMinute}
                                        className="form-control"
                                        type="text"
                                        placeholder="Nhập số phút"
                                        onValueChange={val =>
                                          setFieldValue(
                                            `${item}[${i}].ToMinute`,
                                            val.floatValue
                                              ? val.floatValue
                                              : val.value
                                          )
                                        }
                                        autoComplete="off"
                                      />
                                    </td>
                                    <td className="!px-3 py-3">
                                      <NumericFormat
                                        name="Value"
                                        value={x.Value}
                                        className="form-control"
                                        type="text"
                                        placeholder="Nhập giá trị"
                                        onValueChange={val =>
                                          setFieldValue(
                                            `${item}[${i}].Value`,
                                            val.floatValue
                                              ? val.floatValue
                                              : val.value
                                          )
                                        }
                                        autoComplete="off"
                                        allowLeadingZeros
                                        thousandSeparator={true}
                                        //allowNegative={false}
                                      />
                                    </td>
                                    <td className="align-middle text-center !px-3 py-3">
                                      <button
                                        type="button"
                                        className="btn btn-success btn-xs w-[30px] h-[30px] mr-1.5"
                                        onClick={() =>
                                          arrayHelpers.push({
                                            FromMinute: '',
                                            ToMinute: '',
                                            Value: ''
                                          })
                                        }
                                      >
                                        <i className="fa fa-plus"></i>
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-danger btn-xs w-[30px] h-[30px]"
                                        onClick={() => arrayHelpers.remove(i)}
                                      >
                                        <i className="fa fa-trash"></i>
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              {(!values[item] || values[item].length === 0) && (
                                <tr>
                                  <td
                                    className="text-center !px-3 py-5"
                                    colSpan={5}
                                  >
                                    <div className="mb-3.5">
                                      Chưa có cấu hình
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-success btn-xs h-[30px]"
                                      onClick={() =>
                                        arrayHelpers.push({
                                          FromMinute: '',
                                          ToMinute: '',
                                          Value: ''
                                        })
                                      }
                                    >
                                      <i className="fa fa-plus mr-1.5"></i> Tạo
                                      cấu hình
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          )}
                        />
                      </Table>
                    </div>
                    <div className="flex justify-end px-20px pb-20px">
                      <button
                        type="submit"
                        className="btn fw-500 btn-primary"
                        disabled={savePayOffMutation.isLoading}
                      >
                        {savePayOffMutation.isLoading && (
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
                ))}
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

export default PayOffPage
