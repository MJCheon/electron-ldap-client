<template>
  <v-dialog max-width='60%' v-model='showEntryDialog'>
    <v-card>
      <v-card-title>
        <span class='headline'>Edit Attribute</span>
      </v-card-title>
      <v-card-text>
        <vue-tree-list
          @click='onClick'
          @change-name='onChangeName'
          @delete-node='onDel'
          @add-node='onAddNode'
          :model='attrTree'
          :default-tree-node-name='defaultTreeNode'
          :default-leaf-node-name='defaultLeafNode'
          v-bind:default-expanded='true'
        >
          <template v-slot:leafNameDisplay='slotProps'>
            <span>
              {{ slotProps.model.name }}
              <span class='muted'>#{{ slotProps.model.id }}</span>
            </span>
          </template>
          <span class='icon' slot='addTreeNodeIcon'>
            <v-icon dense color='purple lighten-2'>mdi-folder-plus-outline</v-icon>
          </span>
          <span class='icon' slot='addLeafNodeIcon'>
            <v-icon dense color='blue lighten-2'>mdi-text-box-plus-outline</v-icon>
          </span>
          <span class='icon' slot='editNodeIcon'>
            <v-icon dense color='blue lighten-2'>mdi-file-document-edit-outline</v-icon>
          </span>
          <span class='icon' slot='delNodeIcon'>
            <v-icon dense color='red lighten-2'>mdi-trash-can-outline</v-icon>
          </span>
          <span class='icon' slot='leafNodeIcon'>
            <v-icon color='green lighten-2'>mdi-file-document</v-icon>
          </span>
          <span class='icon' slot='treeNodeIcon'>
            <v-icon color='yellow darken-2'>mdi-folder</v-icon>
          </span>
        </vue-tree-list>
        <v-spacer></v-spacer>
        <v-btn color='blue darken-1' text @click='close()'>Close</v-btn>
        <v-btn color='blue darken-1' absolute right text @click='save(attrTree)'>Save</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { VueTreeList, Tree } from '../lib/vue-tree-list'
import EventBus from '../../event-bus'
import { ipcRenderer } from 'electron'

export default {
  components: {
    VueTreeList
  },
  data: () => ({
    defaultTreeNode: 'New Tree',
    defaultLeafNode: 'New Leaf',
    deleteNodeList: [],
    attrTree: new Tree([]),
    showEntryDialog: false
  }),
  created () {
    ipcRenderer.on('attributeTreeResponse', (event, attrTree) => {
      this.attrTree = new Tree(attrTree)
      this.showEntryDialog = true
    })
    ipcRenderer.on('saveFromShortcut', event => {
      if (this.showEntryDialog) {
        this.save(this.attrTree)
      }
    })
  },
  methods: {
    onDel (node) {
      this.deleteNodeList.push(node)
      node.remove()
    },
    onChangeName (params) {
      return true
    },
    onAddNode (params) {
      return true
    },
    onClick (params) {
      return true
    },
    save (attrTree) {
      this.close()
      EventBus.$emit('saveAttribute', attrTree, this.deleteNodeList)
      this.deleteNodeList = []
    },
    close () {
      this.showEntryDialog = false
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
  font-size: 80%
}
</style>
