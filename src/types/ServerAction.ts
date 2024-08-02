import ServerInfo from "./ServerInfo";

export default interface ServerAction {
  type: string;
  data?: ServerInfo;
  name?: string;
}
