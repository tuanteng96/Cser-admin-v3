/* eslint-disable */

import moment from 'moment'
import 'moment/locale/vi'
moment.locale('vi')

export const ArrayHelpers = {
  groupbyDDHHMM: (arr, name = 'BookDate') => {
    const newArr = []
    if (!arr) return false
    arr.map(item => {
      const dayFull = item[name]
      const d = dayFull.split('T')[0]
      var g = null
      newArr.every(_g => {
        if (_g.day === d) g = _g
        return g == null
      })
      if (g == null) {
        g = {
          day: d,
          dayFull: dayFull,
          items: []
        }
        newArr.push(g)
      }
      g.items.push(item)
    })
    return newArr
      .map(item => ({
        ...item,
        items: item.items.sort(function (left, right) {
          return moment.utc(right[name]).diff(moment.utc(left[name]))
        })
      }))
      .sort(function (left, right) {
        return moment.utc(right.dayFull).diff(moment.utc(left.dayFull))
      })
  },
  useInfiniteQuery: (page, key = 'data') => {
    let newPages = []
    if (!page || !page[0]) return newPages
    for (let items of page) {
      for (let x of items[key]) {
        newPages.push(x)
      }
    }
    return newPages
  },
  getTimeFromMins: (mins) => {
    if (!mins || mins >= 24 * 60 || mins < 0) {
      return;
    }
    var h = mins / 60 | 0,
      m = mins % 60 | 0;
    return moment.utc().hours(h).minutes(m).format("hh:mm A");
  }
}