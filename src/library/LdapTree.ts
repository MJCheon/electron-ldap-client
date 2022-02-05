import { Attribute } from "ldapts";
import TreeModel from "tree-model"
import { LdapChange } from "./common";
import { getEncryptPassword } from "./LdapCrypto";
import { TreeNode, ChangeDataList } from "./LdapTree"


export class LdapTree {
  private dummyRootNode : TreeNode;
  private tree : TreeModel;

  constructor() {
    this.tree = new TreeModel({
      modelComparatorFn: (left, right) => {
        return left.name > right.name;
      },
    });

    this.dummyRootNode = this.tree.parse({
      id : '0',
      children : []
    })
  }

  get rootNode() : TreeNode | boolean {
    return this.dummyRootNode.first((node : TreeNode) => {
      if (node.isRoot() && node.hasChildren()) {
        return node.children[0]
      }
    })
  }

  makeEntryTree(searchEntries : any) : void {
    let baseDnList = searchEntries.baseDn.split(",");
    let entries = searchEntries.entries;

    entries.forEach((entry : any) => {
      const realDn = entry.dn
        .split(",")
        .reverse()
        .filter((dnNode : string) => !baseDnList.includes(dnNode));

      let parentNode : TreeNode;
      
      // Create Real Root Node 
      // Or
      // Create Child Node 
      if (!this.dummyRootNode.hasChildren()) {
        const rootNode = {
          id: entry.dn, 
          name: entry.dn,
          isLeaf: true,
          isVisible: true,
          isExpanded: true,
          dragDisabled: true,
          data: entry,
          children: [],
        };

        this.dummyRootNode.addChild(rootNode);
      } else {
        realDn.forEach((nodeName : string) => {
          let tmpNode : TreeNode | boolean = this.dummyRootNode.first(
            (node : TreeNode) => node.model.name === nodeName
          );

          if (tmpNode) {
            parentNode = tmpNode;
          }
        });

        const dn = realDn.pop();
        const newNode = {
          id: dn,
          name: dn,
          isLeaf: true,
          isVisible: true,
          dragDisabled: true,
          data: entry,
          children: []
        };

        if (!parentNode) {
          this.rootNode.model.isLeaf = false;
          this.rootNode.addChild(this.tree.parse(newNode));
        } else {
          if (parentNode.model.isLeaf) {
            parentNode.model.isLeaf = false;
          }
          parentNode.addChild(this.tree.parse(newNode));
        }
      }
    });
  }

  makeAttrTree(id : string, attrData : any) : TreeNode {
    const attrRootNode : TreeNode = {
      id: "",
      name: id,
      children: [],
      isExpanded: true,
      isVisible: true,
      isLeaf: false,
      dragDisabled: true,
    };
  
    Object.keys(attrData)
      .sort()
      .forEach((key) => {
        if (Array.isArray(attrData[key])) {
          let attrChild  : TreeNode[]= [];
          attrData[key].forEach((attr : string) => {
            attrChild.push({
              id: attr,
              name: attr,
              data: attr,
              children: [],
              isExpanded: true,
              isVisible: true,
              isLeaf: true,
              dragDisabled: true,
            });
          });
          attrRootNode.children.push({
            id: key,
            name: key,
            data: key,
            children: attrChild.sort(),
            isExpanded: true,
            isVisible: true,
            isLeaf: false,
            addTreeNodeDisabled: true,
            dragDisabled: true,
          });
        } else {
          const data = key + " : " + attrData[key];
          attrRootNode.children.push({
            id: key,
            name: attrData[key],
            data: data,
            children: [],
            isExpanded: true,
            isVisible: true,
            isLeaf: true,
            dragDisabled: true,
          });
        }
      });
  
    return attrRootNode;
  }

  getChangesFromData(tree : Object, deleteNodeList : TreeNode[]) {
    const rootNode : TreeNode = new TreeModel().parse(tree);

    let allChangeDataList : ChangeDataList[] = [];

    let addChangeData : Attribute[] = [];
    let replaceChangeData : Attribute[] = [];
    let deleteChangeData : Attribute[] = [];

    let rootId : string = "";

    if (deleteNodeList.length > 0) {
      // delete
      deleteNodeList.forEach((node) => {
        let attrId : string = node.id;
        let deleteNodeName : string = node.name;
  
        if (node.id === node.name) {
          // netgroup
          let parentNode = node.parent;
          let replaceDataInDeleteList : string[] =  [];
  
          attrId = parentNode.id;
          parentNode.children.forEach((childNode : TreeNode) => {
            if (childNode.name !== deleteNodeName) {
              replaceDataInDeleteList.push(childNode.name);
            }
          });
  
          replaceChangeData.push(new Attribute({
            type: attrId,
            values: replaceDataInDeleteList
          }));
        } else {
          deleteChangeData.push(new Attribute({
            type: attrId, 
            values: [deleteNodeName]
          }));
        }
      });
    }

    rootNode.walk((node : TreeNode) => {
      let attrId : string = "";
      let data : string = "";
      let pwdAlgo : string = "";
      let pwd : string = "";
  
      if (!node.isRoot() && node.model.id !== "") {
        if (rootId === "" && node.model.data.includes("dn")) {
          let tmpData : string[] = node.model.data.split(":");
          rootId = tmpData[1];
        }
  
        const newIdPattern = /\d{13}/;
  
        if (newIdPattern.test(node.model.id)) {
          // 신규 Node
          if (node.model.name.includes("=")) {
            // key=value 형식일 때, add
            let attribute : string[] = node.model.name.split("=");
            attrId = attribute[0];
            data = attribute[1].trim();
  
            if (attrId === "userPassword") {
              // userPassword 인 경우, pwd 암호화 처리
              let tmpData : string[] = data.split(":");
              pwdAlgo = tmpData[0];
              pwd = tmpData[1];
              data = getEncryptPassword(pwd, pwdAlgo);
            }
  
            addChangeData.push(new Attribute({
              type: attrId,
              values: [data]
            }));

          } else {
            // 값만 들어간 경우, 배열로 만들어 replace
            let parentNode = node.model.parent;
            let replaceDataList : string[] = [];
  
            attrId = parentNode.id;
            parentNode.children.forEach((childNode : TreeNode) => {
              replaceDataList.push(childNode.name.trim());
            });
  
            replaceChangeData.push(new Attribute({
              type: attrId, 
              values: replaceDataList
            }));
          }
        } else {
          // 기존 ID가 있고, data가 다른 경우 replace
          let originData : string;
  
          attrId = node.model.id;
          data = node.model.name.trim();
  
          if (node.model.data.includes(":")) {
            originData = node.model.data.split(":")[1].trim();
          } else {
            originData = node.model.data;
          }
  
          if (originData !== data) {
            let parentNode = node.model.parent;
            let replaceDataList : string[] = [];
  
            if (parentNode.id === parentNode.name) {
              attrId = parentNode.id;
              parentNode.children.forEach((childNode : TreeNode) => {
                replaceDataList.push(childNode.name.trim());
              });
  
              replaceChangeData.push(new Attribute({
                type: attrId,
                values: replaceDataList
              }));

            } else {
              // userPassword 인 경우, pwd 암호화 처리
              if (attrId === "userPassword") {
                let tmpData : string[] = node.model.name.split(":");
                pwdAlgo = tmpData[0];
                pwd = tmpData[1];
  
                data = getEncryptPassword(pwd, pwdAlgo);
              }
  
              if (data && data !== "") {
                replaceChangeData.push(new Attribute({
                  type: attrId,
                  values: [data]
                }));
              }
            }
          }
        }
      }
    });

    if (deleteChangeData.length > 0) {
      allChangeDataList.push({
        operation: "delete",
        modificationList: deleteChangeData,
      });
    }
    if (replaceChangeData.length > 0) {
      allChangeDataList.push({
        operation: "replace",
        modificationList: replaceChangeData,
      });
    }
    if (addChangeData.length > 0) {
      allChangeDataList.push({ 
        operation: "add", 
        modificationList: addChangeData 
      });
    }
  
    let returnData : LdapChange = { dn: rootId, changeDataList: allChangeDataList };
    return returnData;
  }
}