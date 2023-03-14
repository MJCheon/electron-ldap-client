import { Attribute } from 'ldapts'

export interface LdapConfig {
  ip: string;
  port: number;
  ssl: string;
  baseDn: string;
  rootDn: string;
  passwd: string;
  connTimeout?: number;
}

export type TreeNode = {
  id: string;
  name?: string;
  isLeaf?: boolean | true;
  isVisible?: boolean;
  isExpanded?: boolean;
  dragDisabled?: boolean;
  data?: string;
  parent?: TreeNode;
  addTreeNodeDisabled?: boolean;
  children: TreeNode[];
}

export type AddDnNodeObject = {
  nodeId: string;
  nodeName: string;
  attrTree: TreeNode[];
}

export type ModifyDnNodeObject = {
  nodeName: string;
  nodeDn: string;
  originParentNodeDn?: string;
  modifyParentNodeDn?: string;
}

export type AddDnObject = {
  dn: string;
  attrList: Attribute[];
}

export type ModifyDnObject = {
  originDn: string;
  modifyDn: string;
}

export type DeleteDnObject = {
  originDn: string;
  parentDn: string;
}

export type ModifyAttributeTreeNodeObject = {
  tree: TreeNode[],
  deleteList: TreeNode[]
}

export type ChangeDataList = {
  operation: 'add' | 'replace' | 'delete';
  modificationList: Attribute[];
}

export type LdapChange = {
  dn: string;
  changeDataList: ChangeDataList[];
}

export type ObjectClassSchema = {
  name: string;
  must: string[] | null;
  may: string[] | null;
  sup: string;
  isSup: boolean;
}