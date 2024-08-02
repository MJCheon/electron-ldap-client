import { IconButton, useTheme } from '@mui/material';
import { MdBrightness4 } from '@react-icons/all-files/md/MdBrightness4';
import { MdBrightness7 } from '@react-icons/all-files/md/MdBrightness7';
import { Context, useContext } from 'react';

interface Props {
  colorModeContext: Context<{ toggleColorMode: () => void }>;
}

export default function ThemeToggleButton({colorModeContext}: Props) {
  const theme = useTheme();
  const colorMode = useContext(colorModeContext);
  return (
    <IconButton
      sx={{ ml: 1 }}
      onClick={colorMode.toggleColorMode}
      color="inherit"
    >
      {theme.palette.mode === 'dark' ? <MdBrightness7 /> : <MdBrightness4 />}
    </IconButton>
  );
}
