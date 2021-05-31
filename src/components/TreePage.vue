<template>
  <div>
    <vue-tree-list
      @click="onClick"
      @change-name="onChangeName"
      @delete-node="onDel"
      @add-node="onAddNode"
      :model="entryTree"
      :default-tree-node-name="defaultTreeNode"
      :default-leaf-node-name="defaultLeafNode"
      v-bind:default-expanded="false"
    >
      <template v-slot:leafNameDisplay="slotProps">
        <span>
          {{ slotProps.model.name }} <span class="muted">#{{ slotProps.model.id }}</span>
        </span>
      </template>
      <span
        class="icon"
        slot="addTreeNodeIcon"
      ><v-icon dense color='purple lighten-2'>mdi-folder-plus-outline</v-icon></span>
      <span
        class="icon"
        slot="addLeafNodeIcon"
      ><v-icon dense color='blue lighten-2'>mdi-text-box-plus-outline</v-icon></span>
      <span
        class="icon"
        slot="editNodeIcon"
      ><v-icon dense color='blue lighten-2'>mdi-file-document-edit-outline</v-icon></span>
      <span
        class="icon"
        slot="delNodeIcon"
      ><v-icon dense color='red lighten-2'>mdi-trash-can-outline</v-icon></span>
      <span
        class="icon"
        slot="leafNodeIcon"
      ><v-icon color='green lighten-2'>mdi-file-document</v-icon></span>
      <span
        class="icon"
        slot="treeNodeIcon"
      ><v-icon color='yellow darken-2'>mdi-folder</v-icon></span>
    </vue-tree-list>
  </div>
</template>
<script>
import { VueTreeList, Tree, TreeNode } from 'vue-tree-list'
import { ipcRenderer } from 'electron'

export default {
  components: {
    VueTreeList
  },
  data: () => ({
    newTree: {},
    defaultTreeNode: 'New Tree',
    defaultLeafNode: 'New Leaf',
    entryTree: new Tree([])
  }),
  created () {
    ipcRenderer.on('serverBindResponse', (event, searchEntryTree) => {
      this.entryTree = []
      this.entryTree = new Tree(Object.assign([], searchEntryTree))
    })
  },
  methods: {
    onDel (node) {
      console.log(node)
      node.remove()
    },
    onChangeName (params) {
      console.log(params)
    },
    onAddNode (params) {
      console.log(params)
    },
    onClick (params) {
      ipcRenderer.send('attributeTree', params.id, params.data)
    },
    addNode () {
      var node = new TreeNode({ name: 'new node', isLeaf: false })
      if (!this.data.children) this.data.children = []
      this.data.addChildren(node)
    }
  }
}
</script>
<style>
.icon:hover {
  cursor: pointer;
}
.muted {
  color: gray;
  font-size: 80%;
}
</style>
