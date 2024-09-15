import { CSSProperties, MouseEventHandler } from 'react';
import { IconContext } from '@react-icons/all-files/lib';
import { FaEdit } from '@react-icons/all-files/fa/FaEdit';
import { IconButton, Tooltip } from '@mui/material';

interface RenameIconProps {
  style: CSSProperties;
  onClick: MouseEventHandler<SVGElement> | undefined;
}

export default function RenameIcon({ style, onClick }: RenameIconProps) {
  return (
    <Tooltip title="Rename">
      <IconButton size="small" sx={{ margin: 0, padding: 0 }}>
        <IconContext.Provider value={{ color: '#E2E2E2' }}>
          <FaEdit style={style} onClick={onClick} />
        </IconContext.Provider>
      </IconButton>
    </Tooltip>
  );
}
