<template>
  <v-card v-if='isBinding' class='mx-auto'>
    <v-sheet class='pa-4 primary lighten-2'>
      <v-text-field
        v-model='search'
        label='Search'
        dark
        flat
        solo-inverted
        hide-details
        clearable
        clear-icon='mdi-close-circle-outline'
      ></v-text-field>
    </v-sheet>
    <v-alert
      v-show='modifyDnList.length + saveAttributeList.length > 0'
      @click='showSaveDialog()'
      class='text-sm-right'
      text
      light
      dense
      color='deep-orange'
      type='warning'
    >
      <strong> {{ modifyDnList.length + saveAttributeList.length }} </strong> unsaved changes.
    </v-alert>
    <v-card-text>
      <div class='d-flex flex-row-reverse'>
        <v-btn elevation='2' icon color='blue darken-1' @click='saveAll()'>
          <v-icon>mdi-content-save-all</v-icon>
        </v-btn>
        <v-btn elevation='2' icon color='blue darken-1' @click='refreshTree()'>
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
      <vue-tree-list
        :search='search'
        @click='onClick'
        @change-name='onChangeName'
        @delete-node='onDel'
        @add-node='onAddNode'
        @drop='onDragNode'
        :model='entryTree'
        :default-tree-node-name='defaultTreeNode'
        :default-leaf-node-name='defaultLeafNode'
        v-bind:default-expanded='false'
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
          <v-icon color='yellow darken-2' >mdi-folder</v-icon>
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
    search: null,
    isBinding: false,
    deleteEntryList: [],
    newTree: {},
    defaultTreeNode: 'New Tree',
    defaultLeafNode: 'New Leaf',
    entryTree: new Tree([]),
    modifyDnList: [],
    saveAttributeList: [],
    isAttrSave: false
  }),
  created () {
    ipcRenderer.on('allSearchResponse', (event, searchEntryTree) => {
      this.entryTree = null
      this.isBinding = true
      this.entryTree = new Tree(Object.assign([], searchEntryTree))
    })
    ipcRenderer.on('saveFromShortcut', event => {
      if (!this.isAttrSave && (this.modifyDnList.length > 0 || this.saveAttributeList.length > 0)) {
        this.saveAll()
      }
    })
    ipcRenderer.on('refreshRootTreeFromMain', event => {
      this.refreshTree()
    })
    EventBus.$on('saveAttribute', (attrTree, deleteList) => {
      this.saveAttributeList.push({
        tree: attrTree,
        deleteList: deleteList
      })
      this.isAttrSave = false
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
        var isChange = false
        var nodeName = params.newName
        var nodeDn = params.node.data.dn ? params.node.data.dn : params.node.name

        this.modifyDnList.forEach((modifyDn) => {
          if (modifyDn.nodeDn === nodeDn) {
            modifyDn.nodeName = nodeName
            isChange = true
          }
        })

        if (!isChange) {
          this.modifyDnList.push({
            nodeName: nodeName,
            nodeDn: nodeDn
          })
        }
      }
    },
    onAddNode (params) {
      return true
    },
    onClick (params) {
      this.isAttrSave = true
      ipcRenderer.send('attributeTree', params.id, params.data)
    },
    addNode () {
      var node = new TreeNode({ name: 'new node', isLeaf: false })
      if (!this.data.children) this.data.children = []
      this.data.addChildren(node)
    },
    onDragNode (params) {
      var dragNodeName = params.node.name
      var dragNodeDn = params.node.data.dn ? params.node.data.dn : params.node.id
      var originParentNodeDn = params.src.data.dn ? params.src.data.dn : params.src.id
      var modifyParentNodeDn = params.target.data.dn ? params.target.data.dn : params.target.id

      if (originParentNodeDn !== modifyParentNodeDn) {
        if (this.alreadyInModifyDn(dragNodeDn)) {
          if (this.checkModifyDn(dragNodeDn, originParentNodeDn, modifyParentNodeDn)) {
            this.deleteModifyDn(dragNodeDn)
          } else {
            this.modifyDnList.forEach((modifyDn) => {
              if (modifyDn.nodeDn !== dragNodeDn) {
                modifyDn.nodeName = dragNodeName
                modifyDn.originParentNodeDn = originParentNodeDn
                modifyDn.modifyParentNodeDn = modifyParentNodeDn
              }
            })
          }
        } else {
          this.modifyDnList.push({
            nodeName: dragNodeName,
            nodeDn: dragNodeDn,
            originParentNodeDn: originParentNodeDn,
            modifyParentNodeDn: modifyParentNodeDn
          })
        }
      }
    },
    clearChangeList () {
      this.modifyDnList = []
      this.saveAttributeList = []
    },
    deleteModifyDn (deleteNodeDn) {
      this.modifyDnList = this.modifyDnList.filter(modifyDn => {
        if (modifyDn.nodeDn !== deleteNodeDn) {
          return true
        }
      })
    },
    checkModifyDn (nodeDn, originParentNodeDn, modifyParentNodeDn) {
      return this.modifyDnList.find(modifyDn => (modifyDn.nodeDn === nodeDn && modifyDn.originParentNodeDn === modifyParentNodeDn && modifyDn.modifyParentNodeDn === originParentNodeDn))
    },
    alreadyInModifyDn (nodeDn) {
      return this.modifyDnList.find(modifyDn => (modifyDn.nodeDn === nodeDn))
    },
    saveAll () {
      console.log(this.modifyDnList)
      ipcRenderer.send('saveAllChange', this.modifyDnList, this.saveAttributeList)
      this.clearChangeList()
    },
    showSaveDialog () {
      EventBus.$emit('showSaveDialog')
    },
    refreshTree () {
      ipcRenderer.send('refreshRootTree')
      this.clearChangeList()
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
