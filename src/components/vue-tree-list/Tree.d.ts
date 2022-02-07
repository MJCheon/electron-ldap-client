export class TreeNode {
    constructor(data: any);
    id: any;
    parent: any;
    children: any[];
    isVisible: boolean;
    isLeaf: boolean;
    changeName(name: any): void;
    name: any;
    addChildren(children: any): void;
    remove(): void;
    _removeChild(child: any): void;
    isTargetChild(target: any): boolean;
    moveInto(target: any): void;
    pid: any;
    findChildIndex(child: any): number;
    _canInsert(target: any): boolean;
    insertBefore(target: any): void;
    insertAfter(target: any): void;
    toString(): string;
}
export class Tree {
    constructor(data: any);
    root: TreeNode;
    initNode(node: any, data: any): void;
}
