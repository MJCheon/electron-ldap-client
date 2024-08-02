import { Dispatch, SetStateAction } from 'react';
import ServerConfigForm from '../form/ServerConfigForm';
import ServerInfo from '../../../types/ServerInfo';

interface Props {
  serverDispatch: Dispatch<any>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  menuClose?: () => void;
  server: ServerInfo;
}

export default function ServerEditDialog({
  open,
  setOpen,
  menuClose,
  serverDispatch,
  server,
}: Props) {
  return (
    <ServerConfigForm
      open={open}
      setOpen={setOpen}
      menuClose={menuClose}
      type="EDIT"
      serverDispatch={serverDispatch}
      server={server}
    />
  );
}
