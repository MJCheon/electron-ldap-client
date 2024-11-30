import { CSSProperties, MouseEventHandler, useState } from 'react';
import { IconContext } from '@react-icons/all-files/lib';
import { IoMdAddCircle } from '@react-icons/all-files/io/IoMdAddCircle';
import { IconButton, Tooltip } from '@mui/material';

interface DeleteIconProps {
  style: CSSProperties;
  onClick: MouseEventHandler<SVGElement> | undefined;
}

export default function AddIcon({ style, onClick }: DeleteIconProps) {
  const [hoverd, setHoverd] = useState(false);

  const handleMouseEnter = () => setHoverd(true);
  const handleMouseLeave = () => setHoverd(false);

  return (
    <Tooltip title="Add">
      <IconButton
        size="small"
        disableRipple
        sx={{ margin: 0, padding: 0 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <IconContext.Provider value={{ color: hoverd ? '#FF5722' : '#E2E2E2' }}>
          <IoMdAddCircle style={style} onClick={onClick} />
        </IconContext.Provider>
      </IconButton>
    </Tooltip>
  );
}
