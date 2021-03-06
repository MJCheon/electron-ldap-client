import { Attribute } from 'ldapts'
import TreeModel, { Node } from 'tree-model'
import { ChangeDataList, LdapChange, ModifyDnNodeObject, TreeNode } from "../Common"
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
        // ?????? Node
        if (typeof node.model.name !== 'undefined' && node.model.name.includes('=')) {
          // key=value ????????? ???, add
          const attribute: string[] = node.model.name.split('=')
          attrId = attribute[0].trim()
          data = node.model.name.replace(attrId + '=','').trim()

          if (attrId === 'userPassword') {
            // userPassword ??? ??????, pwd ????????? ??????
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
          // ?????? ????????? ??????, ????????? ????????? replace
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
        // ?????? ID??? ??????, data??? ?????? ?????? replace
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
            // userPassword ??? ??????, pwd ????????? ??????
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
        // ?????? Node
        if (typeof node.model.name !== 'undefined') {
          if (node.model.name.includes('=')) {
            // key=value ????????? ???, add
            const attribute: string[] = node.model.name.split('=')
            attrId = attribute[0].trim()
            data = node.model.name.replace(attrId + '=','').trim()
  
            if (attrId === 'dn') {
              rootId = data
            } else {
              if (attrId === 'userPassword') {
                // userPassword ??? ??????, pwd ????????? ??????
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
            // ?????? ????????? ??????, ????????? ????????? replace
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