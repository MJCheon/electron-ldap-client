import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {
  Button,
  CardActions,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Dispatch, KeyboardEvent, MouseEvent, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEllipsisVertical } from 'react-icons/fa6';
import ServerInfo from '../../../types/ServerInfo';
import ServerEditDialog from '../dialog/ServerEditDialog';

interface Props {
  server: ServerInfo;
  change: boolean;
  setChange: Dispatch<SetStateAction<boolean>>;
}

export default function ServerListCard({ server, change, setChange }: Props) {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [editOpen, setEditOpen] = useState(false);
  const menuOpen = Boolean(anchorEl);

  const menuClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const menuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setEditOpen(true);
  }
  const handleDelete = () => {
    window.electron.store.delete('servers', server.name);
    setAnchorEl(null);
    setChange(!change);
  };

  const connectServer = () => {
    navigate(`/server?id=${server.name}`);
  };

  return (
    <Card
      sx={[
        {
          ':hover': {
            backgroundColor: 'silver',
            opacity: 0.8,
          },
          minWidth: 150,
        },
      ]}
    >
      <CardHeader
        title={server.name}
        action={
          <IconButton onClick={menuClick} aria-label="settings">
            <FaEllipsisVertical />
          </IconButton>
        }
      />
      <Menu
        id="more-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={menuClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
      <ServerEditDialog
          change={change}
          setChange={setChange}
          open={editOpen}
          setOpen={setEditOpen}
          menuClose={menuClose}
          server={server}
      />
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary">
          {server.security === 'none' ? 'ldap://' : 'ldaps://'}
          {server.ip}:{server.port}
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary">
          {server.baseDn}
        </Typography>
        <CardActions sx={{ padding:0, pt:3, pl:3 }}>
          <Button sx={{ fontWeight: 'bold' }} onClick={connectServer}>
            Connect
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
}
