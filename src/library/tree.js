import TreeModel from 'tree-model'

const Tree = {
  makeEntryTree: (baseDn, entries) => {
    const baseDnList = baseDn.split(',')
    const tree = new TreeModel({
      modelComparatorFn: (left, right) => {
        return left.name > right.name
      }
    }) 
    var rootTree = []

    entries.forEach(entry => {
      const realDn = entry.dn.split(',').reverse().filter((node) => !baseDnList.includes(node))
      var parentNode = ''

      if (realDn.length === 0) { 
        const rootNode = { 
          id: entry.dn,
          name: entry.dn,
          isLeaf: true,
          data: entry,
          children: []
        }
        rootTree = tree.parse(rootNode)
      } else {
        realDn.forEach((nodeName) => {
          const tmpNode = rootTree.first((node) => node.model.name === nodeName)
          if (tmpNode) {
            parentNode = tmpNode
          }
        })

        const dn = realDn.pop()
        const newNode = { 
          id: dn,
          name: dn,
          isLeaf: true,
          data: entry
        }

        if (!parentNode) {
          rootTree.model.isLeaf = false
          rootTree.addChild(tree.parse(newNode))
        } else {
          if (parentNode.model.isLeaf) parentNode.model.isLeaf = false
          parentNode.addChild(tree.parse(newNode))
        }
      }
    });

    return [ rootTree.model ]
  },
  makeAttrTree: (id, attrData) => {
    const attrTree = {
      id: '',
      name: id,
      isLeaf: false,
      children: []
    }

    Object.keys(attrData).sort().forEach((key) => {
      if (Array.isArray(attrData[key])) {
        var attrChild = []
        attrData[key].forEach((attr) => {
          attrChild.push({ 
            id: attr,
            name: attr,
            isLeaf: true,
            data: attr,
            children: []
          })
        })
        attrTree.children.push({
          id: key,
          name: key,
          isLeaf: false,
          addTreeNodeDisabled: true,
          data: key,
          children: attrChild.sort()
        })
      } else {
        const data = key + ' : ' + attrData[key]
        attrTree.children.push({
          id: key,
          name: attrData[key],
          isLeaf: true,
          data: data,
          children: []
        })
      }
    })
    
    return [ attrTree ]
  },
  getSaveData: (tree) => {
    const parseTree = new TreeModel().parse(tree)
    
    const saveDataList = []
    var rootId = ''

    parseTree.walk((node) => {
      var attrId = ''

      if (!node.isRoot() && node.model.id !== '') {
        if ( node.model.state ) {
          if ( node.model.pid ) {
            attrId = node.model.pid
          } else {
            attrId = rootId
          }
          var modifyData = {}
          modifyData[attrId] = node.model.name
          saveDataList.push({ operation: node.model.state, modifyData: modifyData })
        }
      } else if (node.model.id === '') {
        rootId = node.model.name
      }
    })

    const returnData = { id: rootId, data: saveDataList }
    return returnData
  }
}

export default Tree