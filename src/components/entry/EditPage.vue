<template>
  <v-dialog max-width='60%' v-model='showEntryDialog'>
    <v-card v-if='this.attrTree !== null'>
      <v-card-title>
        <span class='headline'>Edit Attribute</span>
      </v-card-title>
      <v-card-text>
        <vue-tree-list
          @change-name='onChangeName'
          @delete-node='onDel'
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
        <v-btn color='blue darken-1' text @click.stop='close()'>Close</v-btn>
        <v-btn color='blue darken-1' absolute right text @click.stop='save(attrTree)'>Save</v-btn>
        <Keypress
          key-event='keydown'
          :multiple-keys='multipleKeys'
          @success='save(attrTree)'
        />
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
    VueTreeList,
    Keypress: () => import('vue-keypress')
  },
  data: () => ({
    multipleKeys: [
      {
        keyCode: 83,
        modifiers: ['ctrlKey'],
        preventDefault: true
      },
      {
        keyCode: 83,
        modifiers: ['metaKey'],
        preventDefault: true
      }
    ],
    defaultTreeNode: 'New Directory',
    defaultLeafNode: 'New File',
    deleteNodeList: [],
    isChanged: false,
    attrTree: null,
    showEntryDialog: false,
    isAddDn: false
  }),
  created () {
    ipcRenderer.on('attributeTreeResponse', (event, attrTree, isAddDn) => {
      this.attrTree = new Tree(attrTree)
      this.isAddDn = isAddDn
      this.showEntryDialog = true
    })
  },
  methods: {
    onDel (node) {
      this.deleteNodeList.push(node)
      node.remove()
      this.isChanged = true
    },
    onChangeName (params) {
      if (params.eventType && params.eventType === 'blur') {
        if (params.node.isLeaf) {
          if (!this.isAddDn) {
            var originData = params.node.data.split(':')[1].trim()
            if (params.newName !== originData) {
              this.isChanged = true
            }
          } else {
            this.isChanged = true
          }
        } else {
          if (params.id !== params.newName) {
            this.isChanged = true
          }
        }
      }
    },
    save (attrTree) {
      if (this.isChanged) {
        EventBus.$emit('saveAttribute', attrTree, this.deleteNodeList, this.isAddDn)
        this.attrTree = null
        this.deleteNodeList = []
        this.close()
      }
    },
    close () {
      this.isAddDn = false
      this.isChanged = false
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
