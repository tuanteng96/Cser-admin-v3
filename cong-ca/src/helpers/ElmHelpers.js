export const ElmHelpers = {
  checkOverflow: (el, xy) => {
    if (!el) return
    var isOverflowing = false
    if (xy === 'X') {
      isOverflowing = el.clientWidth < el.scrollWidth
    } else {
      isOverflowing = el.clientHeight < el.scrollHeight
    }
    return isOverflowing
  }
}
