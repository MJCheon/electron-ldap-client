import { NodeApi, NodeRendererProps } from 'react-arborist';
import { Dispatch, MouseEvent, SetStateAction } from 'react';
import LdapNode from '../../../types/LdapNode';
import FileIcon from '../icons/FileIcon';
import OpenFolderIcon from '../icons/OpenFolderIcon';
import FolderIcon from '../icons/FolderIcon';
import RenameIcon from '../icons/RenameIcon';
import DeleteIcon from '../icons/DeleteIcon';

function NodeIcon(node: NodeApi<LdapNode>) {
  if (node.children === null || node.children.length === 0) {
    return FileIcon();
  }
  if (node.isOpen) {
    return OpenFolderIcon();
  }
  return FolderIcon();
}

function Input({ node }: { node: NodeApi<LdapNode> }) {
  return (
    <input
      type="text"
      autoFocus
      defaultValue={node.data.name}
      onFocus={(e) => e.currentTarget.select()}
      onBlur={() => node.reset()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') node.reset();
        if (e.key === 'Enter') node.submit(e.currentTarget.value);
      }}
    />
  );
}

interface LdapTreeNodeProps extends NodeRendererProps<LdapNode> {
  setDn: Dispatch<SetStateAction<string>>;
  onMoreInfo: () => void;
}

export default function LdapTreeNode({
  node,
  style,
  dragHandle,
  setDn,
  onMoreInfo,
}: LdapTreeNodeProps) {
  const onClick = (event: MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    node.toggle();
  };

  const onNodeClick = (event: MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    setDn(node.data.ldapData);
    onMoreInfo();
  };

  const onEditClick = (event: MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    node.edit();
  };

  const onDeleteClick = (event: MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    alert("Delete");
  };

  return (
    <div style={style} ref={dragHandle}>
      <span onClick={onClick}> {NodeIcon(node)} </span>
      <span
        style={{ cursor: 'pointer', marginLeft: '6px' }}
        onClick={onNodeClick}
      >
        {node.isEditing ? <Input node={node} /> : node.data.name}
      </span>
      <RenameIcon
        style={{ cursor: 'pointer', marginLeft: '12px' }}
        onClick={onEditClick}
      />
      <DeleteIcon
        style={{ cursor: 'pointer', marginLeft: '2px' }}
        onClick={onDeleteClick}
      />
    </div>
  );
}
