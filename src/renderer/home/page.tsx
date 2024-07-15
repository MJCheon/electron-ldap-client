import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useReducer } from 'react';
import { Typography } from '@mui/material';
import ldapIcon from '../../../assets/512x512.png';
import ServerAddDialog from '../components/dialog/ServerAddDialog';
import ServerListCard from '../components/card/SeverListCard';
import ServerInfo from '../../types/ServerInfo';
import serverReducer from '../reducers/ServerReducer';
import '@fontsource/poetsen-one/400.css';



export default function Home() {
  const [servers, dispatch] = useReducer(serverReducer, window.electron.store.get('servers'));

  return (
    <Box my={4} p={4} sx={{ width: '100%' }}>
      <Stack justifyContent="center" alignContent="center" alignItems="center">
        <div>
          <img width="128" height="128" alt="ldap" src={ldapIcon} />
        </div>
        <Typography
          sx={{ fontFamily: "'Poetsen One', system-ui" }}
          variant="h4"
        >
          Electron LDAP Client
        </Typography>
      </Stack>
      <Stack
        my={15}
        direction="row"
        justifyContent="center"
        alignContent="center"
        alignItems="center"
        spacing={3}
      >
        {servers.map((server: ServerInfo) => {
          return (
            <ServerListCard
              key={server.id}
              server={server}
              dispatch={dispatch}
            />
          );
        })}
        <ServerAddDialog dispatch={dispatch} />
      </Stack>
    </Box>
  );
}
