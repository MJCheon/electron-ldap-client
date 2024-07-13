import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import ldapIcon from '../../../assets/512x512.png';
import ServerAddDialog from '../components/dialog/ServerAddDialog';
import ServerListCard from '../components/card/SeverListCard';
import ServerInfo from '../../types/ServerInfo';
import '@fontsource/poetsen-one/400.css';

export default function Home() {
  const [servers, setServers] = useState([]);
  const [change, setChange] = useState(false);

  useEffect(() => {
    setServers(window.electron.store.get('servers'));
  }, [change]);

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
              change={change}
              setChange={setChange}
            />
          );
        })}
        <ServerAddDialog change={change} setChange={setChange} />
      </Stack>
    </Box>
  );
}
