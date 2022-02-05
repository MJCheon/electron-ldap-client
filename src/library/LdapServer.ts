import { Attribute, Change, Client, SearchOptions, SearchResult } from "ldapts"
import { LdapConfig, ChangeDataList, showError, LdapChange } from './common'

export class LdapServer {
    private ldapConfig : LdapConfig;
    private client! : Client;

    constructor(ldapConfig : LdapConfig) {
        this.ldapConfig = ldapConfig
        this.connect()
    }

    async connect() : Promise<boolean> {
        let port = new Number(this.ldapConfig.port).toString()
        
        let url : string;
        
        if (this.ldapConfig.isSsl) {
            url = "ldaps://" + this.ldapConfig.ip + ":" + port;
        } else {
            url = "ldap://" + this.ldapConfig.ip + ":" + port;
        }
        
        this.client = new Client({
            url: url,
            connectTimeout: this.ldapConfig.connTimeout,
        });
        
        let isAuthenticated : boolean;

        try {
            await this.client.bind(this.ldapConfig.rootDn, this.ldapConfig.passwd);
            isAuthenticated = true;
        }
        catch (ex) {
            isAuthenticated = false;
            showError("LDAP Error", String(ex))
        }
        finally {
            await this.client.unbind();
        }

        return isAuthenticated;
    }

    isConnected() : boolean {
        return this.client.isConnected;
    }

    async search(searchDn : string = "", searchOptions : SearchOptions = {}) : Promise<SearchResult | null> {
        if (searchDn === "") {
           searchDn = this.ldapConfig.baseDn;
        }

        if (searchOptions === {}) {
            searchOptions = { scope: "sub" };
        }
        
        try {
            const searchResult : SearchResult = await this.client.search(searchDn, searchOptions);
            return searchResult;
        }
        catch (ex) {
            showError("LDAP Error", String(ex));
        }
        finally {
            await this.client.unbind();
        }

        return null
    }

    async modify(ldapChange : LdapChange) : Promise<void> {
        try {
            let changeList : Change[] = [];
            let dn : string = ldapChange.dn
        
            if (ldapChange.changeDataList.length > 0) {
                ldapChange.changeDataList.forEach((changeDataList : ChangeDataList) => {
                    changeDataList.modificationList.forEach((modification : Attribute) => {
                        changeList.push(new Change({
                            operation: changeDataList.operation,
                            modification: modification
                        }));
                    });
                });

                await this.client.modify(dn, changeList);
            }
        } catch (ex) {
            showError("LDAP Error", String(ex));
        }
    }

    async disconnect() : Promise<void> {
        try{
            await this.client.unbind()
        }
        catch (ex) {
            showError('LDAP Error', String(ex));
        }
    }
}