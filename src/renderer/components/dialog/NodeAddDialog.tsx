import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@mui/material';
import { Dispatch, SetStateAction, useState } from 'react';
import ObjectClassSchema from '../../../types/ObjectSchema';

interface Props {
  objectSchemas: ObjectClassSchema[];
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function NodeAddDialog({ objectSchemas, open, setOpen }: Props) {
  const [selectedSchemas, setSelectedSchemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreate = () => {
    if (selectedSchemas.length === 0) {
      return;
    }

    handleClose();
  };

  const handleToggle = (schema: ObjectClassSchema) => {
    setSelectedSchemas((prevSelectedSchemas: ObjectClassSchema[]) => {
      if (prevSelectedSchemas.includes(schema)) {
        return prevSelectedSchemas.filter((item) => item !== schema);
      }
      return [...prevSelectedSchemas, schema];
    });
  };

  const translateSchemaName = (name: string) => {
    if (name.includes(',')) {
      return `${name.split(', ').join(' (')})`;
    }

    return name;
  };

  // 필터링된 스키마 목록 생성
  const filteredSchemas = objectSchemas.filter((schema) =>
    schema.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiDialog-paper': {
            minWidth: '400px',
            minHeight: '600px',
          },
        }}
      >
        <DialogTitle>Select LDAP Object Schema</DialogTitle>
        <DialogContent>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <List>
            {filteredSchemas.map((schema) => (
              <ListItem
                key={schema.oid}
                button
                onClick={() => handleToggle(schema)}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedSchemas.includes(schema)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={translateSchemaName(schema.name)} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
