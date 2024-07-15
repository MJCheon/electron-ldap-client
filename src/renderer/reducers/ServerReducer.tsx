
export default function serverReducer(state: any, action: any) {
  switch (action.type) {
    case 'ADD': case 'EDIT':
      window.electron.store.set('servers', action.data);
      return window.electron.store.get('servers');
    case 'DELETE':
      window.electron.store.delete('servers', action.name);
      return window.electron.store.get('servers');
  }
}
