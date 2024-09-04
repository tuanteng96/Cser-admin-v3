import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { createPortal } from 'react-dom'
import worksheetApi from 'src/api/worksheet.api'
import { useMutation, useQueryClient } from 'react-query'
import Select, { components } from 'react-select'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { PriceHelper } from 'src/helpers/PriceHelper'
import { NumericFormat } from 'react-number-format'

function PickerSalary({ children, SalaryConfigMons, data }) {
  const [visible, setVisible] = useState(false)
  const [KPI, setKPI] = useState()
  const [SalesPrice, setSalesPrice] = useState()
  const [Total, setTotal] = useState(null)

  useEffect(() => {
    if (!visible) {
      setKPI('')
      setSalesPrice('')
      setTotal(null)
    }
  }, [visible])

  let SalaryDay = 0
  if (SalaryConfigMons) {
    let { Values, DayCount } = SalaryConfigMons
    if (Values?.NGAY_CONG) {
      SalaryDay = Values?.LUONG / Values?.NGAY_CONG
    } else {
      SalaryDay = Values?.LUONG / (DayCount - Values?.NGAY_NGHI)
    }
  }

  const onSubmit = () => {
    if (!KPI && !SalesPrice) {
      return
    }

    let KPIDay = (SalaryDay * Number(KPI)) / 100
    let TotalKPI =
      KPIDay * data?.CountWork +
      data?.CountWork * SalaryConfigMons?.Values?.TRO_CAP_NGAY +
      data?.TotalPrice
    let Percent = 0
    let TotalSales = 0
    if (Number(SalesPrice) >= 100000000 && Number(SalesPrice) < 200000000) {
      Percent = 2
    }
    if (Number(SalesPrice) >= 200000000 && Number(SalesPrice) < 300000000) {
      Percent = 3
    }
    if (Number(SalesPrice) >= 300000000 && Number(SalesPrice) < 400000000) {
      Percent = 4
    }
    if (Number(SalesPrice) >= 400000000 && Number(SalesPrice) < 500000000) {
      Percent = 5
    }
    if (Number(SalesPrice) >= 500000000 && Number(SalesPrice) < 600000000) {
      Percent = 6
    }
    if (Number(SalesPrice) >= 600000000 && Number(SalesPrice) < 700000000) {
      Percent = 7
    }
    if (Number(SalesPrice) >= 700000000 && Number(SalesPrice) < 800000000) {
      Percent = 8
    }
    if (Number(SalesPrice) >= 800000000 && Number(SalesPrice) < 900000000) {
      Percent = 9
    }
    if (Number(SalesPrice) >= 1000000000) {
      Percent = 10
    }

    TotalSales = (Percent * Number(SalesPrice)) / 100
    setTotal({ TotalSales, KPIDay, TotalKPI, Value: TotalSales + TotalKPI })
  }

  return (
    <>
      {children({
        open: () => setVisible(true),
        close: () => setVisible(false)
      })}
      {createPortal(
        <Modal show={visible} onHide={() => setVisible(false)} centered>
          <Modal.Body className="!p-[20px]">
            <div>
              <table className="table mb-0 table-bordered">
                <tbody>
                  <tr>
                    <td className="w-[250px] !p-3">Lương ngày cài đặt</td>
                    <td className="!p-3 text-right font-semibold">
                      {PriceHelper.formatVND(SalaryDay)}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[250px] !py-3">Số công</td>
                    <td className="!p-3 text-right font-semibold">
                      {data?.CountWork}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[250px] !py-3">Phụ cấp ăn trưa / ngày</td>
                    <td className="!p-3 text-right font-semibold">
                      {PriceHelper.formatVND(
                        SalaryConfigMons?.Values?.TRO_CAP_NGAY
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[250px] !py-3">
                      Thưởng phạt đi sớm / về muộn
                    </td>
                    <td className="!p-3 text-right font-semibold">
                      {PriceHelper.formatVND(data?.TotalPrice)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="border-top pt-[15px] mt-[20px]">
              <div className="mb-[15px]">
                <div className="mb-px text-[13px] text-muted">Nhập KPI</div>
                <div>
                  <NumericFormat
                    className="form-control"
                    type="text"
                    placeholder="Nhập KPI (%)"
                    value={KPI}
                    onValueChange={val =>
                      setKPI(val.floatValue ? val.floatValue : val.value)
                    }
                    autoComplete="off"
                    allowLeadingZeros
                    allowNegative={false}
                  />
                </div>
              </div>
              <div className="mb-[15px]">
                <div className="mb-px text-[13px] text-muted">
                  Nhập doanh số
                </div>
                <div>
                  <NumericFormat
                    className="form-control"
                    type="text"
                    placeholder="Nhập số tiền"
                    value={SalesPrice}
                    onValueChange={val =>
                      setSalesPrice(val.floatValue ? val.floatValue : val.value)
                    }
                    autoComplete="off"
                    allowLeadingZeros
                    thousandSeparator={true}
                    allowNegative={false}
                  />
                </div>
              </div>
              <div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={onSubmit}
                >
                  Thực hiện
                </button>
                <button
                  className="btn btn-secondary ml-[8px]"
                  type="button"
                  onClick={() => {
                    setKPI('')
                    setSalesPrice('')
                    setTotal(null)
                  }}
                >
                  Làm mới
                </button>
              </div>
            </div>
            {Total && (
              <div className="mt-[20px]">
                <table className="table mb-0 table-bordered">
                  <tbody>
                    <tr>
                      <td className="w-[250px] !p-3">Lương ngày KPI</td>
                      <td className="!p-3 text-right font-semibold">
                        {PriceHelper.formatVND(Total?.KPIDay)}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-[250px] !py-3">Số công</td>
                      <td className="!p-3 text-right font-semibold">
                        {data?.CountWork}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-[250px] !py-3">Phụ cấp ăn trưa</td>
                      <td className="!p-3 text-right font-semibold">
                        {PriceHelper.formatVND(
                          SalaryConfigMons?.Values?.TRO_CAP_NGAY *
                            data?.CountWork
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-[250px] !py-3">
                        Thưởng phạt đi sớm / về muộn
                      </td>
                      <td className="!p-3 text-right font-semibold">
                        {PriceHelper.formatVND(data?.TotalPrice)}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-[250px] !py-3">Tổng lương KPI</td>
                      <td className="!p-3 text-right font-semibold">
                        {PriceHelper.formatVND(Total?.TotalKPI)}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-[250px] !py-3">Tổng doanh số</td>
                      <td className="!p-3 text-right font-semibold">
                        {PriceHelper.formatVND(Total?.TotalSales)}
                      </td>
                    </tr>
                    <tr>
                      <td className="w-[250px] !py-3 text-[16px] font-medium">
                        Tổng lương
                      </td>
                      <td className="!p-3 text-right font-semibold text-[16px] text-danger">
                        {PriceHelper.formatVND(Total?.Value)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </Modal.Body>
        </Modal>,
        document.body
      )}
    </>
  )
}

export default PickerSalary
