import { IpcMainEvent } from "electron"
import { Attribute, Entry, SearchResult } from "ldapts"
import { Node } from 'tree-model'
import { AddDnNodeObject, AddDnObject, DeleteDnObject, LdapChange, LdapConfig, ModifyAttributeTreeNodeObject, ModifyDnNodeObject, ModifyDnObject, ObjectClassSchema, TreeNode } from "../Common"
import { LdapFactory } from "../ldap/LdapFactory"
import { LdapServer } from "../ldap/LdapServer"
import { LdapTree } from "../ldap/LdapTree"
import { getAddAttributeList, getAttributeChanges, getDeleteDn, getModifyDn, getParentDn, getObjectClassSchemaList } from "../ldap/LdapUtil"

export async function serverBind (event : IpcMainEvent , ldapConfig : LdapConfig): Promise<void> {
  const ldapServer: LdapServer = LdapFactory.Instance()

  if (typeof ldapServer !== 'undefined' && ldapServer.isConnected() && ldapConfig !== ldapServer.ldapConfig) {
    await ldapServer.disconnect()
  }
  
  ldapServer.ldapConfig = ldapConfig
  const isAuthenticated: boolean = await ldapServer.connect()
  
  if (isAuthenticated){
    let searchResult: SearchResult | null = await ldapServer.search()
    let ldapTree: LdapTree = new LdapTree()

    if (searchResult){
      ldapTree.makeEntryTree(ldapServer.baseDn, searchResult)

      const objectClassSchemas = await ldapServer.searchObjectClassSchema()
      
      ldapServer.objectClassSchemas = getObjectClassSchemaList(objectClassSchemas)

      const objectClassNameList = ldapServer.objectClassSchemas.map(objectClass => {
        return objectClass.name
      })

      let rootNode : Node<TreeNode> | undefined = ldapTree.rootNode
      if (rootNode) {
        const searchResponse: Node<TreeNode>[] = [ rootNode.model ]
        event.reply('allSearchResponse', searchResponse, objectClassNameList)
      }
    }
  }
}

export function getAttributeTree (event : IpcMainEvent, nodeName: string, nodeParent: TreeNode, attributes: Entry): void {
  let ldapTree: LdapTree = new LdapTree()
  let parentDn: string = getParentDn(nodeParent)
  const attrResponse: TreeNode[] = ldapTree.makeAttrTree(nodeName, parentDn, null, attributes)
  event.reply("attributeTreeResponse", attrResponse, false)
}

export function getNewAttributeTree(event : IpcMainEvent, nodeName: string, nodeParent: TreeNode, selectedObjectClassNameList: ObjectClassSchema[]): void {
  let ldapTree: LdapTree = new LdapTree()
  let parentDn: string = getParentDn(nodeParent)
  let objectClassSupList: string[] = []
  const objectClassSchemaList = LdapFactory.Instance().objectClassSchemas
  
  const selectedObjectClassList: ObjectClassSchema[] = objectClassSchemaList.filter((objectClass: ObjectClassSchema) => {
    if (selectedObjectClassNameList.toString().includes(objectClass.name)) {
      if (objectClass.sup !== '') {
        objectClassSupList.push(objectClass.sup)
      }

      return true
    }
  })

  while (objectClassSupList.length > 0) {
    let tmpSupList: string[] = []

    objectClassSupList.forEach((name: string) => {
      let supObjectClass = objectClassSchemaList.find((objectClass: ObjectClassSchema) => objectClass.name.toLowerCase() === name.toLowerCase())

      if (supObjectClass) {
        if (selectedObjectClassList.indexOf(supObjectClass) === -1) {
          supObjectClass.isSup = true
          selectedObjectClassList.push(supObjectClass)

          if (supObjectClass.sup !== '') {
            tmpSupList.push(supObjectClass.sup)
          }
        }
      }

    })

    if (tmpSupList.length > 0) {
      objectClassSupList = tmpSupList
    } else {
      objectClassSupList = []
    }
  }

  const attrResponse: TreeNode[] = ldapTree.makeAttrTree(nodeName, parentDn, selectedObjectClassList)
  event.reply("attributeTreeResponse", attrResponse, true)
}

export async function refreshRootTree (event : IpcMainEvent): Promise<void> {
  const ldapServer: LdapServer = LdapFactory.Instance()
  let searchResult: SearchResult | null = await ldapServer.search()
  let ldapTree: LdapTree = new LdapTree()
  if (searchResult){
    ldapTree.makeEntryTree(ldapServer.baseDn, searchResult)

    const objectClassSchemas = await ldapServer.searchObjectClassSchema()
      
    ldapServer.objectClassSchemas = getObjectClassSchemaList(objectClassSchemas)

    const objectClassNameList = ldapServer.objectClassSchemas.map((objectClass: ObjectClassSchema) => {
      return objectClass.name
    })

    let rootNode : Node<TreeNode> | undefined = ldapTree.rootNode
      if (rootNode) {
        const searchResponse: Node<TreeNode>[] = [ rootNode.model ]
        event.reply('allSearchResponse', searchResponse, objectClassNameList )
      }
  }
}

export async function saveAllToLdap (event: IpcMainEvent, addDnNodeList: AddDnNodeObject[], modifyDnNodeList: ModifyDnNodeObject[], saveAttributeList: ModifyAttributeTreeNodeObject[], deleteDnNodeList: TreeNode[]): Promise<void> {
  const ldapServer: LdapServer = LdapFactory.Instance()

  if (addDnNodeList.length > 0) {
    addDnNodeList.forEach(async (addDnNodeObject: AddDnNodeObject) => {
      let [dn, attrList] = getAddAttributeList(addDnNodeObject.nodeName, addDnNodeObject.attrTree)

      if (ldapServer.isConnected()) {
        await ldapServer.add(dn, attrList)
      }
    })
  }

  if (modifyDnNodeList.length > 0) {
    modifyDnNodeList.forEach(async (modifyDnNodeObject: ModifyDnNodeObject) => {
      let [nodeDn, modifyDn] = getModifyDn(modifyDnNodeObject)
      if (ldapServer.isConnected()) {
        await ldapServer.modifyDn(nodeDn, modifyDn)
      }
    })
  }

  if (saveAttributeList.length > 0) {
    saveAttributeList.forEach(async (attribute: ModifyAttributeTreeNodeObject) => {
      let attrTree: TreeNode[] = attribute.tree
      let deleteList: TreeNode[] = attribute.deleteList
      let changeData: LdapChange = getAttributeChanges(attrTree, deleteList)

      if (ldapServer.isConnected()) {
        await ldapServer.modify(changeData)
      }
    })
  }

  if (deleteDnNodeList.length > 0) {
    deleteDnNodeList.forEach(async (deleteDnNode: TreeNode) => {
      let [originDn, parentDn] = getDeleteDn(deleteDnNode)

      if (ldapServer.isConnected()) {
        await ldapServer.delete(originDn)
      }
    })
  }

  await new Promise(resolve => setTimeout(resolve, 1000))
  event.reply("refreshRootTreeFromMain")
}

export async function showAllChange(event : IpcMainEvent, addDnNodeList: AddDnNodeObject[], modifyDnNodeList : ModifyDnNodeObject[], saveAttributeList: ModifyAttributeTreeNodeObject[], deleteDnNodeList: TreeNode[]): Promise<void> {
  const ldapServer: LdapServer = LdapFactory.Instance()

  let addDnList: AddDnObject[] = []
  let modifyDnList: ModifyDnObject[] = []
  let changeAttrList: LdapChange[] = []
  let deleteDnList: DeleteDnObject[] = []

  if (addDnNodeList.length > 0) {
    addDnNodeList.forEach((addDnNode: AddDnNodeObject) => {
      let [dn, attrList]: [string, Attribute[]] = getAddAttributeList(addDnNode.nodeName, addDnNode.attrTree)

      addDnList.push({
        dn: dn,
        attrList: attrList
      })
    })
  }

  if (modifyDnNodeList.length > 0) {
    modifyDnNodeList.forEach((modifyDnNodeObject: ModifyDnNodeObject) => {
      let [originDn, modifyDn]: [string, string] = getModifyDn(modifyDnNodeObject)

      modifyDnList.push({
        originDn: originDn,
        modifyDn: modifyDn
      })
    })
  }

  if (saveAttributeList.length > 0) {
    saveAttributeList.forEach((attribute: ModifyAttributeTreeNodeObject) => {
      let attrTree: TreeNode[] = attribute.tree
      let deleteList: TreeNode[] = attribute.deleteList
      let changeData: LdapChange = getAttributeChanges(attrTree, deleteList)
      changeAttrList.push(changeData)
    })
  }

  if (deleteDnNodeList.length > 0) {
    deleteDnNodeList.forEach((deleteDnNode: TreeNode) => {
      let [originDn, parentDn]: [string, string] = getDeleteDn(deleteDnNode)

      if (originDn !== '' && parentDn !== '') {
        deleteDnList.push({
          originDn: originDn,
          parentDn: parentDn
        })
      }
    })
  }
  
  event.reply("returnShowChangePage", addDnList, modifyDnList, changeAttrList, deleteDnList)
}