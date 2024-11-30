import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Box, Grid, Paper, Stack } from '@mui/material';
import ServerInfo from '../../../types/ServerInfo';
import LdapTree from '../../components/tree-view/LdapTree';
import LdapNode from '../../../types/LdapNode';
import CloseIcon from '../../components/icons/CloseIcon';
import AttributeTable from '../../components/table/AttributeTable';

export default function Servers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');
  const server: ServerInfo = window.electron.store.get('servers', id);
  const data: LdapNode | undefined = window.electron.ldap.connect(server);

  const [isSplit, setIsSplit] = useState(false);
  const [attr, setAttr] = useState('');
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    if (data === undefined) {
      navigate('/');
    }
  });

  useEffect(() => {
    if (isSplit) {
      setWidth(window.innerWidth / 2);
    } else {
      setWidth(window.innerWidth);
    }
  }, [isSplit]);

  if (data !== undefined) {
    const onMoreInfo = () => {
      if (isSplit === false) {
        setIsSplit(!isSplit);
      }
    };

    const treeData: LdapNode[] = [data];

    return (
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={isSplit ? 6 : 12}>
            <Paper elevation={3} sx={{ height: '100%', padding: 1 }}>
              <LdapTree
                initialItems={treeData}
                setAttr={setAttr}
                onMoreInfo={onMoreInfo}
                width={width}
              />
            </Paper>
          </Grid>
          {isSplit && (
            <Grid item xs={6}>
              <Paper
                elevation={3}
                sx={{
                  height: '100%',
                  padding: 1,
                }}
              >
                <Stack spacing={2} sx={{ height: '100%' }}>
                  <CloseIcon
                    style={{ cursor: 'pointer', alignSelf: 'flex-end' }}
                    onClick={setIsSplit}
                  />
                  <AttributeTable attributeStr={attr} />
                </Stack>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }
}
