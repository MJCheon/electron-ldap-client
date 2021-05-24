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
        const rootNode = { name: entry.dn, data: entry, file: true, children: []}
        rootTree = tree.parse(rootNode)
      } else {
        realDn.forEach((nodeName) => {
          const tmpNode = rootTree.first((node) => node.model.name === nodeName)
          if (tmpNode) {
            parentNode = tmpNode
          }
        })

        const dn = realDn.pop()
        const newNode = { name: dn, data: entry, file: true, children: [] }

        if (!parentNode) {
          rootTree.addChild(tree.parse(newNode))
        } else {
          if (parentNode.model.file) parentNode.model.file = false
          parentNode.addChild(tree.parse(newNode))
        }
      }
    });

    return [ rootTree.model ]
  },
  makeAttrTree: (attrData) => {
    var attrTree = []
    Object.keys(attrData).sort().forEach((key) => {
      if (Array.isArray(attrData[key])) {
        var attrChild = []
        attrData[key].forEach((attr) => {
          attrChild.push({ id: attr, file: true, data: attr })
        })
        attrTree.push({ id: key, file: false, data: key, children: attrChild })
      } else {
        const data = key + ' : ' + attrData[key]
        attrTree.push({ id: key, file: true, data: data })
      }
    })
  
    return attrTree
  }
}

export default Tree