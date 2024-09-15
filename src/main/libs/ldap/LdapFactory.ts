import ServerInfo from '../../../types/ServerInfo';
import LdapServer from './LdapServer';

export default class LdapFactory {
  private static instance: LdapServer | null = null;

  static Instance(serverInfo?: ServerInfo): LdapServer {
    if (LdapFactory.instance === null && serverInfo !== undefined) {
      LdapFactory.instance = new LdapServer(serverInfo);
    }

    return LdapFactory.instance;
  }
}
