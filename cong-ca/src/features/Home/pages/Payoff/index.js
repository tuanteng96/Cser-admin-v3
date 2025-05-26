import clsx from 'clsx'
import { FieldArray, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap'
import { useMutation, useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import moreApi from 'src/api/more.api'
import { NumericFormat } from 'react-number-format'
import PickerReward from '../../components/Picker/PickerReward'
import { PriceHelper } from 'src/helpers/PriceHelper'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { createPortal } from 'react-dom'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'

let OptionsMethod = [
  {
    label: '{UNIT} mỗi phút {GT}',
    value: 'MOI_PHUT'
  },
  {
    label: '{UNIT} theo ngưỡng {GT}',
    value: 'PHAT_THEO_NGUONG'
  }
]

let initialValueOption = {
  Type: 'MOI_PHUT',
  Options: [
    {
      FromMinute: 0,
      ToMinute: 1440,
      Value: '',
      Method: ''
    }
  ]
}

function PickerImages({ children, Src }) {
  const [visible, setVisible] = useState(false)
  const onHide = () => setVisible(false)
  return (
    <>
      {children({
        open: () => setVisible(true)
      })}
      {visible &&
        createPortal(
          <>
            <div class="mfp-bg mfp-img-mobile mfp-ready" onClick={onHide}></div>
            <div
              className="mfp-wrap mfp-close-btn-in mfp-img-mobile mfp-ready"
              onClick={onHide}
            >
              <div className="mfp-container mfp-image-holder mfp-s-ready">
                <div className="h-full mfp-content">
                  <div className="h-full mfp-figure">
                    <button
                      onClick={onHide}
                      title="Close (Esc)"
                      type="button"
                      className="mfp-close"
                    >
                      ×
                    </button>
                    <figure className="h-full">
                      <img
                        onClick={e => e.stopPropagation()}
                        className="!h-full mfp-img"
                        alt=""
                        src={AssetsHelpers.toAbsoluteUrl(
                          Src + '?' + new Date().getTime()
                        )}
                        //style={{ maxHeight: '90%' }}
                      />
                    </figure>
                  </div>
                </div>
                <div className="mfp-preloader">Loading...</div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  )
}

function PayOffPage(props) {
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState({
    DI_SOM: initialValueOption,
    DI_MUON: initialValueOption,
    VE_SOM: initialValueOption,
    VE_MUON: initialValueOption
  })
  const [active, setActive] = useState('DI_MUON')

  const { isLoading, refetch, data } = useQuery({
    queryKey: ['congcaconfig'],
    queryFn: async () => {
      const { data } = await moreApi.getNameConfig('congcaconfig')
      return data?.data && data?.data.length > 0 ? data?.data[0] : []
    },
    onSettled: data => {
      if (data) {
        let result = data.Value
          ? JSON.parse(data.Value)
          : {
              DI_SOM: initialValueOption,
              DI_MUON: initialValueOption,
              VE_SOM: initialValueOption,
              VE_MUON: initialValueOption
            }

        setInitialValues({
          DI_SOM:
            Array.isArray(result?.DI_SOM) && result?.DI_SOM.length > 0
              ? mapOptions(result?.DI_SOM)
              : initialValueOption,
          DI_MUON:
            Array.isArray(result?.DI_MUON) && result?.DI_MUON.length > 0
              ? mapOptions(result?.DI_MUON)
              : initialValueOption,
          VE_SOM:
            Array.isArray(result?.VE_SOM) && result?.VE_SOM.length > 0
              ? mapOptions(result?.VE_SOM)
              : initialValueOption,
          VE_MUON:
            Array.isArray(result?.VE_MUON) && result?.VE_MUON.length > 0
              ? mapOptions(result?.VE_MUON)
              : initialValueOption
        })
      }
    }
  })

  const mapOptions = arr => {
    let obj = {
      Type: '',
      Options: []
    }
    if (arr && arr.length > 0) {
      let isType = arr.some(x => typeof x.Method === 'undefined')
      if (isType) {
        obj.Type = 'PHAT_THEO_NGUONG'
      } else {
        obj.Type = arr[0].Method
      }
      for (let key of arr) {
        let newKey = { ...key }
        if (key.Method === 'MOI_PHUT') {
          newKey.Value = newKey.Value * -1
        }
        obj.Options.push(newKey)
      }
    } else {
      obj = {
        Type: 'MOI_PHUT',
        Options: [
          {
            FromMinute: 0,
            ToMinute: 1440,
            Value: '',
            Method: ''
          }
        ]
      }
    }
    return obj
  }

  const savePayOffMutation = useMutation({
    mutationFn: async body => {
      let rs = await moreApi.saveConfigName(body)
      await refetch()
      return rs
    }
  })

  const onSubmit = values => {
    let newValues = {}
    for (const obj in values) {
      newValues[obj] = values[obj].Options.map(x => ({
        ...x,
        Value: values[obj].Type === 'MOI_PHUT' ? x.Value * -1 : x.Value,
        Method: values[obj].Type
      })).filter(
        x => x.Value !== '' && x.FromMinute !== '' && x.ToMinute !== ''
      )
    }

    savePayOffMutation.mutate(
      {
        name: 'congcaconfig',
        data: newValues
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
        return 'Tăng ca đi sớm'
      case 'DI_MUON':
        return 'Phạt đi muộn'
      case 'VE_SOM':
        return 'Phạt về sớm'
      case 'VE_MUON':
        return 'Tăng ca về muộn'
      default:
    }
  }

  const getByNameVi = name => {
    switch (name) {
      case 'DI_SOM':
        return 'đi sớm'
      case 'DI_MUON':
        return 'đi muộn'
      case 'VE_SOM':
        return 'về sớm'
      case 'VE_MUON':
        return 'về muộn'
      default:
    }
  }

  const renderNote = ({ Name, Item }) => {
    let text = ''
    let note = ''

    switch (Name) {
      case 'DI_SOM':
        if (Item.Value > 100) {
          note = `Được cộng tiền = ${PriceHelper.formatVND(Item.Value)}`
        } else if (Item.Value <= 100 && Item.Value >= 0) {
          note = `Được cộng tiền = ${Item.Value} lần lương 1 giờ`
        } else if (Item.Value === -60) {
          note = `Được cộng tiền = Số phút vênh x ( Lương cơ bản / 60 phút )`
        } else if (Item.Value < 0 && Item.Value >= -10) {
          note = `Được + ${Item.Value * -1} công`
        } else {
          note = `Được cộng tiền = Số phút vênh x ${PriceHelper.formatVNDPositive(
            Item.Value
          )}`
        }
        text = `Đi sớm từ ${Item.FromMinute} - ${Item.ToMinute} Phút : ${note}`
        break
      case 'DI_MUON':
        if (Item.Value > 100) {
          note = `Bị trừ ${PriceHelper.formatVND(Item.Value)}`
        } else if (Item.Value <= 100 && Item.Value >= 0) {
          note = `Bị trừ ${Item.Value} lần lương 1 giờ`
        } else if (Item.Value === -60) {
          note = `Bị trừ tiền = Số phút vênh x ( Lương cơ bản / 60 phút )`
        } else if (Item.Value < 0 && Item.Value >= -10) {
          note = `Trừ + ${Item.Value * -1} công`
        } else {
          note = `Bị trừ tiền = Số phút vênh x ${PriceHelper.formatVNDPositive(
            Item.Value
          )}`
        }
        text = `Đi muộn từ ${Item.FromMinute} - ${Item.ToMinute} Phút : ${note}`
        break
      case 'VE_SOM':
        if (Item.Value > 100) {
          note = `Bị trừ ${PriceHelper.formatVND(Item.Value)}`
        } else if (Item.Value <= 100 && Item.Value >= 0) {
          note = `Bị trừ ${Item.Value} lần lương 1 giờ`
        } else if (Item.Value === -60) {
          note = `Bị trừ tiền = Số phút vênh x ( Lương cơ bản / 60 phút )`
        } else if (Item.Value < 0 && Item.Value >= -10) {
          note = `Trừ + ${Item.Value * -1} công`
        } else {
          note = `Bị trừ tiền = Số phút vênh x ${PriceHelper.formatVNDPositive(
            Item.Value
          )}`
        }
        text = `Về sớm từ ${Item.FromMinute} - ${Item.ToMinute} Phút : ${note}`
        break
      case 'VE_MUON':
        if (Item.Value > 100) {
          note = `Được cộng tiền = ${PriceHelper.formatVND(Item.Value)}`
        } else if (Item.Value <= 100 && Item.Value >= 0) {
          note = `Được cộng tiền = ${Item.Value} lần lương 1 giờ`
        } else if (Item.Value === -60) {
          note = `Được cộng tiền = Số phút vênh x ( Lương cơ bản / 60 phút )`
        } else if (Item.Value < 0 && Item.Value >= -10) {
          note = `Được + ${Item.Value * -1} công`
        } else {
          note = `Được cộng tiền = Số phút vênh x ${PriceHelper.formatVNDPositive(
            Item.Value
          )}`
        }
        text = `Về muộn từ ${Item.FromMinute} - ${Item.ToMinute} Phút : ${note}`
        break
    }
    return <div>{text}</div>
  }

  const getUnit = name => {
    if (name === 'DI_SOM' || name === 'VE_MUON') {
      return 'Thưởng'
    }
    return 'Phạt'
  }

  const onChangeTab = (key, values) => {
    let result = data?.Value
      ? JSON.parse(data.Value)
      : {
          DI_SOM: initialValueOption,
          DI_MUON: initialValueOption,
          VE_SOM: initialValueOption,
          VE_MUON: initialValueOption
        }
        
    result = {
      DI_SOM:
        Array.isArray(result?.DI_SOM) && result?.DI_SOM.length > 0
          ? mapOptions(result?.DI_SOM)
          : initialValueOption,
      DI_MUON:
        Array.isArray(result?.DI_MUON) && result?.DI_MUON.length > 0
          ? mapOptions(result?.DI_MUON)
          : initialValueOption,
      VE_SOM:
        Array.isArray(result?.VE_SOM) && result?.VE_SOM.length > 0
          ? mapOptions(result?.VE_SOM)
          : initialValueOption,
      VE_MUON:
        Array.isArray(result?.VE_MUON) && result?.VE_MUON.length > 0
          ? mapOptions(result?.VE_MUON)
          : initialValueOption
    }
    
    if (
      JSON.stringify({
        ...result[active],
        Options: result[active].Options.filter(
          x => x.Value !== '' && x.FromMinute !== '' && x.ToMinute !== ''
        )
      }) ===
      JSON.stringify({
        ...values[active],
        Options: values[active].Options.filter(
          x => x.Value !== '' && x.FromMinute !== '' && x.ToMinute !== ''
        ).map(x => ({
          ...x,
          //Value: x.Value > 0 && x.Method === 'MOI_PHUT' ? x.Value * -1 : x.Value
        }))
      })
    ) {
      setActive(key)
    } else {
      Swal.fire({
        title: 'Xác nhận lưu thay đổi ?',
        text: `Bạn có muốn thực hiện lưu thay đổi tại cấu hình ${getByName(
          active
        )}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        //cancelButtonColor: '#d33',
        confirmButtonText: 'Lưu thay đổi',
        cancelButtonText: 'Không lưu',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          let newValues = {}
          for (const obj in values) {
            newValues[obj] = values[obj].Options.map(x => ({
              ...x,
              Value: values[obj].Type === 'MOI_PHUT' ? x.Value * -1 : x.Value,
              Method: values[obj].Type
            })).filter(
              x => x.Value !== '' && x.FromMinute !== '' && x.ToMinute !== ''
            )
          }
          let rs = await savePayOffMutation.mutateAsync({
            name: 'congcaconfig',
            data: newValues
          })
          return rs
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then(result => {
        if (result.isConfirmed) {
        } else {
          refetch()
        }
        setActive(key)
      })
    }
  }

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      key={Date.now()}
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

            <div className="relative flex p-0 card-body h-[calc(100%-75px)]">
              <div className="border-r border-[#ebedf3] border-solid border-t-0 border-l-0 border-b-0 w-56 px-3 py-4">
                <div className="mb-2 last:mb-0">
                  <div className="font-bold font-inter text-[17px] py-2 px-4">
                    Phạt
                  </div>
                  <ul className="p-0 m-0 list-none">
                    {[
                      {
                        Key: 'DI_MUON',
                        Title: 'Đi muộn'
                      },
                      {
                        Key: 'VE_SOM',
                        Title: 'Về sớm'
                      }
                    ].map((x, i) => (
                      <li key={i}>
                        <a
                          onClick={() => {
                            onChangeTab(x.Key, values)
                          }}
                          className={clsx(
                            'no-underline block px-4 py-[11px] text-[14px] rounded-md font-medium hover:bg-[#e2f0ff] hover:text-primary transition mt-1 cursor-pointer',
                            active === x.Key
                              ? 'text-primary bg-[#e2f0ff]'
                              : 'text-[#222]'
                          )}
                          //href="javascript:;"
                        >
                          {x.Title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2 last:mb-0">
                  <div className="font-bold font-inter text-[17px] py-2 px-4">
                    Thưởng
                  </div>
                  <ul className="p-0 m-0 list-none">
                    {[
                      {
                        Key: 'DI_SOM',
                        Title: 'Tăng ca đi sớm'
                      },
                      {
                        Key: 'VE_MUON',
                        Title: 'Tăng ca về muộn'
                      }
                    ].map((x, i) => (
                      <li key={i}>
                        <a
                          onClick={() => {
                            onChangeTab(x.Key, values)
                          }}
                          className={clsx(
                            'no-underline block px-4 py-[11px] text-[14px] rounded-md font-medium hover:bg-[#e2f0ff] hover:text-primary transition mt-1 cursor-pointer',
                            active === x.Key
                              ? 'text-primary bg-[#e2f0ff]'
                              : 'text-[#222]'
                          )}
                          //href="javascript:;"
                        >
                          {x.Title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-20px">
                <div className="max-w-[1200px] w-full">
                  {Object.keys(values)
                    .filter(x => x === active)
                    .map((item, index) => (
                      <div key={index}>
                        <div className="!p-5 font-semibold text-lg uppercase">
                          {getByName(item)}
                        </div>
                        <div className="!px-5 !py-0">
                          {OptionsMethod.map((method, index) => (
                            <div
                              className="border border-[#efefef] rounded mb-3 last:!mb-0 overflow-hidden"
                              key={index}
                            >
                              <div
                                className="bg-gray-100 p-[16px] cursor-pointer flex items-center gap-3"
                                onClick={() => {
                                  setFieldValue(`${item}.Type`, method.value)
                                  setFieldValue(`${item}.Options`, [
                                    {
                                      FromMinute:
                                        method.value === 'MOI_PHUT' ? 0 : '',
                                      ToMinute:
                                        method.value === 'MOI_PHUT' ? 1440 : '',
                                      Value: '',
                                      Method: ''
                                    }
                                  ])
                                }}
                              >
                                <label className="inline-flex items-center">
                                  <div
                                    className={clsx(
                                      "relative w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
                                      values[item]?.Type === method.value
                                        ? 'after:translate-x-full bg-primary'
                                        : 'bg-gray-200'
                                    )}
                                  />
                                </label>
                                <div className="text-base font-medium">
                                  {method.label
                                    .replaceAll('{GT}', getByNameVi(item))
                                    .replaceAll('{UNIT}', getUnit(item))}
                                </div>
                              </div>
                              {values[item]?.Type === method.value && (
                                <div>
                                  {values[item]?.Type === 'MOI_PHUT' ? (
                                    <div className="p-[16px]">
                                      <div className="grid grid-cols-2 gap-4 max-w-[900px] w-full">
                                        <div className="flex items-center gap-3">
                                          <div className='capitalize'>{getByNameVi(item)} từ phút thứ</div>
                                          <div className="relative flex-1">
                                            <NumericFormat
                                              name="FromMinute"
                                              value={
                                                values[item].Options[0]
                                                  .FromMinute
                                              }
                                              className="form-control"
                                              placeholder="Nhập số phút"
                                              onValueChange={val =>
                                                setFieldValue(
                                                  `${item}.Options[0].FromMinute`,
                                                  val.floatValue
                                                    ? val.floatValue
                                                    : val.value
                                                )
                                              }
                                              autoComplete="off"
                                            />
                                            <div className="absolute top-0 right-0 flex items-center justify-center w-16 h-full pointer-events-none text-muted">
                                              Phút
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <div>Giá trị {getUnit(item)} trên mỗi phút</div>
                                          <NumericFormat
                                            name="Value"
                                            value={
                                              values[item].Options[0].Value
                                            }
                                            className="flex-1 w-full form-control"
                                            type="text"
                                            placeholder="Nhập giá trị"
                                            onValueChange={val =>
                                              setFieldValue(
                                                `${item}.Options[0].Value`,
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
                                          {/* <div className="bg-[#f2f2f2] flex rounded p-1">
                                          <div className="flex items-center justify-center h-full">
                                            VNĐ
                                          </div>
                                          <div className="flex items-center justify-center h-full">
                                            CÔNG
                                          </div>
                                        </div> */}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <Table responsive bordered className="mb-0">
                                      <thead>
                                        <tr>
                                          <th className="text-center !px-3 py-3 min-w-[55px] w-[55px] max-w-[55px]">
                                            STT
                                          </th>
                                          <th className="!px-3 py-3 min-w-[250px] w-[250px]">
                                            {getByNameVi(item)} Từ (Phút)
                                          </th>
                                          <th className="!px-3 py-3 min-w-[250px] w-[250px]">
                                            {getByNameVi(item)} Đến (Phút)
                                          </th>
                                          <th className="!px-3 py-3 min-w-[180px]">
                                            Giá trị {getUnit(item)}
                                          </th>
                                          <th className="text-center !px-3 py-3 w-[90px] min-w-[90px]">
                                            #
                                          </th>
                                        </tr>
                                      </thead>
                                      <FieldArray
                                        name={`${item}.Options`}
                                        render={arrayHelpers => (
                                          <tbody>
                                            {values[item].Options.map(
                                              (x, i) => (
                                                <tr key={i}>
                                                  <td
                                                    className={clsx(
                                                      'align-middle text-center !px-3 py-3'
                                                    )}
                                                  >
                                                    {i + 1}
                                                  </td>
                                                  <td className="align-middle !px-3 py-3">
                                                    <NumericFormat
                                                      name="FromMinute"
                                                      value={x.FromMinute}
                                                      className="form-control"
                                                      placeholder="Nhập số phút"
                                                      onValueChange={val =>
                                                        setFieldValue(
                                                          `${item}.Options[${i}].FromMinute`,
                                                          val.floatValue
                                                            ? val.floatValue
                                                            : val.value
                                                        )
                                                      }
                                                      autoComplete="off"
                                                    />
                                                  </td>
                                                  <td className="align-middle !px-3 py-3">
                                                    <NumericFormat
                                                      name="ToMinute"
                                                      value={x.ToMinute}
                                                      className="form-control"
                                                      type="text"
                                                      placeholder="Nhập số phút"
                                                      onValueChange={val =>
                                                        setFieldValue(
                                                          `${item}.Options[${i}].ToMinute`,
                                                          val.floatValue
                                                            ? val.floatValue
                                                            : val.value
                                                        )
                                                      }
                                                      autoComplete="off"
                                                    />
                                                  </td>
                                                  <td className="align-middle !px-3 py-3">
                                                    <NumericFormat
                                                      name="Value"
                                                      value={x.Value}
                                                      className="form-control"
                                                      type="text"
                                                      placeholder="Nhập giá trị"
                                                      onValueChange={val =>
                                                        setFieldValue(
                                                          `${item}.Options[${i}].Value`,
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
                                                      disabled={
                                                        values[item].Options
                                                          .length === 1 &&
                                                        x.FromMinute === '' &&
                                                        x.ToMinute === '' &&
                                                        x.Value === ''
                                                      }
                                                      type="button"
                                                      className="btn btn-danger btn-xs w-[30px] h-[30px] disabled:opacity-30"
                                                      onClick={() => {
                                                        if (
                                                          values[item].Options
                                                            .length === 1
                                                        ) {
                                                          setFieldValue(
                                                            `${item}.Options`,
                                                            [
                                                              {
                                                                FromMinute: '',
                                                                ToMinute: '',
                                                                Value: '',
                                                                Method: ''
                                                              }
                                                            ]
                                                          )
                                                        } else {
                                                          arrayHelpers.remove(i)
                                                        }
                                                      }}
                                                    >
                                                      <i className="fa fa-trash"></i>
                                                    </button>
                                                  </td>
                                                </tr>
                                              )
                                            )}
                                            <tr>
                                              <td
                                                className="!px-3 py-3"
                                                colSpan={5}
                                              >
                                                <div className="flex justify-end gap-2.5">
                                                  <PickerImages Src={`/huong-dan-${item}.png`}>
                                                    {({ open }) => (
                                                      <button
                                                        onClick={open}
                                                        type="button"
                                                        className="px-3 py-2 text-[13px] text-white border-0 rounded outline-none bg-[#7e7e7e] hover:opacity-80 transition-all"
                                                      >
                                                        Cách nhập giá trị
                                                      </button>
                                                    )}
                                                  </PickerImages>

                                                  <button
                                                    type="button"
                                                    onClick={() => {
                                                      arrayHelpers.push({
                                                        FromMinute: '',
                                                        ToMinute: '',
                                                        Value: '',
                                                        Method: ''
                                                      })
                                                    }}
                                                    className="px-3 py-2 text-[13px] text-white border-0 rounded outline-none bg-success hover:opacity-80 transition-all"
                                                  >
                                                    Thêm ngưỡng
                                                  </button>
                                                </div>
                                              </td>
                                            </tr>
                                          </tbody>
                                        )}
                                      />
                                    </Table>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                          {/* <Table responsive bordered className="mb-0">
                            <thead>
                              <tr>
                                <th className="!px-3 py-3 min-w-[260px] w-[260px]">
                                  <div className="flex items-center justify-between">
                                    Cách thức
                                    <OverlayTrigger
                                     
                                      key="bottom"
                                      placement="bottom"
                                      overlay={
                                        <Tooltip id={`tooltip-top`}>
                                          <div className="font-light text-left text-[#222] text-[13px]">
                                            <div className="mb-2.5 pb-2.5 border-b border-[#ebedf3] border-solid border-t-0 border-l-0 border-r-0">
                                              <span className="font-medium">
                                                Khoảng thời gian: Thưởng/Phạt
                                              </span>{' '}
                                              sẽ được tính theo các mốc thười
                                              gian{' '}
                                              <span className="font-medium">
                                                A -> B.
                                              </span>
                                            </div>
                                            <div className="mb-2.5 pb-2.5 border-b border-[#ebedf3] border-solid border-t-0 border-l-0 border-r-0">
                                              <span className="font-medium">
                                                Số PHÚT chênh lệch: Thưởng/Phạt
                                              </span>{' '}
                                              sẽ được tính theo mỗi{' '}
                                              <span className="font-medium">
                                                PHÚT chênh lệch.
                                              </span>
                                            </div>
                                            <div>
                                              <span className="font-medium">
                                                Nâng cao:
                                              </span>{' '}
                                              hỗ trợ Setup 2 cách thức
                                              <span className="font-medium">
                                                Khoảng thời gian & Số PHÚT chênh
                                                lệch.
                                              </span>
                                            </div>
                                          </div>
                                        </Tooltip>
                                      }
                                    >
                                      <i className="fas fa-info-circle text-warning text-[15px]"></i>
                                    </OverlayTrigger>
                                  </div>
                                </th>
                                <th className="text-center !px-3 py-3 min-w-[55px] w-[55px]">
                                  STT
                                </th>
                                <th className="!px-3 py-3 min-w-[230px] w-[230px]">
                                  <div className="flex items-center justify-between">
                                    Loại
                                    <OverlayTrigger
                                      //trigger={['hover']}
                                      key="bottom"
                                      placement="bottom"
                                      overlay={
                                        <Tooltip id={`tooltip-top`}>
                                          <div className="font-light text-left text-[#222] text-[13px]">
                                            <div className="mb-3 pb-3 border-b border-[#ebedf3] border-solid border-t-0 border-l-0 border-r-0">
                                              <div className="mb-1 font-medium">
                                                Khoảng thời gian:
                                              </div>
                                              <div>
                                                <div>
                                                  + loại{' '}
                                                  <span className="font-medium">
                                                    Số tiền: A -> B : x
                                                  </span>{' '}
                                                  || (x) sẽ có giá trị VND.
                                                </div>
                                                <div>
                                                  + loại{' '}
                                                  <span className="font-medium">
                                                    Lương giờ: A -> B: x
                                                  </span>{' '}
                                                  || (x) sẽ có giá trị{' '}
                                                  <span className="font-medium">
                                                    x
                                                  </span>{' '}
                                                  lần lương của 1 giờ. (1h).
                                                </div>
                                                <div>
                                                  + loại{' '}
                                                  <span className="font-medium">
                                                    Số công: A - B: x
                                                  </span>{' '}
                                                  || (x) sẽ có giá trị{' '}
                                                  <span>x</span> lần 1 công.
                                                </div>
                                              </div>
                                            </div>
                                            <div className="mb-1 font-medium">
                                              Số PHÚT chênh lệch:
                                            </div>
                                            <div>
                                              <div>
                                                + loại{' '}
                                                <span className="font-medium">
                                                  Lương giờ: Thưởng/Phạt = x *
                                                  số PHÚT chênh lệch
                                                </span>{' '}
                                                || (x) sẽ là lương mỗi PHÚT của
                                                nhân viên (lương 1h/60).
                                              </div>
                                              <div>
                                                + loại{' '}
                                                <span className="font-medium">
                                                  Số tiền: Thưởng/Phạt = x * số
                                                  PHÚT chênh lệch
                                                </span>{' '}
                                                || (x) sẽ là giá trị VND bạn
                                                nhập.
                                              </div>
                                            </div>
                                          </div>
                                        </Tooltip>
                                      }
                                    >
                                      <i className="fas fa-info-circle text-warning text-[15px]"></i>
                                    </OverlayTrigger>
                                  </div>
                                </th>
                                <th className="!px-3 py-3 min-w-[150px] w-[150px]">
                                  Từ (Phút)
                                </th>
                                <th className="!px-3 py-3 min-w-[150px] w-[150px]">
                                  Đến (Phút)
                                </th>
                                <th className="!px-3 py-3 min-w-[180px] w-[300px]">
                                  Giá trị
                                </th>
                                <th className="!px-3 py-3 min-w-[180px] w-[270px]"></th>
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
                                        {(values[item][0].Method !==
                                          'KHOANG_THOI_GIAN' ||
                                          (values[item][0].Method ===
                                            'KHOANG_THOI_GIAN' &&
                                            i === 0)) && (
                                          <td
                                            className="align-middle !px-3 py-3"
                                            rowSpan={
                                              values[item][i].Method ===
                                              'KHOANG_THOI_GIAN'
                                                ? values[item].length
                                                : 1
                                            }
                                          >
                                            <Select
                                              //isClearable
                                              cacheOptions
                                              defaultOptions
                                              options={OptionsMethod}
                                              className="select-control"
                                              classNamePrefix="select"
                                              placeholder="Chọn cách thức"
                                              noOptionsMessage={() =>
                                                'Không có dữ liệu'
                                              }
                                              onChange={val => {
                                                if (
                                                  x.Method &&
                                                  (x.Method ===
                                                    'KHOANG_THOI_GIAN' ||
                                                    val?.value ===
                                                      'KHOANG_THOI_GIAN')
                                                ) {
                                                  Swal.fire({
                                                    title:
                                                      'Xác nhận thay đổi ?',
                                                    text: `Khi chuyển đổi cách thức dữ liệu ${getByName(
                                                      item
                                                    )} sẽ bị làm mới !`,
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor:
                                                      '#3085d6',
                                                    //cancelButtonColor: '#d33',
                                                    confirmButtonText:
                                                      'Xác nhận',
                                                    cancelButtonText: 'Đóng'
                                                  }).then(result => {
                                                    if (result.isConfirmed) {
                                                      setFieldValue(`${item}`, [
                                                        {
                                                          FromMinute: '',
                                                          ToMinute: '',
                                                          Value: '',
                                                          Type: '',
                                                          Method:
                                                            val?.value || ''
                                                        }
                                                      ])
                                                    }
                                                  })
                                                } else {
                                                  setFieldValue(
                                                    `${item}[${i}].Method`,
                                                    val?.value || ''
                                                  )
                                                }
                                              }}
                                              value={
                                                x.Method
                                                  ? OptionsMethod.filter(
                                                      o => o.value === x.Method
                                                    )
                                                  : null
                                              }
                                              menuPosition="fixed"
                                              styles={{
                                                menuPortal: base => ({
                                                  ...base,
                                                  zIndex: 9999
                                                })
                                              }}
                                              menuPortalTarget={document.body}
                                            />
                                          </td>
                                        )}

                                        <td
                                          className={clsx(
                                            'align-middle text-center !px-3 py-3',
                                            x.Method === 'SO_PHUT_CHENH_LECH' &&
                                              'opacity-30'
                                          )}
                                        >
                                          {i + 1}
                                        </td>
                                        <td className="align-middle !px-3 py-3">
                                          {x.Method && (
                                            <>
                                              {x.Method === 'NANG_CAO' ? (
                                                '---'
                                              ) : (
                                                <Select
                                                  isClearable
                                                  cacheOptions
                                                  defaultOptions
                                                  options={OptionsType.filter(
                                                    o => {
                                                      if (
                                                        x.Method ===
                                                        'SO_PHUT_CHENH_LECH'
                                                      ) {
                                                        return (
                                                          o.value !== 'SO_CONG'
                                                        )
                                                      }
                                                      return o
                                                    }
                                                  )}
                                                  className="select-control"
                                                  classNamePrefix="select"
                                                  placeholder="Chọn loại"
                                                  noOptionsMessage={() =>
                                                    'Không có dữ liệu'
                                                  }
                                                  onChange={val => {
                                                    setFieldValue(
                                                      `${item}[${i}].Type`,
                                                      val?.value || ''
                                                    )
                                                    if (
                                                      x?.Method ===
                                                      'SO_PHUT_CHENH_LECH'
                                                    ) {
                                                      if (
                                                        val?.value ===
                                                        'LUONG_GIO'
                                                      ) {
                                                        setFieldValue(
                                                          `${item}[${i}].Value`,
                                                          -60
                                                        )
                                                        setFieldValue(
                                                          `${item}[${i}].ToMinute`,
                                                          1440
                                                        )
                                                      }
                                                      if (
                                                        val?.value === 'SO_TIEN'
                                                      ) {
                                                        setFieldValue(
                                                          `${item}[${i}].Value`,
                                                          0
                                                        )
                                                        setFieldValue(
                                                          `${item}[${i}].ToMinute`,
                                                          1440
                                                        )
                                                      }
                                                    } else {
                                                      setFieldValue(
                                                        `${item}[${i}].Value`,
                                                        ''
                                                      )
                                                      setFieldValue(
                                                        `${item}[${i}].ToMinute`,
                                                        ''
                                                      )
                                                    }
                                                  }}
                                                  value={
                                                    x.Type
                                                      ? OptionsType.filter(
                                                          o =>
                                                            o.value === x.Type
                                                        )
                                                      : null
                                                  }
                                                  menuPosition="fixed"
                                                  styles={{
                                                    menuPortal: base => ({
                                                      ...base,
                                                      zIndex: 9999
                                                    })
                                                  }}
                                                  menuPortalTarget={
                                                    document.body
                                                  }
                                                />
                                              )}
                                            </>
                                          )}
                                        </td>
                                        <td className="align-middle !px-3 py-3">
                                          {x.Method && (
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
                                          )}
                                        </td>
                                        <td className="align-middle !px-3 py-3">
                                          {x.Method && (
                                            <>
                                              {x.Method ===
                                              'SO_PHUT_CHENH_LECH' ? (
                                                <div>---</div>
                                              ) : (
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
                                              )}
                                            </>
                                          )}
                                        </td>
                                        <td className="align-middle !px-3 py-3 w-[300px]">
                                          {x.Method && (
                                            <>
                                              {x.Method ===
                                                'SO_PHUT_CHENH_LECH' &&
                                              x.Type === 'LUONG_GIO' ? (
                                                <>(Tính theo lương 1h/60) </>
                                              ) : (
                                                <div className="position-relative">
                                                  <NumericFormat
                                                    name="Value"
                                                    value={x.Value}
                                                    className="form-control"
                                                    type="text"
                                                    placeholder={getPlaceholder(
                                                      {
                                                        Type: x.Type,
                                                        Method: x.Method
                                                      }
                                                    )}
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
                                                  {x.Method === 'NANG_CAO' ? (
                                                    <PickerReward
                                                      Title={`${getByName(
                                                        item
                                                      )} (Giá trị từ ${
                                                        x.FromMinute || '--'
                                                      } phút đến ${
                                                        x.ToMinute || '--'
                                                      } phút)`}
                                                      onChange={val => {
                                                        setFieldValue(
                                                          `${item}[${i}].Value`,
                                                          val
                                                        )
                                                      }}
                                                    >
                                                      {({ open }) => (
                                                        <div
                                                          onClick={open}
                                                          className="top-0 right-0 cursor-pointer position-absolute h-100 text-warning"
                                                          style={{
                                                            width: '40px',
                                                            fontSize: '16px',
                                                            display: 'flex',
                                                            justifyContent:
                                                              'center',
                                                            alignItems: 'center'
                                                          }}
                                                        >
                                                          <i className="fas fa-info-circle"></i>
                                                        </div>
                                                      )}
                                                    </PickerReward>
                                                  ) : (
                                                    <>
                                                      {getUnit({
                                                        Type: x.Type,
                                                        Method: x.Method
                                                      }) &&
                                                        x.Value !== '' && (
                                                          <div className="absolute top-0 right-0 h-full px-3 flex items-center justify-center text-[12px] text-muted font-medium pointer-events-none">
                                                            {getUnit({
                                                              Type: x.Type,
                                                              Method: x.Method
                                                            })}
                                                          </div>
                                                        )}
                                                    </>
                                                  )}
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </td>
                                        <td className="align-middle !px-3 py-3">
                                          {x.Value !== '' &&
                                            renderNote({
                                              Name: item,
                                              Item: x
                                            })}
                                        </td>
                                        <td className="align-middle text-center !px-3 py-3">
                                         
                                          <button
                                            type="button"
                                            className="btn btn-danger btn-xs w-[30px] h-[30px]"
                                            onClick={() =>
                                              arrayHelpers.remove(i)
                                            }
                                            disabled={!x.Method}
                                          >
                                            <i className="fa fa-trash"></i>
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  {values[item] && values[item].length > 0 && (
                                    <tr>
                                      <td
                                        className="align-middle !px-3 py-3 text-right"
                                        colSpan={7}
                                      >
                                        <button
                                          disabled={
                                            values[item][0].Method ===
                                            'SO_PHUT_CHENH_LECH'
                                          }
                                          type="button"
                                          className="btn btn-success btn-xs h-[38px] !px-[12px]"
                                          onClick={() => {
                                            arrayHelpers.push({
                                              FromMinute:
                                                values[item][0].Method ===
                                                'KHOANG_THOI_GIAN'
                                                  ? values[item][
                                                      values[item].length - 1
                                                    ].ToMinute
                                                  : '',
                                              ToMinute:
                                                values[item][0].Method ===
                                                'KHOANG_THOI_GIAN'
                                                  ? values[item][
                                                      values[item].length - 1
                                                    ].ToMinute +
                                                    (values[item][
                                                      values[item].length - 1
                                                    ].ToMinute -
                                                      values[item][
                                                        values[item].length - 1
                                                      ].FromMinute)
                                                  : '',
                                              Value: '',
                                              Type:
                                                values[item][0].Method ===
                                                'KHOANG_THOI_GIAN'
                                                  ? values[item][
                                                      values[item].length - 1
                                                    ].Type
                                                  : '',
                                              Method:
                                                values[item][
                                                  values[item].length - 1
                                                ].Method
                                            })
                                          }}
                                        >
                                          Thêm cấu hình
                                        </button>
                                      </td>
                                    </tr>
                                  )}

                                  {(!values[item] ||
                                    values[item].length === 0) && (
                                    <tr>
                                      <td
                                        className="text-center !px-3 py-5"
                                        colSpan={6}
                                      >
                                        <div className="min-h-[200px] flex items-center justify-center flex-col">
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
                                                Value: '',
                                                Type: '',
                                                Method: ''
                                              })
                                            }
                                          >
                                            <i className="fa fa-plus mr-1.5"></i>{' '}
                                            Tạo cấu hình
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              )}
                            />
                          </Table> */}
                        </div>
                        {/* <div className="flex justify-end px-20px pb-20px">
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
                        </div> */}
                      </div>
                    ))}
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

export default PayOffPage
