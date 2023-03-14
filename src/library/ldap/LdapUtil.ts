import { Attribute, SearchResult } from 'ldapts'
import TreeModel, { Node } from 'tree-model'
import { ChangeDataList, LdapChange, ModifyDnNodeObject, TreeNode, ObjectClassSchema } from "../common"
import { getEncryptPassword } from './LdapCrypto'

export function getAttributeChanges(attrTree: TreeNode[], deleteNodeList?: TreeNode[]): LdapChange {
  let attrRootNode: Node<TreeNode> = new TreeModel().parse(attrTree)

  let allChangeDataList: ChangeDataList[] = []

  let addChangeData: Attribute[] = []
  let replaceChangeData: Attribute[] = []
  let deleteChangeData: Attribute[] = []

  let rootId: string = ''

  if (typeof deleteNodeList !== 'undefined' && deleteNodeList.length > 0) {
    // delete
    deleteNodeList.forEach((node: TreeNode) => {
      let attrId: string = node.id
      let deleteNodeName: string | undefined = node.name

      if (node.id === node.name) {
        // netgroup
        let parentNode: TreeNode | undefined = node.parent
        let replaceDataInDeleteList: string[] = []

        if (parentNode) {
          attrId = parentNode.id
          parentNode.children.forEach((childNode: TreeNode) => {
            if (childNode.name && childNode.name !== deleteNodeName) {
              replaceDataInDeleteList.push(childNode.name)
            }
          })
        }

        replaceChangeData.push(
          new Attribute({
            type: attrId,
            values: replaceDataInDeleteList
          })
        )
      } else {
        if (deleteNodeName) {
          deleteChangeData.push(
            new Attribute({
              type: attrId,
              values: [deleteNodeName]
            })
          )
        }
      }
    })
  }
  
  attrRootNode.walk((node : Node<TreeNode>) => {
    let attrId = ''
    let data = ''
    let pwdAlgo = ''
    let pwd = ''

    if (!node.isRoot() && node.model.id !== '') {
      if (rootId === '') {
        if (typeof node.model.data !== 'undefined') {
          if (node.model.data.includes('dn')) {
            const tmpData: string[] = node.model.data.split(':')
            rootId = tmpData[1]
          }
        }
      }

      if (isNewNode(node.model.id)) {
        // 신규 Node
        if (typeof node.model.name !== 'undefined' && node.model.name.includes('=')) {
          // key=value 형식일 때, add
          const attribute: string[] = node.model.name.split('=')
          attrId = attribute[0].trim()
          data = node.model.name.replace(attrId + '=','').trim()

          if (attrId === 'userPassword') {
            // userPassword 인 경우, pwd 암호화 처리
            const tmpData: string[] = data.split(':')
            pwdAlgo = tmpData[0]
            pwd = tmpData[1]
            data = getEncryptPassword(pwd, pwdAlgo)
          }

          addChangeData.push(
            new Attribute({
              type: attrId,
              values: [data]
            })
          )
        } else {
          // 값만 들어간 경우, 배열로 만들어 replace
          const parentNode = node.model.parent
          const replaceDataList: string[] = []

          attrId = parentNode.id

          if (!isNewNode(attrId)) {
            parentNode.children.forEach((childNode: TreeNode) => {
              if (childNode.name) {
                replaceDataList.push(childNode.name.trim())
              }
            })
  
            replaceChangeData.push(
              new Attribute({
                type: attrId,
                values: replaceDataList
              })
            )
          }
        }
      } else {
        // 기존 ID가 있고, data가 다른 경우 replace
        let originData: string

        attrId = node.model.id
        data = node.model.name.trim()

        if (typeof node.model.data !== 'undefined' && node.model.data.includes(':')) {
          originData = node.model.data.split(':')[1].trim()
        } else {
          originData = node.model.data
        }

        if (originData !== data) {
          const parentNode = node.model.parent
          const replaceDataList: string[] = []

          if (parentNode.id === parentNode.name) {
            attrId = parentNode.id
            parentNode.children.forEach((childNode: TreeNode) => {
              if (childNode.name) {
                replaceDataList.push(childNode.name.trim())
              }
            })

            replaceChangeData.push(
              new Attribute({
                type: attrId,
                values: replaceDataList
              })
            )
          } else {
            // userPassword 인 경우, pwd 암호화 처리
            if (attrId === 'userPassword') {
              const tmpData: string[] = node.model.name.split(':')
              pwdAlgo = tmpData[0]
              pwd = tmpData[1]

              data = getEncryptPassword(pwd, pwdAlgo)
            }

            if (data && data !== '') {
              replaceChangeData.push(
                new Attribute({
                  type: attrId,
                  values: [data]
                })
              )
            }
          }
        }
      }
    }

    return true
  })

  if (deleteChangeData.length > 0) {
    allChangeDataList.push({
      operation: 'delete',
      modificationList: deleteChangeData
    })
  }
  if (replaceChangeData.length > 0) {
    allChangeDataList.push({
      operation: 'replace',
      modificationList: replaceChangeData
    })
  }
  if (addChangeData.length > 0) {
    allChangeDataList.push({
      operation: 'add',
      modificationList: addChangeData
    })
  }

  const returnData: LdapChange = {
    dn: rootId,
    changeDataList: allChangeDataList
  }
  return returnData
}

export function getAddAttributeList(nodeName: string, attrTree: TreeNode[]): [string, Attribute[]] {
  let attrRootNode: Node<TreeNode> = new TreeModel().parse(attrTree)
  let attrList: Attribute[] = []
  let rootId: string = ''

  attrRootNode.walk((node : Node<TreeNode>) => {
    let attrId = ''
    let data = ''
    let pwdAlgo = ''
    let pwd = ''

    if (!node.isRoot() && node.model.id !== '') {
      if (isNewNode(node.model.id)) {
        // 신규 Node
        if (typeof node.model.name !== 'undefined') {
          if (node.model.name.includes('=')) {
            // key=value 형식일 때, add
            const attribute: string[] = node.model.name.split('=')
            attrId = attribute[0].trim()
            data = node.model.name.replace(attrId + '=','').trim()
  
            if (attrId === 'dn') {
              rootId = data
            } else {
              if (attrId === 'userPassword') {
                // userPassword 인 경우, pwd 암호화 처리
                const tmpData: string[] = data.split(':')
                pwdAlgo = tmpData[0]
                pwd = tmpData[1]
                data = getEncryptPassword(pwd, pwdAlgo)
              }
      
              attrList.push(
                new Attribute({
                  type: attrId,
                  values: [data]
                })
              )
            }
          } else {
            // 값만 들어간 경우, 배열로 만들어 replace
            const parentNode = node.model.parent
            const addDataList: string[] = []
  
            attrId = parentNode.id
  
            if (parentNode.name === nodeName) {
              node.model.children.forEach((childNode: TreeNode) => {
                if (childNode.name) {
                  addDataList.push(childNode.name.trim())
                }
              })
              
              attrList.push(
                new Attribute({
                  type: node.model.name,
                  values: addDataList
                })
              )
            }
          }
        }
      }
    }

    return true
  })

  return [rootId, attrList]
}

export function getModifyDn(modifyDnNodeObject: ModifyDnNodeObject): [string, string] {
  let nodeDn: string  = modifyDnNodeObject.nodeDn
  let nodeName: string = modifyDnNodeObject.nodeName
  let originParentNodeDn: string | undefined = modifyDnNodeObject.originParentNodeDn
  let modifyParentNodeDn: string | undefined = modifyDnNodeObject.modifyParentNodeDn
  let modifyDn: string = ''
  let originName = nodeDn.split(',')[0]
  
  if (nodeName !== originName) {
    modifyDn = nodeDn.replace(originName, nodeName)
  }
    
  if (typeof originParentNodeDn !== 'undefined' && typeof modifyParentNodeDn !== 'undefined') {
    if (originParentNodeDn !== modifyParentNodeDn) {
      if (modifyDn === '') {
        modifyDn = nodeDn.replace(originParentNodeDn, modifyParentNodeDn)
      } else {
        let tmpDn: string = modifyDn
        modifyDn = tmpDn.replace(originParentNodeDn, modifyParentNodeDn)
      }
    }
  }

  return [nodeDn, modifyDn]
}

export function getDeleteDn(deleteDnNode: TreeNode): [string, string] {
  let originDn: string = '';
  let parentDn: string = '';
  if (typeof deleteDnNode.data !== 'undefined') {
    let dataObject = JSON.parse(JSON.stringify(deleteDnNode.data))
    originDn = dataObject.dn
    if (typeof deleteDnNode.parent !== 'undefined') {
      parentDn = deleteDnNode.parent.id
    }
  }

  return [originDn,parentDn]
}

export function isNewNode(nodeId: string): Boolean {
  const timestampRegex = new RegExp('[0-9]{13}')

  if (timestampRegex.test(nodeId)) {
    return true
  } else {
    return false
  }
}

export function getParentDn(node: TreeNode): string {
  let tmpNode: TreeNode = node
  let parentDn: string = ''

  if (typeof tmpNode.id !== 'undefined') {
    while (tmpNode.id !== '0' && tmpNode.parent !== null) {
      if (isNewNode(tmpNode.id)) {
        if (parentDn === '') {
          if (typeof tmpNode.name !== 'undefined') {
            parentDn = tmpNode.name
          }
        } else {
          if (typeof tmpNode.name !== 'undefined') {
            parentDn += ',' + tmpNode.name
          }
        }
      } else {
        if (parentDn === '') {
          parentDn = tmpNode.id
        } else {
          parentDn += ',' + tmpNode.id
        }
      }
  
      if (typeof tmpNode.parent !== 'undefined') {
        tmpNode = tmpNode.parent
      }
    }
  }
  
  return parentDn
}

export function getObjectClassSchemaList(schemaResult: SearchResult|null): ObjectClassSchema[] {
  let objectSchemaList: ObjectClassSchema[] = []

  if (schemaResult !== null && schemaResult.searchEntries.length > 0){
    let searchEntry = schemaResult.searchEntries
  
    searchEntry.forEach(entry => {
      let objectClasses = entry.objectClasses

      if (Array.isArray(objectClasses)){
        objectClasses.forEach((objectClass: string | Buffer) =>{
          const regex = /^\( | \)$/g
          objectClass = objectClass.toString().trim().replace(regex,'').trim()

          const objectRegex = / (NAME|DESC|OBSOLETE|SUP|ABSTRACT|STRUCTURAL|AUXILIARY|MUST|MAY)/g
          const tmpObjectClass = objectClass.replace(objectRegex, '\n$1\:',).split('\n')

          let name: string = ''
          let must: string[]|null = null
          let may: string[]|null = null
          let sup: string = ''

          tmpObjectClass.forEach((objectValue: string) => {
            let keyValueArr = objectValue.split(':')

            if (keyValueArr[0] === 'NAME') {
              name = keyValueArr[1].replace(/\'|\(|\)/g, '').trim()
            } else if (keyValueArr[0] === 'MUST' || keyValueArr[0] === 'MAY') {
              let key = keyValueArr[0].trim().toLowerCase()
              let value = keyValueArr[1]
              if (value !== null && value.length > 0) {
                let data: string[] = []
                let tmpData: string = value.replace(/\( | \)/g, '').trim()

                if (value.indexOf('$') > 0) {
                  data = tmpData.split('$').map((value: string) => (value = value.trim()))
                } else {
                  data = [ tmpData ]
                }
                
                if (key === 'must'){
                  must = data
                } else if (key === 'may'){
                  may = data
                }
              }
            } else if (keyValueArr[0] === 'SUP') {
              sup = keyValueArr[1].trim().toLocaleLowerCase()
            }
          })

          if (name.indexOf(' ') > 0) {
            name.split(' ').forEach((multipleName: string) => {
              let newNode: ObjectClassSchema = {
                name: multipleName,
                must: must,
                may: may,
                sup: sup,
                isSup: false
              }

              objectSchemaList.push(newNode)
            })
          } else {
            let newNode: ObjectClassSchema = {
              name: name,
              must: must,
              may: may,
              sup: sup,
              isSup: false
            }

            objectSchemaList.push(newNode)
          }
        })
      }
    })
  }

  return objectSchemaList
}
