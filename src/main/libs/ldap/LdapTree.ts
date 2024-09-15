import { Entry } from 'ldapts';
import LdapNode from '../../../types/LdapNode';

export default class LdapTree {
  private root!: LdapNode;

  constructor(baseDn: string, searchEntries: Entry[]) {
    const baseDnList: string[] = baseDn.split(',');
    const totalLength: number = searchEntries.length;

    searchEntries.forEach((entry: Entry) => {
      const realDnList: string[] = entry.dn
        .split(',')
        .reverse()
        .filter((dn: string) => !baseDnList.includes(dn));

      if (entry.dn === baseDn) {
        this.root = {
          id: entry.dn,
          name: entry.dn,
          ldapData: JSON.stringify(entry),
          children: [],
          type: totalLength > 1 ? 'dir' : 'file',
        };
      } else {
        const realDn = realDnList.pop();
        if (realDn !== undefined) {
          const newNode: LdapNode = {
            id: entry.dn,
            name: realDn,
            ldapData: JSON.stringify(entry),
            children: [],
            type: 'file',
          };

          if (realDnList.length > 0) {
            const parentDn = realDnList.pop();

            if (parentDn !== undefined) {
              const parentNode: LdapNode | undefined = this.searchNode(
                this.root,
                parentDn,
              );

              if (parentNode !== undefined) {
                parentNode.children.push(newNode);
                parentNode.children.reverse();
                parentNode.type = 'dir';
              }
            }
          } else {
            this.root.children.push(newNode);
            this.root.children.reverse();
          }
        }
      }
    });
  }

  get rootNode(): LdapNode {
    return this.root;
  }

  searchNode(node: LdapNode, dn: string): LdapNode | undefined {
    if (node.name === dn) {
      return node;
    }

    return (
      node.children
        .map((childNode) => this.searchNode(childNode, dn))
        .find((foundNode) => foundNode !== undefined) || undefined
    );
  }
}
