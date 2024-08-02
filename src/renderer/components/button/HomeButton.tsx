import { IconButton, useTheme } from '@mui/material';
import { IoHomeOutline } from '@react-icons/all-files/io5/IoHomeOutline';
import { IoHomeSharp } from '@react-icons/all-files/io5/IoHomeSharp';
import { useNavigate } from 'react-router-dom';

export default function HomeButton() {
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <IconButton sx={{ ml: 1 }} onClick={() => navigate('/')} color="inherit">
      {theme.palette.mode === 'dark' ? <IoHomeOutline /> : <IoHomeSharp />}
    </IconButton>
  );
}
