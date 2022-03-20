import { Entry, SearchResult } from 'ldapts'
import TreeModel, { Node } from 'tree-model'
import { TreeNode } from './common'

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

  makeAttrTree(nodeName: string, parentDn: string, attributes?: Entry): TreeNode[] {
    const attrRootNode: TreeNode = {
      id: '',
      name: nodeName,
      children: [],
      isExpanded: true,
      isVisible: true,
      isLeaf: false,
      dragDisabled: true
    }

    if (typeof attributes !== 'undefined') {
      Object.keys(attributes).sort().forEach((key : string) => {
        
        if (Array.isArray(attributes[key])) {
          const attrChild: TreeNode[] = [];

          (attributes[key] as string[]).forEach((attr: string) => {
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
          const data: string = key + ' : ' + (attributes[key] as string)
          attrRootNode.children.push({
            id: key,
            name: (attributes[key] as string),
            data: data,
            children: [],
            isExpanded: true,
            isVisible: true,
            isLeaf: true,
            dragDisabled: true
          })
        }
      })
    } else {
      let timestampId = Date.now()
      // dn 추가
      let realDn: string = nodeName + ',' + parentDn

      attrRootNode.children.push({
        id: timestampId.toString(),
        name: 'dn=' + realDn,
        children: [],
        isExpanded: false,
        isVisible: true,
        isLeaf: true,
        dragDisabled: true
      })

      // cn, uid, 등 기본 추가
      if (nodeName.includes('=')) {
        let id = nodeName.split('=')[0]
        let name = nodeName.split('=')[1]

        attrRootNode.children.push({
          id: (timestampId + 1).toString(),
          name: id+'='+name,
          children: [],
          isExpanded: false,
          isVisible: true,
          isLeaf: true,
          dragDisabled: true
        })
      }
    }
    
    return [attrRootNode]
  }
}
