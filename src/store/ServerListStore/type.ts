import { LdapConfig } from '@/library/common'

export type LdapServerList = LdapServerConfig[]

export interface LdapServerConfig extends LdapConfig {
  id: string
  name: string
  iv: Buffer
}
