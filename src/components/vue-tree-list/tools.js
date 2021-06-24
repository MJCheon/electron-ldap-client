var handlerCache

export const addHandler = function (element, type, handler) {
  handlerCache = handler
  if (element.addEventListener) {
    element.addEventListener(type, handler, false)
  } else if (element.attachEvent) {
    element.attachEvent('on' + type, handler)
  } else {
    element['on' + type] = handler
  }
}

export const removeHandler = function (element, type) {
  if (element.removeEventListener) {
    element.removeEventListener(type, handlerCache, false)
  } else if (element.detachEvent) {
    element.detachEvent('on' + type, handlerCache)
  } else {
    element['on' + type] = null
  }
}

export const isFiltered = (list, search) => {
  list.forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(value => {
        if (value.indexOf(search)) {
          console.log(value)
          return true
        }
      })
    } else {
      if (value.indexOf(search)) {
        return true
      }
    }
  })
  return false
}

// depth first search
export const traverseTree = root => {
  var newRoot = {}

  for (var k in root) {
    if (k !== 'children' && k !== 'parent') {
      newRoot[k] = root[k]
    }
  }

  if (root.children && root.children.length > 0) {
    newRoot.children = []
    for (var i = 0, len = root.children.length; i < len; i++) {
      newRoot.children.push(traverseTree(root.children[i]))
    }
  }
  return newRoot
}

// depth first filter search
export const traverseFilteredTree = (root, search) => {
  if (search !== '' && search.length > 0) {
    if (root.name.indexOf(search) < 0) {
      root.isVisible = false
    } else {
      root.isVisible = true
      root.isExpanded = !root.isExpanded
    }
    if (root.children && root.children.length > 0) {
      for (var i = 0, len = root.children.length; i < len; i++) {
        var childrenData = Object.values(root.children[i].data)
        if (root.children[i].name.indexOf(search) || isFiltered(childrenData)) {
          root.isVisible = true
          root.isExpanded = true
        } else {
          root.isVisible = false
        }
        traverseFilteredTree(root.children[i], search)
      }
    }
  } else {
    root.isVisible = true
    root.isExpanded = true

    if (root.children && root.children.length > 0) {
      root.children.forEach(child => {
        traverseFilteredTree(child, search)
      })
    }
  }
}
