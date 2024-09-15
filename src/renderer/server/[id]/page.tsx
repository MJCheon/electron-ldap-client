import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Grid, Paper } from '@mui/material';
import ServerInfo from '../../../types/ServerInfo';
import LdapTree from '../../components/tree-view/LdapTree';
import LdapNode from '../../../types/LdapNode';

export default function Servers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');
  const server: ServerInfo = window.electron.store.get('servers', id);
  const data: any | undefined = window.electron.ldap.connect(server);
  const treeData: LdapNode[] = [data];

  useEffect(() => {
    if (data === undefined) {
      navigate('/');
    }
  });

  const [isSplit, setIsSplit] = useState(false);
  const [dn, setDn] = useState('');

  if (data !== undefined) {
    const onMoreInfo = () => {
      setIsSplit(!isSplit);
    };

    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={isSplit ? 6 : 12}>
            <Paper elevation={3} sx={{ height: '100%', padding: 1 }}>
              <LdapTree
                items={treeData}
                setDn={setDn}
                onMoreInfo={onMoreInfo}
              />
            </Paper>
          </Grid>
          {isSplit && (
            <Grid item xs={6}>
              <Paper elevation={3} sx={{ height: '100%', padding: 1 }}>
                {dn}
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }
}
