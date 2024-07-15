import {
  useState,
  FormEvent,
  SyntheticEvent,
  MouseEvent,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { IoMdAdd, IoMdSave } from 'react-icons/io';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import { InputAdornment } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import ServerInfo from '../../../types/ServerInfo';

interface Props {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  menuClose?: () => void;
  server: ServerInfo | undefined;
  dispatch: Dispatch<any>;
  type: string;
}

export default function ServerConfigForm({
  open,
  setOpen,
  server,
  type,
  dispatch,
  menuClose,
}: Props) {
  const connSecurities = [
    {
      value: 'none',
      label: 'None',
    },
    {
      value: 'ssl',
      label: 'SSL',
    },
  ];

  const scopeList = [
    {
      value: 'base',
      label: 'base',
    },
    {
      value: 'sub',
      label: 'sub',
    },
    {
      value: 'one',
      label: 'one',
    },
    {
      value: 'children',
      label: 'children',
    },
  ];

  const handleClose = (event: SyntheticEvent, reason: string) => {
    if (reason === 'backdropClick') {
      return;
    }
    if ( menuClose !== undefined) {
      menuClose();
    }
    setOpen(false);
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [security, setSecurity] = useState('none');
  const [baseDn, setBaseDn] = useState('');
  const [rootDn, setRootDn] = useState('');
  const [password, setPassword] = useState('');
  const [scope, setScope] = useState('sub');
  const [connTimeout, setConnTimeout] = useState('5000');

  useEffect(() => {
    if (server !== undefined) {
      setName(server.name);
      setIp(server.ip);
      setPort(server.port);
      setSecurity(server.security);
      setBaseDn(server.baseDn);
      setRootDn(server.rootDn);
      setPassword(server.password);
      setScope(server.scope);
      setConnTimeout(server.connectTimeout);
    }
  }, [server]);

  return (
    <Dialog
      tabIndex={0}
      open={open}
      onClose={handleClose}
      maxWidth="md"
      PaperProps={{
        component: 'form',
        onSubmit: (event: FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          if (server !== undefined) {
            formJson.id = server.id;
            formJson.iv = server.iv;
          }
          dispatch({ type: type, data: formJson});
          server = undefined
          setOpen(false);
        },
      }}
    >
      <DialogTitle>{type === 'ADD' ? 'Add' : 'Edit'} Ldap Server</DialogTitle>
      <DialogContent>
        <Grid container spacing={4}>
          <Grid container item xs={6}>
            {/* Name */}
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Server Name"
              type="string"
              fullWidth
              variant="standard"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
          </Grid>
        </Grid>
        <Grid
          container
          alignItems="flex-end"
          direction="row"
          justifyContent="center"
          spacing={4}
        >
          <Grid container item xs={4}>
            {/* Server Ip */}
            <TextField
              required
              margin="dense"
              id="ip"
              name="ip"
              label="Server IP address"
              type="string"
              fullWidth
              variant="standard"
              value={ip}
              onChange={(event) => setIp(event.target.value)}
            />
          </Grid>
          <Grid container item xs={4}>
            <TextField
              required
              margin="dense"
              id="port"
              name="port"
              label="Server Port"
              type="string"
              fullWidth
              variant="standard"
              value={port}
              onChange={(event) => setPort(event.target.value)}
            />
          </Grid>
          <Grid container item xs={4}>
            <TextField
              required
              fullWidth
              size="small"
              id="security"
              name="security"
              select
              label="Connection Security"
              value={security}
              onChange={(event) => setSecurity(event.target.value)}
            >
              {connSecurities.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid container item xs={5} md={6}>
            {/* BaseDn */}
            <TextField
              required
              margin="dense"
              id="baseDn"
              name="baseDn"
              label="Base DN"
              type="string"
              fullWidth
              variant="standard"
              value={baseDn}
              onChange={(event) => setBaseDn(event.target.value)}
            />
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          <Grid container item xs={5} md={6}>
            {/* RootDn */}
            <TextField
              required
              margin="dense"
              id="rootDn"
              name="rootDn"
              label="Root DN"
              type="string"
              fullWidth
              variant="standard"
              value={rootDn}
              onChange={(event) => setRootDn(event.target.value)}
            />
          </Grid>
          <Grid container item xs={5}>
            {/* Password */}
            <TextField
              required
              id="password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              variant="standard"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                  >
                    {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                  </IconButton>
                ),
              }}
            />
          </Grid>
        </Grid>
        <Grid my={-1.5} container spacing={4}>
          <Grid container item xs={4}>
            {/* scope */}
            <TextField
              required
              fullWidth
              size="small"
              id="scope"
              name="scope"
              select
              label="scope"
              value={scope}
              onChange={(event) => setScope(event.target.value)}
            >
              {scopeList.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <Grid my={-2} container spacing={4}>
          <Grid container item xs={5}>
            {/* ConnectTimeout */}
            <TextField
              margin="dense"
              id="ConnectTimeout"
              name="ConnectTimeout"
              label="Connection Timeout"
              type="string"
              fullWidth
              variant="standard"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">ms</InputAdornment>
                ),
              }}
              value={connTimeout}
              onChange={(event) => setConnTimeout(event.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} >Cancel</Button>
        {type === 'ADD' ? (
          <Button variant="contained" endIcon={<IoMdAdd />} type="submit">
            Add
          </Button>
        ) : (
          <Button onClick={handleClose} variant="contained" endIcon={<IoMdSave />} type="submit">
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
