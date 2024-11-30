import { CSSProperties, Dispatch, SetStateAction, useState } from 'react';
import { IconContext } from '@react-icons/all-files/lib';
import { IoCloseCircleOutline } from '@react-icons/all-files/io5/IoCloseCircleOutline';
import { Box, IconButton, Tooltip } from '@mui/material';

interface DeleteIconProps {
  style: CSSProperties;
  onClick: Dispatch<SetStateAction<boolean>>;
}

export default function CloseIcon({ style, onClick }: DeleteIconProps) {
  const [hoverd, setHoverd] = useState(false);

  const handleMouseEnter = () => setHoverd(true);
  const handleMouseLeave = () => setHoverd(false);

  const onIconClick = () => {
    onClick(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Tooltip title="Close">
        <IconButton
          size="medium"
          disableRipple
          sx={{ margin: 0, padding: 0 }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <IconContext.Provider
            value={{ color: hoverd ? '#FF5722' : '#E2E2E2' }}
          >
            <IoCloseCircleOutline style={style} onClick={onIconClick} />
          </IconContext.Provider>
        </IconButton>
      </Tooltip>
    </Box>
  );
}
