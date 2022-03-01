import { Attribute, Entry, SearchResult } from 'ldapts'
import TreeModel, { Node } from 'tree-model'
import { LdapChange, TreeNode, ChangeDataList, ModifyDnNodeObject } from './common'
import { getEncryptPassword } from './LdapCrypto'

export class LdapTree {
  private dummyRootNode: Node<TreeNode>;
  private tree: TreeModel;

  constructor() {
    this.tree = new TreeModel({
      modelComparatorFn: (left : Node<TreeNode>, right : Node<TreeNode>) => {
        return left.name > right.name
      }
    })

    this.dummyRootNode = this.tree.parse({
      id: '0',
      children: []
    })
  }

  get rootNode(): Node<TreeNode> | undefined {
    return this.dummyRootNode.children[0]
  }

  makeEntryTree(baseDn: string, searchResult: SearchResult): void {
    const baseDnList = baseDn.split(',')
    const entries = searchResult.searchEntries

    entries.forEach((entry : Entry) => {
      let realDn: string[] = entry.dn
        .split(',')
        .reverse()
        .filter((dnNode: string) => !baseDnList.includes(dnNode))

      let parentNode: Node<TreeNode> = this.tree.parse({
        id: 'tmp',
        children: []
      })

      // Create Real Root Node
      // Or
      // Create Child Node
      if (!this.dummyRootNode.hasChildren()) {
        const rootNode: Node<TreeNode> = this.tree.parse({
          id: entry.dn,
          name: entry.dn,
          isLeaf: true,
          isVisible: true,
          isExpanded: true,
          dragDisabled: false,
          data: entry,
          children: []
        })

        this.dummyRootNode.addChild(rootNode)
      } else {
        realDn.forEach((nodeName: string) => {
          if (this.rootNode) {
            const tmpNode: Node<TreeNode> | undefined = this.rootNode.first(
              (node: Node<TreeNode>) => node.model.name === nodeName
            )
  
            if (tmpNode) {
              parentNode = tmpNode
            }
          }
        })

        let dn: string | undefined = realDn.pop()

        if (dn){
          let newNode: TreeNode = {
            id: dn,
            name: dn,
            isLeaf: true,
            isVisible: true,
            dragDisabled: false,
            data: (entry as unknown as string),
            children: []
          }
  
          if (parentNode.model.id === 'tmp') {
            if (this.rootNode) {
              this.rootNode.model.isLeaf = false
              this.rootNode.addChild(this.tree.parse(newNode))
            }
          } else {
            if (parentNode.model.isLeaf) {
              parentNode.model.isLeaf = false
            }
            parentNode.addChild(this.tree.parse(newNode))
          }
        }
      }
    })
  }

  makeAttrTree(id: string, attrEntry: Entry): TreeNode {
    const attrRootNode: TreeNode = {
      id: '',
      name: id,
      children: [],
      isExpanded: true,
      isVisible: true,
      isLeaf: false,
      dragDisabled: true
    }

    Object.keys(attrEntry)
      .sort()
      .forEach((key : string) => {
        
        if (Array.isArray(attrEntry[key])) {
          const attrChild: TreeNode[] = [];

          (attrEntry[key] as string[]).forEach((attr: string) => {
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
          attrRootNode.children.push({
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
          const data: string = key + ' : ' + (attrEntry[key] as string)
          attrRootNode.children.push({
            id: key,
            name: (attrEntry[key] as string),
            data: data,
            children: [],
            isExpanded: true,
            isVisible: true,
            isLeaf: true,
            dragDisabled: true
          })
        }
      })

    return attrRootNode
  }

  getAttributeChanges(attrTree: TreeNode[], deleteNodeList: TreeNode[]): LdapChange {
    let attrRootNode: Node<TreeNode> = new TreeModel().parse(attrTree)

    let allChangeDataList: ChangeDataList[] = []

    let addChangeData: Attribute[] = []
    let replaceChangeData: Attribute[] = []
    let deleteChangeData: Attribute[] = []

    let rootId: string = ''

    if (deleteNodeList.length > 0) {
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
        if (rootId === '' && node.model.data.includes('dn')) {
          const tmpData: string[] = node.model.data.split(':')
          rootId = tmpData[1]
        }

        const newIdPattern = /\d{13}/

        if (newIdPattern.test(node.model.id)) {
          // 신규 Node
          if (node.model.name.includes('=')) {
            // key=value 형식일 때, add
            const attribute: string[] = node.model.name.split('=')
            attrId = attribute[0]
            data = attribute[1].trim()

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
        } else {
          // 기존 ID가 있고, data가 다른 경우 replace
          let originData: string

          attrId = node.model.id
          data = node.model.name.trim()

          if (node.model.data.includes(':')) {
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

  getModifyDn(modifyDnNodeObject: ModifyDnNodeObject): [string, string] {
    let nodeDn: string  = modifyDnNodeObject.nodeDn
    let nodeName: string = modifyDnNodeObject.nodeName
    let originParentNodeDn: string | undefined = modifyDnNodeObject.originParentNodeDn
    let modifyParentNodeDn: string | undefined = modifyDnNodeObject.modifyParentNodeDn
    let modifyDn: string = ''
    let originName = nodeDn.replace(',' + originParentNodeDn, '')
  
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
}
