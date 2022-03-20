import { Attribute, Change, Client, SearchOptions, SearchResult } from 'ldapts'
import { LdapConfig, ChangeDataList, showError, LdapChange } from './common'

export class LdapServer {
  private config!: LdapConfig;
  private client!: Client;

  constructor () {
  }

  set ldapConfig (ldapConfig : LdapConfig) {
    this.config = ldapConfig
  }

  async connect (): Promise<boolean> {
    const port = this.config.port.toString()

    let url: string

    if (this.config.ssl == 'tls') {
      url = 'ldaps://' + this.config.ip + ':' + port
    } else {
      url = 'ldap://' + this.config.ip + ':' + port
    }

    this.client = new Client({
      url: url,
      connectTimeout: this.config.connTimeout
    })

    let isAuthenticated: boolean

    try {
      await this.client.bind(this.config.rootDn, this.config.passwd)
      isAuthenticated = true
    } catch (ex) {
      isAuthenticated = false
      showError('LDAP Error', String(ex))
      await this.client.unbind()
    }

    return isAuthenticated
  }

  isConnected (): boolean {
    return this.client.isConnected
  }

  get baseDn (): string {
    return this.config.baseDn
  }

  async search (searchDn = '', searchOptions: SearchOptions = {}): Promise<SearchResult | null> {
    if (searchDn === '') {
      searchDn = this.config.baseDn
    }

    if (searchOptions === {}) {
      searchOptions = { scope: 'sub' }
    }

    try {
      const searchResult: SearchResult = await this.client.search(
        searchDn,
        searchOptions
      )

      return searchResult
    } catch (ex) {
      showError('LDAP Error', String(ex))
    }

    return null
  }

  async add (dn: string, attrList: Attribute[]): Promise<void> {
    try {
      await this.client.add(dn, attrList)
    } catch (ex) {
      showError('LDAP Error', String(ex))
    }
  }

  async modify (ldapChange: LdapChange): Promise<void> {
    try {
      const changeList: Change[] = []
      const dn: string = ldapChange.dn

      if (ldapChange.changeDataList.length > 0) {
        ldapChange.changeDataList.forEach((changeDataList: ChangeDataList) => {
          changeDataList.modificationList.forEach((modification: Attribute) => {
            changeList.push(
              new Change({
                operation: changeDataList.operation,
                modification: modification
              })
            )
          })
        })
        
        await this.client.modify(dn, changeList)
      }
    } catch (ex) {
      showError('LDAP Error', String(ex))
    }
  }
  
  async modifyDn (originDn: string, modifyDn: string): Promise<void> {
    try {
      if (originDn !== modifyDn) {
        await this.client.modifyDN(originDn, modifyDn)
      }
    }
    catch (ex) {
      showError('LDAP Error', String(ex))
    }
  }

  async delete (originDn: string): Promise<void> {
    try{
      if (originDn !== '') {
        await this.client.del(originDn)
      }
    }
    catch (ex) {
      showError('LDAP Error', String(ex))
    }
  }

  async disconnect (): Promise<void> {
    try {
      await this.client.unbind()
    } catch (ex) {
      showError('LDAP Error', String(ex))
    }
  }
}
