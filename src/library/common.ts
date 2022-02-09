import { dialog } from 'electron'
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

export function showError (title: string, message: string) {
  const option = {
    type: 'error',
    title: title,
    message: message
  }

  dialog.showMessageBox(option)
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
};

export type ChangeDataList = {
  operation: 'add' | 'replace' | 'delete';
  modificationList: Attribute[];
};

export type LdapChange = {
  dn: string;
  changeDataList: ChangeDataList[];
};
