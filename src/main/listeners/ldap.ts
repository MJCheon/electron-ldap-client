import { IpcMainEvent } from 'electron';
import { Entry, SearchResult } from 'ldapts';
import LdapFactory from '../libs/ldap/LdapFactory';
import LdapServer from '../libs/ldap/LdapServer';
import LdapTree from '../libs/ldap/LdapTree';

export default async function connectLdap(
  event: IpcMainEvent,
  val: any,
): Promise<void> {
  const ldapServer: LdapServer = LdapFactory.Instance(val);
  const isAuthenticated: boolean = await ldapServer.connect();

  if (isAuthenticated) {
    const searchResult: SearchResult | null = await ldapServer.search();
    const searchEntries: Entry[] | undefined = searchResult?.searchEntries;

    if (searchEntries !== undefined) {
      const ldapTree = new LdapTree(ldapServer.baseDn, searchEntries);
      event.returnValue = ldapTree.rootNode;
    }
  }
  event.returnValue = undefined;
}
