export const PriceHelper = {
  formatVND: price => {
    if (!price || price === 0) {
      return '0'
    } else {
      return price.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
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
