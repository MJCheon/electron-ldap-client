import { IconContext } from '@react-icons/all-files/lib';
import { FaFolder } from '@react-icons/all-files/fa/FaFolder';

export default function FolderIcon() {
  return (
    <IconContext.Provider value={{ color: '#01C3CC' }}>
      <FaFolder />
    </IconContext.Provider>
  );
}
