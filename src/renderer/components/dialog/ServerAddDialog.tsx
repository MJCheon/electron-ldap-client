import { useState, Dispatch, SetStateAction } from 'react';
import { BiSolidAddToQueue } from 'react-icons/bi';
import { Fab } from '@mui/material';
import ServerConfigForm from '../form/ServerConfigForm';

interface Props {
  change: boolean;
  setChange: Dispatch<SetStateAction<boolean>>;
}

export default function ServerAddDialog({ change, setChange }: Props) {
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
        change={change}
        setChange={setChange}
        type="add"
        server={undefined}
      />
    </>
  );
}
