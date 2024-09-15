import { CSSProperties, MouseEventHandler } from 'react';
import { IconContext } from '@react-icons/all-files/lib';
import { MdDeleteForever} from '@react-icons/all-files/md/MdDeleteForever';
import { IconButton, Tooltip } from '@mui/material';

interface DeleteIconProps {
  style: CSSProperties;
  onClick: MouseEventHandler<SVGElement> | undefined;
}

export default function DeleteIcon({ style, onClick }: DeleteIconProps) {
  return (
    <Tooltip title="Delete">
      <IconButton size="small" sx={{ margin: 0, padding: 0 }}>
        <IconContext.Provider value={{ color: '#E2E2E2' }}>
          <MdDeleteForever style={style} onClick={onClick} />
        </IconContext.Provider>
      </IconButton>
    </Tooltip>
  );
}
