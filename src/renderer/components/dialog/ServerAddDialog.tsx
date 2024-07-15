import { useState, Dispatch } from 'react';
import { BiSolidAddToQueue } from 'react-icons/bi';
import { Fab } from '@mui/material';
import ServerConfigForm from '../form/ServerConfigForm';

interface Props {
  dispatch: Dispatch<any>;
}

export default function ServerAddDialog({ dispatch }: Props) {
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
        <BiSolidAddToQueue size="24" />
      </Fab>
      <ServerConfigForm
        open={open}
        setOpen={setOpen}
        dispatch={dispatch}
        type="ADD"
        server={undefined}
      />
    </>
  );
}
