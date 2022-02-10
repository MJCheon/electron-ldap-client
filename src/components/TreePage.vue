<template>
  <v-card v-if="isBinding" class="mx-auto">
    <v-sheet class="pa-4 primary lighten-2">
      <v-text-field
        v-model="search"
        label="Search"
        dark
        flat
        solo-inverted
        hide-details
        clearable
        clear-icon="mdi-close-circle-outline"
      ></v-text-field>
    </v-sheet>
    <v-card-text>
      <div class="d-flex flex-row-reverse">
        <v-btn elevation="2" icon color="blue darken-1" @click="saveAll()">
          <v-icon>mdi-content-save-all</v-icon>
        </v-btn>
        <v-btn elevation="2" icon color="blue darken-1" @click="refreshTree()">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      <vue-tree-list
        :search="search"
        @click="onClick"
        @change-name="onChangeName"
        @delete-node="onDel"
        @add-node="onAddNode"
        @drop="onDragNode"
        :model="entryTree"
        :default-tree-node-name="defaultTreeNode"
        :default-leaf-node-name="defaultLeafNode"
        v-bind:default-expanded="false"
      >
        <template v-slot:leafNameDisplay="slotProps">
          <span>
            {{ slotProps.model.name }}
            <span class="muted">#{{ slotProps.model.id }}</span>
          </span>
        </template>
        <span class="icon" slot="addTreeNodeIcon">
          <v-icon dense color="purple lighten-2">mdi-folder-plus-outline</v-icon>
        </span>
        <span class="icon" slot="addLeafNodeIcon">
          <v-icon dense color="blue lighten-2">mdi-text-box-plus-outline</v-icon>
        </span>
        <span class="icon" slot="editNodeIcon">
          <v-icon dense color="blue lighten-2">mdi-file-document-edit-outline</v-icon>
        </span>
        <span class="icon" slot="delNodeIcon">
          <v-icon dense color="red lighten-2">mdi-trash-can-outline</v-icon>
        </span>
        <span class="icon" slot="leafNodeIcon">
          <v-icon color="green lighten-2">mdi-file-document</v-icon>
        </span>
        <span class="icon" slot="treeNodeIcon">
          <v-icon color="yellow darken-2" >mdi-folder</v-icon>
        </span>
      </vue-tree-list>
    </v-card-text>
  </v-card>
</template>
<script>
import { VueTreeList, Tree, TreeNode } from './lib/vue-tree-list'
import EventBus from '../event-bus'
import { ipcRenderer } from 'electron'

export default {
  components: {
    VueTreeList
  },
  data: () => ({
    showEntryDialog: false,
    search: null,
    isBinding: false,
    deleteEntryList: [],
    newTree: {},
    defaultTreeNode: 'New Tree',
    defaultLeafNode: 'New Leaf',
    entryTree: new Tree([]),
    modifyDnList: [],
    saveAttributeList: []
  }),
  created () {
    ipcRenderer.on('allSearchResponse', (event, searchEntryTree) => {
      this.entryTree = null
      this.isBinding = true
      this.entryTree = new Tree(Object.assign([], searchEntryTree))
    })
    ipcRenderer.on('saveFromShortcut', event => {
      this.saveAll()
    })
    EventBus.$on('saveAttribute', (attrTree, deleteList, showEntryDialog) => {
      this.showEntryDialog = showEntryDialog
      this.saveAttributeList.push({
        tree: attrTree,
        deleteList: deleteList
      })
    })
  },
  methods: {
    onDel (node) {
      this.deleteEntryList.push(node)
      node.remove()
    },
    onChangeName (params) {
      if (
        params.eventType &&
        params.eventType === 'blur' &&
        params.id !== params.newName
      ) {
      }
    },
    onAddNode (params) {
      return true
    },
    onClick (params) {
      ipcRenderer.send('attributeTree', params.id, params.data)
    },
    addNode () {
      var node = new TreeNode({ name: 'new node', isLeaf: false })
      if (!this.data.children) this.data.children = []
      this.data.addChildren(node)
    },
    onDragNode (params) {
      var dragNode = params.node
      var originParent = params.src
      var currentParent = params.target

      this.modifyDnList.push({
        node: dragNode,
        orginParentNode: originParent,
        modifyParentNode: currentParent
      })
    },
    saveAll () {
      if (!this.showEntryDialog && (this.modifyDnList.length > 0 || this.saveAttributeList.length > 0)) {
        ipcRenderer.send('saveAllChange', this.modifyDnList, this.saveAttributeList)
        this.modifyDnList = []
        this.saveAttributeList = []
      }
    },
    refreshTree () {
      ipcRenderer.send('refreshRootTree')
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
