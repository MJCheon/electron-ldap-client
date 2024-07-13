export default interface ServerInfo {
  id: string;
  iv: Buffer;
  name: string;
  ip: string;
  port: string;
  baseDn: string;
  rootDn: string;
  password: string;
  security: string;
  connectTimeout: string;
  scope: string;
}
