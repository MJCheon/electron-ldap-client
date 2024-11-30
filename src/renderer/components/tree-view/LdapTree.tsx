import { NodeApi, Tree, TreeApi } from 'react-arborist';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import LdapNode from '../../../types/LdapNode';
import LdapTreeNode from './LdapTreeNode';
import NodeAddDialog from '../dialog/NodeAddDialog';

interface LdapTreeProps {
  width: number;
  initialItems: LdapNode[];
  setAttr: Dispatch<SetStateAction<string>>;
  onMoreInfo: () => void;
}

interface CreateProps {
  parentId?: string | null;
  parentNode: NodeApi<LdapNode> | null;
  index: number;
  type?: 'internal' | 'leaf';
}

interface MoveProps {
  dragIds: string[];
  dragNodes?: NodeApi<LdapNode>[];
  parentId: string | null;
  parentNode?: NodeApi<LdapNode> | null;
  index: number;
}

interface DeleteProps {
  ids: string[];
  nodes: NodeApi<LdapNode>[];
}

interface RenameProps {
  id: string;
  name: string;
  node: NodeApi<LdapNode>;
}

const searchMatch = (node: NodeApi<LdapNode>, term: string) => {
  return node.data.ldapData.toLowerCase().includes(term.toLowerCase());
};

export default function LdapTree({
  initialItems,
  width,
  setAttr,
  onMoreInfo,
}: LdapTreeProps) {
  const [items, setItems] = useState(initialItems);
  const term = '';
  const treeRef = useRef<TreeApi<LdapNode>>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [objectSchemas, setObjectSchemas] = useState([]);

  useEffect(() => {
    const tree = treeRef.current;
    if (tree !== undefined) {
      tree?.firstNode.toggle();
    }
  }, []);

  const onCreate = ({ parentNode, index }: CreateProps) => {
    if (parentNode && parentNode.children) {
      // const realIndex = index === 0 ? index : index - 1;
      // const realNode = parentNode.children[realIndex];
      // alert(index);
      const schemas = window.electron.ldap.getSchemas();

      if (schemas) {
        setObjectSchemas(schemas);
        setAddOpen(true);
      }
    }

    return null;
  };

  const onMove = ({ dragIds, parentId, index }: MoveProps) => {
    alert(`Move ${dragIds}, ${parentId}, ${index}`);
  };

  const onDelete = ({ ids, nodes }: DeleteProps) => {
    alert(`Delete ${ids} and ${nodes[0].data}`);
  };

  const onRename = ({ id, node, name }: RenameProps) => {
    if (node.parent !== null) {
      const newDn: string = `${name}`;

      if (!node.parent.isRoot) {
        newDn.concat(`,${node.parent.id}`);
      }

      window.electron.ldap.modifyDn(id, newDn);
      const refreshItems = window.electron.ldap.refresh();
      if (refreshItems !== undefined) {
        setItems([refreshItems]);
      }
    }
  };

  return (
    <>
      <Tree
        data={items}
        onMove={onMove}
        onDelete={onDelete}
        onCreate={onCreate}
        onRename={onRename}
        searchTerm={term}
        searchMatch={searchMatch}
        disableMultiSelection
        width={width}
        height={window.innerHeight}
        overscanCount={1}
        rowHeight={30}
        paddingBottom={10}
        openByDefault={false}
        padding={50}
        ref={treeRef}
      >
        {(node) => (
          <LdapTreeNode
            node={node.node}
            style={node.style}
            dragHandle={node.dragHandle}
            tree={node.tree}
            setAttr={setAttr}
            onMoreInfo={onMoreInfo}
          />
        )}
      </Tree>
      <NodeAddDialog
        objectSchemas={objectSchemas}
        open={addOpen}
        setOpen={setAddOpen}
      />
    </>
  );
}
