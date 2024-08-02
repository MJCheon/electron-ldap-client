import { useState, Dispatch } from 'react';
import { BiAddToQueue } from '@react-icons/all-files/bi/BiAddToQueue';
import { Fab } from '@mui/material';
import ServerConfigForm from '../form/ServerConfigForm';

interface Props {
  serverDispatch: Dispatch<any>;
}

export default function ServerAddDialog({ serverDispatch }: Props) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <Fab
        color="primary"
        size="small"
        aria-label="add"
        onClick={handleClickOpen}
      >
        <BiAddToQueue size="24" />
      </Fab>
      <ServerConfigForm
        open={open}
        setOpen={setOpen}
        serverDispatch={serverDispatch}
        type="ADD"
        server={undefined}
      />
    </>
  );
}
