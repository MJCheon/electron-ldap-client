import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  ListItem,
  List,
  Button,
  TextField,
} from '@mui/material';
import { useState } from 'react';

interface AttributeTableProps {
  attributeStr: string;
}

export default function AttributeTable({ attributeStr }: AttributeTableProps) {
  const initialAttributes = [JSON.parse(attributeStr)];
  const [attributes, setAttributes] = useState(initialAttributes);

  const handleValueChange = (
    rowIndex: number,
    key: string,
    newValue: string,
  ) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[rowIndex] = {
      ...updatedAttributes[rowIndex],
      [key]: newValue,
    };
    setAttributes(updatedAttributes);
  };

  const addRow = () => {
    const newRow = allKeys.reduce((acc, key) => ({ ...acc, [key]: '' }), {});
    setAttributes([...attributes, newRow]);
  };

  if (attributes.length === 0) {
    return <div>No data available</div>;
  }

  // 모든 키 수집
  const allKeys = Array.from(
    attributes.reduce((keys, entry) => {
      Object.keys(entry).forEach((key) => keys.add(key));
      return keys;
    }, new Set()),
  );

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>
              Attribute
            </TableCell>
            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f0f0f0' }}>
              Value
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allKeys.map((key) => (
            <TableRow key={key}>
              <TableCell component="th" scope="row">
                {key}
              </TableCell>
              {attributes.map((entry, index) => (
                <TableCell key={index}>
                  {/* {Array.isArray(entry[key]) ? (
                    <List dense>
                      {entry[key].map((item, idx) => (
                        <ListItem key={idx} disableGutters>
                          {item}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    entry[key]
                  )} */}
                  <TextField
                    value={Array.isArray(entry[key]) ? entry[key].join(', ') : entry[key]}
                    onChange={(e) => handleValueChange(rowIndex, key, e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={addRow} variant="contained" style={{ margin: '10px' }}>
        Add Row
      </Button>
    </TableContainer>
  );
}
