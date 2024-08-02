import ServerAction from "../../types/ServerAction";

export default function ServerReducer(state: any, action: ServerAction) {
  // eslint-disable-next-line react/destructuring-assignment
  switch (action.type) {
    case 'ADD':
    case 'EDIT':
      // eslint-disable-next-line react/destructuring-assignment
      window.electron.store.set('servers', action.data);
      return window.electron.store.getAll('servers');
    case 'DELETE':
      // eslint-disable-next-line react/destructuring-assignment
      window.electron.store.delete('servers', action.name);
      return window.electron.store.getAll('servers');
    default:
      return null;
  }
}
