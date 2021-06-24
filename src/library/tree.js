import TreeModel from 'tree-model'

const Tree = {
  makeEntryTree: (searchEntries) => {
    var baseDnList = searchEntries.baseDn.split(',')
    var entries = searchEntries.entries
    var tree = new TreeModel({
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
          isVisible: true,
          isExpanded: true,
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
          isVisible: true,
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
      children: [],
      isExpanded: true,
      isVisible: true,
      isLeaf: false,
      dragDisabled: true
    }

    Object.keys(attrData).sort().forEach((key) => {
      if (Array.isArray(attrData[key])) {
        var attrChild = []
        attrData[key].forEach((attr) => {
          attrChild.push({ 
            id: attr,
            name: attr,
            data: attr,
            children: [],
            isExpanded: true,
            isVisible: true,
            isLeaf: true,
            dragDisabled: true
          })
        })
        attrTree.children.push({
          id: key,
          name: key,
          data: key,
          children: attrChild.sort(),
          isExpanded: true,
          isVisible: true,
          isLeaf: false,
          addTreeNodeDisabled: true,
          dragDisabled: true
        })
      } else {
        const data = key + ' : ' + attrData[key]
        attrTree.children.push({
          id: key,
          name: attrData[key],
          data: data,
          children: [],
          isExpanded: true,
          isVisible: true,
          isLeaf: true,
          dragDisabled: true
        })
      }
    })
    
    return [ attrTree ]
  },
  getChangesFromData: (tree, deleteNodeList) => {
    const parseTree = new TreeModel().parse(tree)
    
    var changeDataList = []

    var addChangeData = {}
    var replaceChangeData = {}
    var deleteChangeData = {}

    var rootId = ''

    if (deleteNodeList.length > 0) {  // delete
      deleteNodeList.forEach(node => {
        var attrId = node.id
        var data = node.name

        if(node.id === node.name) {  // netgroup
          var parentNode = node.parent
          var replaceDataInDeleteList = []

          attrId = parentNode.id
          parentNode.children.forEach(childNode => {
            if (childNode.name !== data) {
              replaceDataInDeleteList.push(childNode.name)
            }
          });

          replaceChangeData[attrId] = replaceDataInDeleteList
        } else {
          deleteChangeData[attrId] = data
        }
      });
    }

    parseTree.walk((node) => {
      var attrId = ''
      var data = ''
  
      if (!node.isRoot() && node.model.id !== '') {

        if ( rootId === '' && node.model.data.includes('dn') ) {
          var tmpData = node.model.data.split(':')
          rootId = tmpData[1]
        }

        if ( attrId === '') {
          const newIdPattern = /\d{13}/
          if (newIdPattern.test(node.model.id)) { // 신규 Node
            if (node.model.name.includes(':')) { // key:value 형식일 때, add
              var attribute = node.model.name.split(':')
              attrId = attribute[0]
              data = attribute[1].trim()
              addChangeData[attrId] = data
            } else { // 값만 들어간 경우, 배열로 만들어 replace
              var parentNode = node.model.parent
              var replaceDataList = []

              attrId = parentNode.id
              parentNode.children.forEach(childNode => {
                replaceDataList.push(childNode.name.trim())
              });

              replaceChangeData[attrId] = replaceDataList
            } 
          } else {// 기존 ID가 있고, data가 다른 경우 replace
            attrId = node.model.id
            data = node.model.name.trim()
            if (!node.model.data.includes(data)) {
              var parentNode = node.model.parent
              var replaceDataList = []

              if (parentNode.id === parentNode.name) {
                attrId = parentNode.id
                parentNode.children.forEach(childNode => {
                  replaceDataList.push(childNode.name.trim())
                });

                replaceChangeData[attrId] = replaceDataList
              } else {
                replaceChangeData[attrId] = data
              }
            }
          }
        }
      }
    })

    if (Object.keys(deleteChangeData).length > 0) {
      changeDataList.push({ operation: 'delete', modifyData: deleteChangeData })
    }
    if (Object.keys(replaceChangeData).length > 0) {
      changeDataList.push({ operation: 'replace', modifyData: replaceChangeData })
    }
    if (Object.keys(addChangeData).length > 0) {
      changeDataList.push({ operation: 'add', modifyData: addChangeData })
    }
    
    var returnData = { id: rootId, data: changeDataList }
    return returnData
  }
}

export default Tree