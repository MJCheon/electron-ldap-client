import { NodeApi, NodeRendererProps } from 'react-arborist';
import { Dispatch, MouseEvent, SetStateAction, useState } from 'react';
import LdapNode from '../../../types/LdapNode';
import FileIcon from '../icons/FileIcon';
import OpenFolderIcon from '../icons/OpenFolderIcon';
import FolderIcon from '../icons/FolderIcon';
import RenameIcon from '../icons/RenameIcon';
import DeleteIcon from '../icons/DeleteIcon';
import AddIcon from '../icons/AddIcon';

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
  setAttr: Dispatch<SetStateAction<string>>;
  onMoreInfo: () => void;
}

export default function LdapTreeNode({
  node,
  style,
  tree,
  dragHandle,
  setAttr,
  onMoreInfo,
}: LdapTreeNodeProps) {
  const [clickTimeout, setClickTimeout] = useState(null);

  const onNodeClick = () => {
    setAttr(node.data.ldapData);
    onMoreInfo();
  };

  const onClick = () => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      onNodeClick();
    } else {
      setClickTimeout(
        setTimeout(() => {
          node.toggle();
          setClickTimeout(null);
        }, 200),
      );
    }
  };

  const onAddClick = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    event.stopPropagation();
    node.select();
    if (node.children == null || node.children.length === 0) {
      tree.createInternal();
    } else {
      tree.createLeaf();
    }
  };

  const onEditClick = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    event.stopPropagation();
    node.edit();
  };

  const onDeleteClick = (
    event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    event.stopPropagation();
    tree.delete(node);
  };

  return (
    <div style={style} ref={dragHandle} onClick={onClick}>
      {NodeIcon(node)}
      {node.isEditing ? <Input node={node} /> : node.data.name}

      <RenameIcon
        style={{ cursor: 'pointer', marginLeft: '12px' }}
        onClick={onEditClick}
      />
      <AddIcon
        style={{ cursor: 'pointer', marginLeft: '3px', paddingTop: '2px' }}
        onClick={onAddClick}
      />
      <DeleteIcon
        style={{ cursor: 'pointer', marginLeft: '2px' }}
        onClick={onDeleteClick}
      />
    </div>
  );
}
