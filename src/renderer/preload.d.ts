declare global {
  interface Window {
    electron: {
      store: {
        getAll: (key: string) => any;
        get: (key: string, val: any) => any;
        set: (key: string, val: any) => void;
        delete: (key: string, val: any) => void;
      };
    };
  }
}

export {};
