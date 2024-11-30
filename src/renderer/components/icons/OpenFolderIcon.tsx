import { IconContext } from '@react-icons/all-files/lib';
import { FaFolderOpen } from '@react-icons/all-files/fa/FaFolderOpen';

export default function OpenFolderIcon() {
  return (
    <IconContext.Provider value={{ color: '#01C3CC' }}>
      <FaFolderOpen style={{ marginRight: '5px' }} />
    </IconContext.Provider>
  );
}
