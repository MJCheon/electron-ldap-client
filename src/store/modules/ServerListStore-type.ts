import { LdapConfig } from '../../library/common'

export interface LdapServerConfig extends LdapConfig {
    id : string,
    name : string,
    iv : Buffer
}
