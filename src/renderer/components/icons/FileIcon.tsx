import { IconContext } from '@react-icons/all-files/lib';
import { FaFileAlt } from '@react-icons/all-files/fa/FaFileAlt';

export default function FileIcon() {
  return (
    <IconContext.Provider value={{ color: '#FFA500' }}>
      <FaFileAlt />
    </IconContext.Provider>
  );
}
