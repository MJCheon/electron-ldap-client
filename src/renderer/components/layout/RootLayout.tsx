import { ReactNode, useState, useMemo, createContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/open-sans/400.css';
import ThemeToggleButton from '../button/ThemeToggleButton';
import HomeButton from '../button/HomeButton';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export default function RootLayout({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
        typography: {
          fontFamily: "'Open Sans', system-ui",
        },
      }),
    [mode],
  );
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              alignSelf: 'flex-start',
              bgcolor: 'background.default',
              color: 'text.primary',
              borderRadius: 1,
              p: 2,
            }}
          >
            <HomeButton />
            <ThemeToggleButton colorModeContext={ColorModeContext} />
          </Box>
          <main>{children}</main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
