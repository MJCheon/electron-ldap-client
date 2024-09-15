export default interface LdapNode {
  id: string;
  children: LdapNode[];
  ldapData: string;
  name: string;
  type: 'dir' | 'file';
}
