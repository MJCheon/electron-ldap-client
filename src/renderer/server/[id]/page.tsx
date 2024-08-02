import { useSearchParams } from 'react-router-dom';
import ServerInfo from '../../../types/ServerInfo';

export default function Servers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id');
  const server: ServerInfo = window.electron.store.get('servers', id);

  return <h1>{server.name}</h1>;
}
