import { IpcMainEvent } from 'electron';
import { Entry, SearchResult } from 'ldapts';
import LdapFactory from '../libs/ldap/LdapFactory';
import LdapServer from '../libs/ldap/LdapServer';
import LdapTree from '../libs/ldap/LdapTree';
import getObjectClassSchemaList from '../libs/ldap/LdapUtil';

export async function connectLdap(
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

export async function modifyDn(
  event: IpcMainEvent,
  name: string,
  newName: string,
): Promise<void> {
  const ldapServer: LdapServer = LdapFactory.Instance();

  const result: boolean = await ldapServer.modifyDn(name, newName);

  event.returnValue = result;
}

export async function refresh(event: IpcMainEvent): Promise<void> {
  const ldapServer: LdapServer = LdapFactory.Instance();

  if (ldapServer.isConnected()) {
    const searchResult: SearchResult | null = await ldapServer.search();
    const searchEntries: Entry[] | undefined = searchResult?.searchEntries;

    if (searchEntries !== undefined) {
      const ldapTree = new LdapTree(ldapServer.baseDn, searchEntries);
      event.returnValue = ldapTree.rootNode;
    }
  }
  event.returnValue = undefined;
}

export async function getObjectSchemas(event: IpcMainEvent): Promise<void> {
  const ldapserver: LdapServer = LdapFactory.Instance();

  if (ldapserver.isConnected()) {
    const searchResult: SearchResult | null =
      await ldapserver.searchObjectClassSchema();

    if (searchResult !== null) {
      event.returnValue = getObjectClassSchemaList(searchResult);
    }
  }

  event.returnValue = null;
}
