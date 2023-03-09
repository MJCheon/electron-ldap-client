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
  var parent = root.parent

  if (search && search !== '' && search.length > 0) {
    if (nodeFinder(root.name, search)) {
      root.isVisible = true
      root.isExpanded = true
      while (parent) {
        parent.isVisible = true
        parent.isExpanded = true
        parent = parent.parent
      }
    } else if (root.data) {
      var data = Object.values(root.data).toString()

      parent = root.parent

      if (nodeFinder(data, search)) {
        root.isVisible = true
        root.isExpanded = true
        while (parent) {
          parent.isVisible = true
          parent.isExpanded = true
          parent = parent.parent
        }
      } else {
        root.isVisible = false
        root.isExpanded = false
      }
    } else {
      root.isVisible = false
      root.isExpanded = false
    }
    if (root.children && root.children.length > 0) {
      root.children.forEach(child => {
        traverseFilteredTree(child, search)
      })
    }
  } else {
    if ((root.name === 'root' && root.id === 0) || (root.parent && root.parent.name === 'root' && root.parent.id === 0)) {
      root.isVisible = true
      root.isExpanded = true
    } else {
      root.isVisible = true
      root.isExpanded = false
    }
    if (root.children && root.children.length > 0) {
      root.children.forEach(child => {
        traverseFilteredTree(child, search)
      })
    }
  }
}

var nodeFinder = (data, search) => {
  var isFound = false
  if (search.includes('|')) {
    search.split('|').forEach(word => {
      if (data.indexOf(word) > -1) {
        isFound = true
      }
    })
  } else {
    if (data.indexOf(search) > -1) {
      isFound = true
    }
  }
  return isFound
}
