import React, { useState } from 'react'
import { AsyncPaginate } from 'react-select-async-paginate'
import PropTypes from 'prop-types'
import moreApi from 'src/api/more.api'
import { isArray } from 'lodash'
import { useSelector } from 'react-redux'
import { components } from 'react-select'
import { AssetsHelpers } from 'src/helpers/AssetsHelpers'

SelectStaffs.propTypes = {
  onChange: PropTypes.func
}

const CustomOptionStaff = ({ children, ...props }) => {
  const { Thumbnail, label } = props.data
  return (
    <components.Option {...props}>
      <div className="d-flex align-items-center">
        {Thumbnail && (
          <div className="w-20px h-20px mr-8px rounded-circle overflow-hidden d-flex align-items-center justify-content-center">
            <img className="w-100" src={Thumbnail} alt={label} />
          </div>
        )}

        {children}
      </div>
    </components.Option>
  )
}

function SelectStaffs({ onChange, value, isLoading, adv, ...props }) {
  const { Stocks, StockAdv } = useSelector(({ auth }) => ({
    Stocks: auth?.PermissionStocks,
    StockAdv: auth?.PermissionStocksAdv
  }))
  const [loading, setLoading] = useState(false)

  const getAllStaffs = async (search, loadedOptions, { page }) => {
    setLoading(true)
    const { data } = await moreApi.getAllStaffs(search)
    const { Items } = {
      Items: data.data || []
    }
    let newData = []

    if (Items && isArray(Items)) {
      for (let key of Items) {
        const { group, groupid, text, id } = key
        const index = newData.findIndex(item => item.groupid === groupid)
        if (index > -1) {
          newData[index].options.push({
            label: text,
            value: id,
            ...key,
            Thumbnail: AssetsHelpers.toUrlServer('/images/user.png')
          })
        } else {
          const newItem = {}
          newItem.label = group
          newItem.groupid = groupid
          newItem.options = [
            {
              label: text,
              value: id,
              ...key,
              Thumbnail: AssetsHelpers.toUrlServer('/images/user.png')
            }
          ]
          newData.push(newItem)
        }
      }
      // if (adv) {
      //   if (StockAdv !== 'All Stocks') {
      //     newData = newData.filter(
      //       o => StockAdv && StockAdv.some(x => x.ID === o.groupid)
      //     )
      //   }
      // } else {
      //   if (Stocks !== 'All Stocks') {
      //     newData = newData.filter(
      //       o => Stocks && Stocks.some(x => x.ID === o.groupid)
      //     )
      //   }
      // }
    }
    setLoading(false)
    return {
      options: newData,
      hasMore: false,
      additional: {
        page: 1
      }
    }
  }

  return (
    <AsyncPaginate
      {...props}
      isLoading={isLoading || loading}
      classNamePrefix="select"
      loadOptions={getAllStaffs}
      placeholder="Chọn nhân viên"
      value={value}
      onChange={onChange}
      additional={{
        page: 1
      }}
      noOptionsMessage={({ inputValue }) => 'Không có nhân viên'}
      components={{
        Option: CustomOptionStaff
      }}
    />
  )
}

export default SelectStaffs
