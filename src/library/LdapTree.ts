import { Attribute, Entry, SearchEntry, SearchResult } from 'ldapts'
import TreeModel, { Node } from 'tree-model'
import { LdapChange, TreeNode, ChangeDataList } from './common'
import { getEncryptPassword } from './LdapCrypto'

export class LdapTree {
  private dummyRootNode: Node<TreeNode>;
  private tree: TreeModel;

  constructor() {
    this.tree = new TreeModel({
      modelComparatorFn: (left, right) => {
        return left.name > right.name
      }
    })

    this.dummyRootNode = this.tree.parse({
      id: '0',
      children: []
    })
  }

  get rootNode(): Node<TreeNode> | undefined {
    return this.dummyRootNode.first((node: Node<TreeNode>) => {
      if (node.isRoot() && node.hasChildren()) {
        return node.children[0]
      }
    })
  }

  makeEntryTree(baseDn: string, searchResult: SearchResult): void {
    const baseDnList = baseDn.split(',')
    const entries = searchResult.searchEntries

    entries.forEach((entry) => {
      const realDn = entry.dn
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
          dragDisabled: true,
          data: entry,
          children: []
        })

        this.dummyRootNode.addChild(rootNode)
      } else {
        realDn.forEach((nodeName: string) => {
          const tmpNode: Node<TreeNode> | undefined = this.dummyRootNode.first(
            (node: Node<TreeNode>) => node.model.name === nodeName
          )

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
          data: entry,
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
    })
  }

  makeAttrTree(id: string, attrData: any): TreeNode {
    const attrRootNode: TreeNode = {
      id: '',
      name: id,
      children: [],
      isExpanded: true,
      isVisible: true,
      isLeaf: false,
      dragDisabled: true
    }

    Object.keys(attrData)
      .sort()
      .forEach((key) => {
        if (Array.isArray(attrData[key])) {
          const attrChild: TreeNode[] = []
          attrData[key].forEach((attr: string) => {
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
          const data = key + ' : ' + attrData[key]
          attrRootNode.children.push({
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

    return attrRootNode
  }

  getChangesFromData(tree: TreeNode, deleteNodeList: TreeNode[]) {
    const rootNode: Node<TreeNode> = new TreeModel().parse(tree)

    const allChangeDataList: ChangeDataList[] = []

    const addChangeData: Attribute[] = []
    const replaceChangeData: Attribute[] = []
    const deleteChangeData: Attribute[] = []

    let rootId = ''

    if (deleteNodeList.length > 0) {
      // delete
      deleteNodeList.forEach((node) => {
        let attrId: string = node.id
        const deleteNodeName: string | undefined = node.name

        if (node.id === node.name) {
          // netgroup
          const parentNode = node.parent
          const replaceDataInDeleteList: string[] = []

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

    rootNode.walk((node) => {
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
}
