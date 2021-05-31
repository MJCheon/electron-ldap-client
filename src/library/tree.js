import TreeModel from 'tree-model'

const Tree = {
  makeEntryTree: (searchEntries) => {
    const baseDnList = searchEntries.baseDn.split(',')
    const entries = searchEntries.entries
    const tree = new TreeModel({
      modelComparatorFn: (left, right) => {
        return left.name > right.name
      }
    }) 
    var rootTree = []

    entries.forEach(entry => {
      const realDn = entry.dn.split(',').reverse().filter((node) => !baseDnList.includes(node))
      var parentNode = ''

      if (rootTree.length === 0) { 
        const rootNode = { 
          id: entry.dn,
          name: entry.dn,
          isLeaf: true,
          dragDisabled: true,
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
          dragDisabled: true,
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
  getSaveData: (tree, deleteNodeList) => {
    const parseTree = new TreeModel().parse(tree)
    
    const saveDataList = []
    var rootId = ''

    parseTree.walk((node) => {
      var attrId = ''
      var data = ''
  
      if (!node.isRoot() && node.model.id !== '') {

        if ( rootId === '' && node.model.data.includes('dn') ) {
          const tmpData = node.model.data.split(':')
          rootId = tmpData[1]
        }

        if ( attrId === '') {
          if (node.model.name.includes(':')) {
            const attribute = node.model.name.split(':')
            attrId = attribute[0]
            data = attribute[1]
          } else if (node.model.id) {
            attrId = node.model.id
            data = node.model.name
          } else if (node.model.pid) {
            attrId = node.model.pid
            data = node.model.name
          }

          var modifyData = {}
          modifyData[attrId] = data

        }
        
        if (!node.model.data && node.model.name) { // add
          saveDataList.push({ operation: 'add', modifyData: modifyData })
        } else if (!node.model.data.includes(node.model.name)) { // modify
          saveDataList.push({ operation: 'replace', modifyData: modifyData })  
        }
      }
    })

    if (deleteNodeList.length > 0) {  // delete
      deleteNodeList.forEach(node => {
        var modifyData = {}
        modifyData[node.id] = node.name

        saveDataList.push({ operation: 'delete', modifyData: modifyData })
      });
    }
    
    const returnData = { id: rootId, data: saveDataList }
    return returnData
  }
}

export default Tree