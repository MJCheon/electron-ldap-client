import { Attribute, Change, Client, SearchOptions, SearchResult } from 'ldapts';

import { getSchemaAttributes } from 'ldap-schema-ts-generator';
import { LdapError, ErrorData, makeErrorData, showError } from '../Error';
import ServerInfo from '../../../types/ServerInfo';
import { decrypt } from '../../utils/password';
import { getParsedUuid } from '../../utils/uuid';

export default class LdapServer {
  private client!: Client;

  private serverInfo!: ServerInfo;

  constructor(info: ServerInfo) {
    info.password = decrypt(
      info.password,
      getParsedUuid(info.id),
      Buffer.from(info.iv),
    );

    this.serverInfo = info;
  }

  async connect(): Promise<boolean> {
    let url: string = `${this.serverInfo.ip}:${this.serverInfo.port}`;

    if (this.serverInfo.security === 'ssl') {
      url = `ldaps://${url}`;
    } else {
      url = `ldap://${url}`;
    }

    this.client = new Client({
      url,
      connectTimeout: +this.serverInfo.connectTimeout,
    });

    let isAuthenticated: boolean;

    try {
      await this.client.bind(this.serverInfo.rootDn, this.serverInfo.password);
      isAuthenticated = true;
    } catch (ex) {
      isAuthenticated = false;

      const errMsg: string = String(ex);
      const data: ErrorData = makeErrorData('dn', this.serverInfo.rootDn);

      const ldapError: LdapError = {
        msg: errMsg,
        data,
      };

      showError('LDAP Connect Error', ldapError);

      if (this.client.isConnected) {
        await this.client.unbind();
      }
    }

    return isAuthenticated;
  }

  isConnected(): boolean {
    if (
      typeof this.client !== 'undefined' &&
      typeof this.client.isConnected !== 'undefined'
    ) {
      return this.client.isConnected;
    }
    return false;
  }

  get baseDn(): string {
    return this.serverInfo.baseDn;
  }

  // get objectClassSchemas(): ObjectClassSchema[] {
  //   return this.objectClassSchemaList;
  // }

  async search(
    searchDn = this.serverInfo.baseDn,
    searchOptions: SearchOptions = {},
  ): Promise<SearchResult | null> {
    if (Object.keys(searchOptions).length === 0) {
      searchOptions.scope = this.serverInfo.scope;
    }

    try {
      const searchResult: SearchResult = await this.client.search(
        searchDn,
        searchOptions,
      );

      return searchResult;
    } catch (ex) {
      const errMsg: string = String(ex);
      const data: ErrorData = makeErrorData('search', searchDn);

      const ldapError: LdapError = {
        msg: errMsg,
        data,
      };

      showError('LDAP Search Error', ldapError);
    }

    return null;
  }

  async add(dn: string, attrList: Attribute[]): Promise<void> {
    try {
      await this.client.add(dn, attrList);
    } catch (ex) {
      const errMsg: string = String(ex);

      const data: ErrorData = makeErrorData(
        dn,
        attrList
          .map((attr) => {
            return attr.values;
          })
          .toString(),
      );

      const ldapError: LdapError = {
        msg: errMsg,
        data,
      };

      showError('LDAP Add Error', ldapError);
    }
  }

  // async modify(ldapChange: LdapChange): Promise<void> {
  //   const changeList: Change[] = [];
  //   const { dn } = ldapChange;

  //   if (ldapChange.changeDataList.length > 0) {
  //     ldapChange.changeDataList.forEach((changeDataList: ChangeDataList) => {
  //       changeDataList.modificationList.forEach(
  //         async (modification: Attribute) => {
  //           const changeData = new Change({
  //             operation: changeDataList.operation,
  //             modification,
  //           });

  //           try {
  //             await this.client.modify(dn, [changeData]);
  //           } catch (ex) {
  //             const errMsg: string = String(ex);
  //             const data: ErrorData = makeErrorData(
  //               changeData.modification.type,
  //               changeData.modification.values,
  //             );
  //             const ldapError: LdapError = {
  //               msg: errMsg,
  //               data,
  //             };

  //             showError(`LDAP ${changeData.operation} Error`, ldapError);
  //           }
  //         },
  //       );
  //     });
  //   }
  // }

  async modifyDn(originDn: string, modifyDn: string): Promise<boolean> {
    try {
      if (originDn !== modifyDn) {
        await this.client.modifyDN(originDn, modifyDn);
      }
    } catch (ex) {
      const errMsg: string = String(ex);
      const data: ErrorData = makeErrorData('modifyDn', modifyDn);
      const ldapError: LdapError = {
        msg: errMsg,
        data,
      };

      showError('LDAP ModifyDn Error', ldapError);
      return false;
    }

    return true;
  }

  // async delete(originDn: string): Promise<void> {
  //   try {
  //     if (originDn !== '') {
  //       await this.client.del(originDn);
  //     }
  //   } catch (ex) {
  //     const errMsg: string = String(ex);
  //     const data: ErrorData = makeErrorData('delete', originDn);

  //     const ldapError: LdapError = {
  //       msg: errMsg,
  //       data,
  //     };

  //     showError('LDAP Delete Error', ldapError);
  //   }
  // }

  async searchObjectClassSchema(): Promise<SearchResult | null> {
    // subschemaSubentry 검색
    const searchDn: string = this.serverInfo.baseDn;
    let searchOptions: SearchOptions = {
      scope: 'sub',
      filter: '(objectClass=*)',
      attributes: ['subschemaSubentry'],
    };

    try {
      let searchResult: SearchResult = await this.client.search(
        searchDn,
        searchOptions,
      );

      if (
        searchResult.searchEntries.length > 0 &&
        searchResult.searchEntries[0].subschemaSubentry !== null
      ) {
        const subschemaClass = searchResult.searchEntries[0].subschemaSubentry;

        const subschemaSubentryDn = subschemaClass.toString();
        searchOptions = {
          scope: 'base',
          filter: '(objectClass=subschema)',
          attributes: ['objectClasses'],
        };

        searchResult = await this.client.search(
          subschemaSubentryDn,
          searchOptions,
        );
      }

      return searchResult;
    } catch (ex) {
      const errMsg: string = String(ex);
      const data: ErrorData = makeErrorData('search', searchDn);

      const ldapError: LdapError = {
        msg: errMsg,
        data,
      };

      showError('LDAP Search Error', ldapError);
    }

    return null;
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.unbind();
    } catch (ex) {
      const errMsg: string = String(ex);
      const data: ErrorData = makeErrorData('disconnect', 'null');

      const ldapError: LdapError = {
        msg: errMsg,
        data,
      };

      showError('LDAP Disconnect Error', ldapError);
    }
  }
}
