import { Attribute, Change, Client, SearchOptions, SearchResult } from 'ldapts'
import { LdapConfig, ChangeDataList, LdapChange } from '../Common'
import { LdapError, ErrorData, makeErrorData, showError } from '../Error'

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
    
      let errMsg: string = String(ex)
      let data: ErrorData = makeErrorData('dn', this.config.rootDn)

      let ldapError: LdapError = {
        msg: errMsg,
        data: data
      }

      showError('LDAP Connect Error', ldapError)
      await this.client.unbind()
    }

    return isAuthenticated
  }

  isConnected (): boolean {
    if (typeof this.client !== 'undefined' && typeof this.client.isConnected !== 'undefined') {
      return this.client.isConnected
    } else {
      return false
    }
  }

  get baseDn (): string {
    return this.config.baseDn
  }

  async search (searchDn = '', searchOptions: SearchOptions = {}): Promise<SearchResult | null> {
    if (searchDn === '') {
      searchDn = this.config.baseDn
    }

    if (Object.keys(searchOptions).length === 0) {
      searchOptions.scope = 'sub'
    }

    try {
      const searchResult: SearchResult = await this.client.search(
        searchDn,
        searchOptions
      )

      return searchResult
    } catch (ex) {
      let errMsg: string = String(ex)
      let data: ErrorData = makeErrorData('search', searchDn)

      let ldapError: LdapError = {
        msg: errMsg,
        data: data
      }

      showError('LDAP Search Error', ldapError)
    }

    return null
  }

  async add (dn: string, attrList: Attribute[]): Promise<void> {
    attrList.forEach(async (attr) => {
      try {
        await this.client.add(dn, [attr])
      } catch (ex) {
        let errMsg: string = String(ex)
        let data: ErrorData = makeErrorData(attr.type, attr.values)

        let ldapError: LdapError = {
          msg: errMsg,
          data: data
        }
  
        showError('LDAP Add Error', ldapError)
      }
    })
  }

  async modify (ldapChange: LdapChange): Promise<void> {

    const changeList: Change[] = []
    const dn: string = ldapChange.dn

    if (ldapChange.changeDataList.length > 0) {
      ldapChange.changeDataList.forEach((changeDataList: ChangeDataList) => {
        changeDataList.modificationList.forEach(async (modification: Attribute) => {
          let changeData = new Change({
            operation: changeDataList.operation,
            modification: modification
          })

          try {
            await this.client.modify(dn, [changeData])
          }
          catch (ex) {
            let errMsg: string = String(ex)
            let data: ErrorData = makeErrorData(changeData.modification.type, changeData.modification.values)
            let ldapError: LdapError = {
              msg: errMsg,
              data: data
            }

            showError('LDAP ' + changeData.operation +' Error', ldapError)
          }
        })
      })
    }
  }
  
  async modifyDn (originDn: string, modifyDn: string): Promise<void> {
    try {
      if (originDn !== modifyDn) {
        await this.client.modifyDN(originDn, modifyDn)
      }
    }
    catch (ex) {
      let errMsg: string = String(ex)
      let data: ErrorData = makeErrorData('modifyDn', modifyDn)
      let ldapError: LdapError = {
        msg: errMsg,
        data: data
      }

      showError('LDAP ModifyDn Error', ldapError)
    }
  }

  async delete (originDn: string): Promise<void> {
    try{
      if (originDn !== '') {
        await this.client.del(originDn)
      }
    }
    catch (ex) {
      let errMsg: string = String(ex)
      let data: ErrorData = makeErrorData('delete', originDn)

      let ldapError: LdapError = {
        msg: errMsg,
        data: data
      }

      showError('LDAP Delete Error', ldapError)
    }
  }

  async disconnect (): Promise<void> {
    try {
      await this.client.unbind()
    } catch (ex) {
      let errMsg: string = String(ex)
      let data: ErrorData = makeErrorData('disconnect', 'null')

      let ldapError: LdapError = {
        msg: errMsg,
        data: data
      }

      showError('LDAP Disconnect Error', ldapError)
    }
  }
}
