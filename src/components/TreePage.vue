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
    <v-progress-linear
      :active="loading"
      :indeterminate="loading"
      height='25'
      color='amber'
    >
      <span v-if='loading'><strong>loading...</strong></span>
    </v-progress-linear>
    <v-alert
      v-show='addDnNodeList.length + modifyDnNodeList.length + deleteDnNodeList.length + saveAttributeList.length > 0'
      @click='toggleShowChangePage()'
      class='text-sm-right'
      text
      light
      dense
      color='deep-orange'
      type='warning'
    >
    <ChangePage
      v-model='showAllChange'
    />
      <strong> {{ addDnNodeList.length + modifyDnNodeList.length + deleteDnNodeList.length + saveAttributeList.length }} </strong> unsaved changes.
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
      :multiple-keys='refreshMultipleKeys'
      @success='refreshTree()'
    />
    <Keypress
      key-event='keydown'
      :multiple-keys='saveMultipleKeys'
      @success='saveAll()'
    />
  </v-card>
</template>
<script>
import { VueTreeList, Tree } from './lib/vue-tree-list'
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
    refreshMultipleKeys: [
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
    saveMultipleKeys: [
      {
        keyCode: 83,
        modifiers: ['metaKey'],
        preventDefault: true
      },
      {
        keyCode: 83,
        modifiers: ['ctrlKey'],
        preventDefault: true
      }
    ],
    search: null,
    isBinding: false,
    newTree: {},
    defaultTreeNode: 'New Directory',
    defaultLeafNode: 'New File',
    entryTree: new Tree([]),
    addDnNodeList: [],
    modifyDnNodeList: [],
    deleteDnNodeList: [],
    saveAttributeList: [],
    isAttrSave: false,
    showAllChange: false,
    loading: false
  }),
  created () {
    ipcRenderer.on('allSearchResponse', (event, searchEntryTree) => {
      this.entryTree = null
      this.isBinding = true
      this.loading = false
      this.entryTree = new Tree(Object.assign([], searchEntryTree))
    })
    ipcRenderer.on('refreshRootTreeFromMain', () => {
      this.refreshTree()
    })
    EventBus.$on('saveAttribute', (attrTree, deleteList, isAddDn) => {
      if (!isAddDn) {
        this.saveAttributeList.push({
          tree: attrTree,
          deleteList: deleteList
        })
      } else {
        this.addDnNodeList.forEach(addDnNode => {
          if (addDnNode.nodeName === attrTree.children[0].name) {
            addDnNode.attrTree = attrTree
          }
        })
      }
      this.isAttrSave = false
    })
    EventBus.$on('saveFromChagePage', () => {
      this.saveAll()
    })
  },
  watch: {
    loading (val) {
      if (!val) return
      setTimeout(() => (this.loading = false), 1000)
    }
  },
  methods: {
    onDel (node) {
      if (!this.isNewNode(node.id)) {
        this.deleteDnNodeList.push(node)
      } else {
        this.addDnNodeList = this.addDnNodeList.filter(addDnNode => {
          if (addDnNode.nodeName !== node.name) {
            return true
          }
        })
      }
      node.remove()
    },
    onChangeName (params) {
      if (params.eventType && params.eventType === 'blur') {
        if (!this.isNewNode(params.node.id)) {
          var nodeName = params.newName
          var nodeDn = params.node.data.dn ? params.node.data.dn : params.node.name
          var parentNode = params.node.parent
          var parentNodeDn = parentNode.data.dn ? parentNode.data.dn : parentNode.node.name

          if (params.id !== params.newName) {
            if (this.alreadyInModifyDn(nodeDn)) {
              this.modifyDnNodeList.forEach((modifyDn) => {
                if (modifyDn.nodeDn === nodeDn) {
                  modifyDn.nodeName = nodeName
                }
              })
            } else {
              this.modifyDnNodeList.push({
                nodeName: nodeName,
                nodeDn: nodeDn,
                originParentNodeDn: parentNodeDn,
                modifyParentNodeDn: parentNodeDn
              })
            }
          } else if (params.id === params.newName) {
            this.deleteModifyDn(nodeName + ',' + parentNodeDn)
          }
        } else {
          this.addDnNodeList.forEach(addDnNode => {
            if (addDnNode.nodeId === params.id) {
              addDnNode.nodeName = params.newName
            }
          })
        }
      }
    },
    onAddNode (node) {
      this.addDnNodeList.push({
        nodeId: node.id,
        nodeName: node.name,
        attrTree: null
      })
    },
    onClick (params) {
      this.isAttrSave = true

      if (this.isNewNode(params.id)) {
        ipcRenderer.send('getAttributeTree', params.name, params.parent, this.isNewNode(params.id))
      } else {
        ipcRenderer.send('getAttributeTree', params.id, params.parent, this.isNewNode(params.id), params.data)
      }
      if (this.search) {
        EventBus.$emit('sendSearchWord', this.search)
      }
    },
    onDragNode (params) {
      if (!this.isNewNode(params.node.id)) {
        var dragNodeName = params.node.name
        var dragNodeDn = params.node.data.dn ? params.node.data.dn : params.node.id
        var originParentNodeDn = params.src.data.dn ? params.src.data.dn : params.src.id
        var modifyParentNodeDn = params.target.data.dn ? params.target.data.dn : params.target.id

        if (originParentNodeDn !== modifyParentNodeDn) {
          if (this.alreadyInModifyDn(dragNodeDn)) {
            if (this.checkDrag(dragNodeName, modifyParentNodeDn)) {
              this.deleteModifyDn(dragNodeDn)
            } else {
              this.modifyDnNodeList.forEach((modifyDn) => {
                if (modifyDn.nodeDn === dragNodeDn) {
                  modifyDn.nodeName = dragNodeName
                  modifyDn.originParentNodeDn = originParentNodeDn
                  modifyDn.modifyParentNodeDn = modifyParentNodeDn
                }
              })
            }
          } else {
            this.modifyDnNodeList.push({
              nodeName: dragNodeName,
              nodeDn: dragNodeDn,
              originParentNodeDn: originParentNodeDn,
              modifyParentNodeDn: modifyParentNodeDn
            })
          }
        }
      }
    },
    isNewNode (nodeId) {
      const timestampRegex = new RegExp('[0-9]{13}')

      if (timestampRegex.test(nodeId)) {
        return true
      } else {
        return false
      }
    },
    clearAll () {
      this.clearChangeList()
      this.search = null
      this.isAttrSave = false
      this.showAllChange = false
    },
    clearChangeList () {
      this.addDnNodeList = []
      this.modifyDnNodeList = []
      this.saveAttributeList = []
      this.deleteDnNodeList = []
    },
    deleteModifyDn (deleteNodeDn) {
      this.modifyDnNodeList = this.modifyDnNodeList.filter(modifyDn => {
        if (modifyDn.nodeDn !== deleteNodeDn) {
          return true
        }
      })
    },
    checkDrag (nodeName, modifyParentNodeDn) {
      if (typeof this.modifyDnNodeList.find(modifyDn => (modifyDn.nodeDn === nodeName + ',' + modifyParentNodeDn)) !== 'undefined') {
        return true
      } else {
        return false
      }
    },
    alreadyInModifyDn (nodeDn) {
      if (typeof this.modifyDnNodeList.find(modifyDn => (modifyDn.nodeDn === nodeDn)) !== 'undefined') {
        return true
      } else {
        return false
      }
    },
    saveAll () {
      if (!this.isAttrSave) {
        this.loading = true
        ipcRenderer.send('saveAllToLdap', this.addDnNodeList, this.modifyDnNodeList, this.saveAttributeList, this.deleteDnNodeList)
        this.clearChangeList()
      }
    },
    toggleShowChangePage () {
      if (!this.showAllChange) {
        ipcRenderer.send('showAllChange', this.addDnNodeList, this.modifyDnNodeList, this.saveAttributeList, this.deleteDnNodeList)
      }
      this.showAllChange = !this.showAllChange
    },
    refreshTree () {
      this.loading = true
      ipcRenderer.send('refreshRootTree')
      this.clearAll()
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
