import { CSSProperties, MouseEventHandler, useState } from 'react';
import { IconContext } from '@react-icons/all-files/lib';
import { MdDeleteForever } from '@react-icons/all-files/md/MdDeleteForever';
import { IconButton, Tooltip } from '@mui/material';

interface DeleteIconProps {
  style: CSSProperties;
  onClick: MouseEventHandler<SVGElement> | undefined;
}

export default function DeleteIcon({ style, onClick }: DeleteIconProps) {
  const [hoverd, setHoverd] = useState(false);

  const handleMouseEnter = () => setHoverd(true);
  const handleMouseLeave = () => setHoverd(false);

  return (
    <Tooltip title="Delete">
      <IconButton
        size="small"
        disableRipple
        sx={{ margin: 0, padding: 0 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <IconContext.Provider value={{ color: hoverd ? '#FF5722' : '#E2E2E2' }}>
          <MdDeleteForever style={style} onClick={onClick} />
        </IconContext.Provider>
      </IconButton>
    </Tooltip>
  );
}
