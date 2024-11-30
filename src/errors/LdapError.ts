export type ErrorData = {
  type: string;
  values: string | string[] | Buffer[];
};

interface LdapErrorProps {
  msg: string;
  data: ErrorData;
}

export default class LdapError extends Error {
  msg: string;

  data: ErrorData;

  constructor({ msg, data }: LdapErrorProps) {
    super();
    this.msg = msg;
    this.data = data;
  }
}
