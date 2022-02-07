import { LdapConfig } from './common'
import { LdapServer } from './LdapServer'

export class LdapFactory {
  private static _instance: LdapServer | null = null;
  static Instance (ldapConfig: LdapConfig): LdapServer {
    if (LdapFactory._instance === null) {
      LdapFactory._instance = new LdapServer(ldapConfig)
    }

    return LdapFactory._instance
  }
}
