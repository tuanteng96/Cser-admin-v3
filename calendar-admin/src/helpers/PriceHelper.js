export const PriceHelper = {
  countDecimals: value => {
    if (Math.floor(value) === value) return 0
    return value.toString().split('.')[1].length || 0
  },
  formatVND: price => {
    if (!price || price === 0) {
      return '0'
    } else if (Number(price) % 1 !== 0) {
      return Number(price)
        .toFixed(PriceHelper.countDecimals(Number(price)))
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
    } else {
      return Number(price)
        .toFixed(0)
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    }
  },
  formatVNDPositive: price => {
    if (!price || price === 0) {
      return '0'
    } else {
      return Math.abs(price)
        .toFixed(0)
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    }
  },
  formatValueVoucher: price => {
    if (!price || price === 0) {
      return '0'
    } else if (Math.abs(price) <= 100) {
      return `${price}%`
    } else {
      return Math.abs(price)
        .toFixed(0)
        .replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    }
  }
}
