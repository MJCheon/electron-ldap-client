import { LdapConfig } from './common'
import { LdapServer } from './LdapServer'

export class LdapFactory {
    private static _instance: LdapServer;
    static Instance(ldap : LdapConfig): LdapServer {
        if (LdapFactory._instance === null) {
            LdapFactory._instance = new LdapServer(ldap);
        }

        return LdapFactory._instance;
    };
}