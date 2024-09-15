import { NodeApi, Tree, TreeApi } from 'react-arborist';
import { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import LdapNode from '../../../types/LdapNode';
import LdapTreeNode from './LdapTreeNode';

interface LdapTreeProps {
  items: LdapNode[];
  setDn: Dispatch<SetStateAction<string>>;
  onMoreInfo: () => void;
}

const searchMatch = (node: NodeApi<LdapNode>, term: string) => {
  return node.data.ldapData.toLowerCase().includes(term.toLowerCase());
};

export default function LdapTree({ items, setDn, onMoreInfo }: LdapTreeProps) {
  const term = '';
  const treeRef = useRef<TreeApi<LdapNode>>(null);

  useEffect(() => {
    const tree = treeRef.current;
    if (tree !== undefined) {
      tree?.firstNode.toggle();
    }
  }, []);

  return (
    <Tree
      data={items}
      searchTerm={term}
      searchMatch={searchMatch}
      disableMultiSelection
      width={860}
      height={1080}
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
          setDn={setDn}
          onMoreInfo={onMoreInfo}
        />
      )}
    </Tree>
  );
}
