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
      @click='toggleShowChangePage()'
      class='text-sm-right'
      text
      light
      dense
      color='deep-orange'
      type='warning'
    >
    <ChangePage
      v-model='showChangePage'
    />
      <strong> {{ modifyDnList.length + saveAttributeList.length }} </strong> unsaved changes.
    </v-alert>
    <v-card-text>
      <div class='d-flex flex-row-reverse'>
        <v-tooltip bottom>
          <template v-slot:activator='{ on, attrs }'>
            <v-btn elevation='2' icon color='blue darken-1' v-bind='attrs' v-on='on' @click='saveAll()'>
              <v-icon>mdi-content-save-all</v-icon>
            </v-btn>
          </template>
          <span>Save All</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator='{ on, attrs }'>
            <v-btn elevation='2' icon color='blue darken-1' v-bind='attrs' v-on='on' @click='refreshTree()'>
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </template>
          <span>Refresh</span>
        </v-tooltip>
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
    <Keypress
      key-event='keydown'
      :multiple-keys='multipleKeys'
      @success='refreshTree()'
    />
  </v-card>
</template>
<script>
import { VueTreeList, Tree, TreeNode } from './lib/vue-tree-list'
import ChangePage from './ChangePage'
import EventBus from '../event-bus'
import { ipcRenderer } from 'electron'

export default {
  components: {
    VueTreeList,
    ChangePage,
    Keypress: () => import('vue-keypress')
  },
  data: () => ({
    multipleKeys: [
      {
        keyCode: 82,
        modifiers: ['metaKey'],
        preventDefault: true
      },
      {
        keyCode: 116,
        modifiers: [],
        preventDefault: true
      }
    ],
    search: null,
    isBinding: false,
    newTree: {},
    defaultTreeNode: 'New Directory',
    defaultLeafNode: 'New File',
    entryTree: new Tree([]),
    modifyDnList: [],
    saveAttributeList: [],
    isAttrSave: false,
    showChangePage: false
  }),
  created () {
    ipcRenderer.on('allSearchResponse', (event, searchEntryTree) => {
      this.entryTree = null
      this.isBinding = true
      this.entryTree = new Tree(Object.assign([], searchEntryTree))
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
      node.remove()
    },
    onChangeName (params) {
      if (params.eventType && params.eventType === 'blur') {
        var nodeName = params.newName
        var nodeDn = params.node.data.dn ? params.node.data.dn : params.node.name
        var parentNode = params.node.parent
        var parentNodeDn = parentNode.data.dn ? parentNode.data.dn : parentNode.node.name

        if (params.id !== params.newName) {
          if (this.alreadyInModifyDn(nodeDn)) {
            this.modifyDnList.forEach((modifyDn) => {
              if (modifyDn.nodeDn === nodeDn) {
                modifyDn.nodeName = nodeName
              }
            })
          } else {
            this.modifyDnList.push({
              nodeName: nodeName,
              nodeDn: nodeDn,
              originParentNodeDn: parentNodeDn,
              modifyParentNodeDn: parentNodeDn
            })
          }
        } else if (params.id === params.newName) {
          this.deleteModifyDn(nodeName + ',' + parentNodeDn)
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
          if (this.checkDrag(dragNodeName, modifyParentNodeDn)) {
            this.deleteModifyDn(dragNodeDn)
          } else {
            this.modifyDnList.forEach((modifyDn) => {
              if (modifyDn.nodeDn === dragNodeDn) {
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
    clearSearch () {
      this.search = null
    },
    deleteModifyDn (deleteNodeDn) {
      this.modifyDnList = this.modifyDnList.filter(modifyDn => {
        if (modifyDn.nodeDn !== deleteNodeDn) {
          return true
        }
      })
    },
    checkDrag (nodeName, modifyParentNodeDn) {
      if (typeof this.modifyDnList.find(modifyDn => (modifyDn.nodeDn === nodeName + ',' + modifyParentNodeDn)) !== 'undefined') {
        return true
      } else {
        return false
      }
    },
    alreadyInModifyDn (nodeDn) {
      if (typeof this.modifyDnList.find(modifyDn => (modifyDn.nodeDn === nodeDn)) !== 'undefined') {
        return true
      } else {
        return false
      }
    },
    saveAll () {
      ipcRenderer.send('saveAllChange', this.modifyDnList, this.saveAttributeList)
      this.clearChangeList()
    },
    toggleShowChangePage () {
      if (!this.showChangePage) {
        ipcRenderer.send('showChangePage', this.modifyDnList, this.saveAttributeList)
      }
      this.showChangePage = !this.showChangePage
    },
    refreshTree () {
      ipcRenderer.send('refreshRootTree')
      this.clearChangeList()
      this.search = null
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
