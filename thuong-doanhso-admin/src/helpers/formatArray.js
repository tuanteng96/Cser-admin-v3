export const formatArray = {
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
  findNodeByName: (data, name) => {
    let response = null
    let findNameItem = tree => {
      let result = null
      if (tree.name === name) {
        return tree
      }

      if (Array.isArray(tree.children) && tree.children.length > 0) {
        tree.children.some(node => {
          result = findNameItem(node)
          return result
        })
      }
      return result
    }
    if (!data) return null
    for (let item of data) {
      if (findNameItem(item)) {
        response = findNameItem(item)
        break
      }
    }
    return response
  },
  arrayMove: (array, oldIndex, newIndex) => {
    if (newIndex >= array.length) {
      var k = newIndex - array.length + 1
      while (k--) {
        array.push(undefined)
      }
    }
    array.splice(newIndex, 0, array.splice(oldIndex, 1)[0])
    return array
  },
  arrayHH: (count) => {
    if (!count) return null
    if (count === 1) {
      return [100]
    }
    if (count === 2) {
      return [50, 50]
    }
    if (count === 3) {
      return [33.333, 33.333, 33.333]
    }
    if (count === 4) {
      return [25, 25, 25, 25]
    }
    if (count === 5) {
      return [20, 20, 20, 20, 20]
    }
    if (count === 6) {
      return [16.666, 16.666, 16.666, 16.666, 16.666, 16.666]
    }
    if (count === 7) {
      return [14.285, 14.285, 14.285, 14.285, 14.285, 14.285, 14.285]
    }
    if (count === 8) {
      return [12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5]
    }
    if (count === 9) {
      return [11.111, 11.111, 11.111, 11.111, 11.111, 11.111, 11.111, 11.111, 11.111]
    }
    if (count === 10) {
      return [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
    }
  }
}