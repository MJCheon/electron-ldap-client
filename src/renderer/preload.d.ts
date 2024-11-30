import LdapNode from '../types/LdapNode';
import ObjectClassSchema from '../types/ObjectSchema';

declare global {
  interface Window {
    electron: {
      store: {
        getAll: (key: string) => any;
        get: (key: string, val: any) => any;
        set: (key: string, val: any) => void;
        delete: (key: string, val: any) => void;
      };
      ldap: {
        connect: (val: any) => LdapNode | undefined;
        modifyDn: (name: string, newName: string) => boolean;
        refresh: () => LdapNode | undefined;
        getSchemas: () => ObjectClassSchema[] | null;
      };
    };
  }
}

export {};
