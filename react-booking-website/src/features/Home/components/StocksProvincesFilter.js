import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import clsx from 'clsx'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'

function StocksProvincesFilter({
  isOpen,
  onClose,
  Stocks,
  onChange,
  StockActive
}) {
  const { t } = useTranslation()

  let [StocksList, setStocksList] = useState([])
  let [StocksProvider, setStocksProvider] = useState([])

  let [ProvincesList, setProvincesList] = useState([])

  let [ActiveProvinces, setActiveProvinces] = useState(null)
  let [ActiveDistricts, setActiveDistricts] = useState(null)

  let [CrStock, setCrStock] = useState(null)

  useEffect(() => {
    if (Stocks) {
      let newStocks = []
      let Provinces = []

      for (let x of Stocks) {
        let obj = {
          ...x
        }
        let newDesc = null
        if (x.DescSEO && !x.DescSEO.includes('https://')) {
          newDesc = JSON.parse(x.DescSEO)
        }

        if (newDesc && newDesc.place && newDesc.place.length > 0) {
          obj.Province = newDesc.place.filter(o => o.Parentid > 0)[0]
          obj.District = newDesc.place.filter(o => !o.Parentid)[0]
        }
        newStocks.push(obj)
      }

      for (let province of newStocks) {
        let index = Provinces.findIndex(
          x =>
            Number(
              province?.Province?.Parentid && province?.Province?.Parentid
            ) === Number(x.Parentid)
        )
        if (index > -1) {
          let indexDistr = Provinces[index].Districts.findIndex(
            o => Number(o.ID) === Number(province?.District?.ID)
          )
          if (indexDistr === -1) {
            Provinces[index].Districts.push({
              ...province?.District,
              label: province?.District?.Title || null,
              value: province?.District?.ID || null
            })
          }
        } else {
          Provinces.push({
            ...province?.Province,
            label: province?.Province?.Title || null,
            value: province?.Province?.Parentid || null,
            Districts: [
              {
                ...province?.District,
                label: province?.District?.Title || null,
                value: province?.District?.ID || null
              }
            ]
          })
        }
      }
      newStocks = newStocks?.sort(
        (a, b) => Number(a?.Province?.Parentid) - Number(b?.Province?.Parentid)
      )
      setStocksList(newStocks)
      setStocksProvider(newStocks)

      setProvincesList(Provinces.filter(x => x.Parentid))
    }
  }, [Stocks, isOpen])

  useEffect(() => {
    if (isOpen) {
      let CurrentStockID = StockActive

      if (CurrentStockID && StocksProvider) {
        setCrStock(Number(CurrentStockID))
      }
    } else {
      setActiveProvinces(null)
      setActiveDistricts(null)
    }
  }, [isOpen, StocksProvider, ProvincesList, StockActive])

  useEffect(() => {
    if (StocksProvider) {
      let newValues = [...StocksProvider]

      if (ActiveProvinces) {
        newValues = newValues.filter(
          x => Number(x?.Province?.Parentid) === Number(ActiveProvinces?.value)
        )
      }
      if (ActiveDistricts) {
        newValues = newValues.filter(
          x => Number(x?.District?.ID) === Number(ActiveDistricts?.value)
        )
      }
      setStocksList(newValues)
    }
    // eslint-disable-next-line
  }, [ActiveProvinces, ActiveDistricts])

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.div
            className="fixed w-full h-full top-0 left-0 bg-black/40 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            onClick={onClose}
          ></motion.div>
          <motion.div
            className="fixed w-100 bottom-0 left-0 bg-white z-[101] h-3/5"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            style={{
              borderRadius: '5px 5px 0 0',
              overflow: 'hidden'
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center border-b px-[16px] py-[10px] mb-[16px]">
                <div className="font-semibold text-[16px]">{t("booking.CHON_CO_SO")}</div>
                <div onClick={onClose}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 px-[16px]">
                <div>
                  <Select
                    isClearable
                    className="select-control"
                    classNamePrefix="select"
                    placeholder={t("booking.TINH_TP")}
                    value={ActiveProvinces}
                    options={ProvincesList || []}
                    label={t("booking.CHON_TINH_TP")}
                    onChange={val => setActiveProvinces(val)}
                    noOptionsMessage={() => t("booking.KHONG_CO_DU_LIEU")}
                  />
                </div>
                <div>
                  <Select
                    isClearable
                    className="select-control"
                    classNamePrefix="select"
                    placeholder={t("booking.QUAN_HUYEN")}
                    value={ActiveDistricts}
                    options={ActiveProvinces?.Districts || []}
                    label={t("booking.CHON_QUAN_HUYEN")}
                    onChange={val => setActiveDistricts(val)}
                    isDisabled={!ActiveProvinces}
                    noOptionsMessage={() => t("booking.KHONG_CO_DU_LIEU")}
                  />
                </div>
              </div>
              <div className="grow overflow-auto p-[16px]">
                {StocksList &&
                  StocksList.map((item, index) => (
                    <div
                      className={clsx(
                        'mb-[12px] border last:mb-0 rounded p-[16px] cursor-pointer',
                        Number(CrStock) === Number(item.ID) && 'border-primary'
                      )}
                      key={index}
                      onClick={() => onChange(item)}
                    >
                      <div
                        className={clsx(
                          'font-semibold mb-px',
                          Number(CrStock) === Number(item.ID) && 'text-primary'
                        )}
                      >
                        {item.Title}
                      </div>
                      <div className="font-light">{item.Desc}</div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default StocksProvincesFilter
