import { useState, Dispatch, SetStateAction, MouseEventHandler } from 'react';
import { MenuItem } from '@mui/material';
import ServerConfigForm from '../form/ServerConfigForm';
import ServerInfo from '../../../types/ServerInfo';

interface Props {
  change: boolean;
  setChange: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  menuClose?: () => void
  server: ServerInfo;
}

export default function ServerEditDialog({ change, setChange, open, setOpen, menuClose, server}: Props) {
  return (
    <>
      <ServerConfigForm
        open={open}
        setOpen={setOpen}
        change={change}
        setChange={setChange}
        menuClose={menuClose}
        type="Edit"
        server={server}
      />
    </>
  );
}
