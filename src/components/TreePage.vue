<template>
  <split-pane :min-percent='20' :default-percent='40' split="vertical">
    <template slot='paneL'>
      <v-treeview
        v-model='entryTree'
        :open.sync='initiallyOpen'
        :items='entries'
        item-key='name'
        open-on-click
        activatable
      >
        <template v-slot:label='{ item, open }'>
          <div @click.stop='fetch(item)'>
          <v-icon v-if='!item.file'>
            {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
          </v-icon>
          <v-icon v-else>
            {{ 'mdi-file-document' }}
          </v-icon>
            {{ item.name }}
            <TreeEntryEditPage v-if='!item.file' :click='addEntry(item)' />
          </div>
        </template>
      </v-treeview>
    </template>
    <template slot='paneR'>
      <v-treeview
        v-model='attributeTree'
        :items='attributes'
        activatable
      >
        <template v-slot:label='{ item }' >
          <div @click.stop='modify(item)'>
            {{ item.data }}
            <v-icon v-if='!item.file' @click.stop='addAttr(item)'
              color='purple'
              fab
              dark
              small
            >mdi-plus</v-icon>
          </div>
        </template>
      </v-treeview>
    </template>
  </split-pane>
</template>

<script>
import { ipcRenderer } from 'electron'
import TreeEntryEditPage from './tree/EntryEditPage'

export default {
  components: {
    TreeEntryEditPage
  },
  data: () => ({
    valid: false,
    initiallyOpen: [],
    entryTree: [],
    attributeTree: [],
    entries: [],
    attributes: [],
    search: null,
    caseSensitive: false,
    showCard: false,
    hideHeaders: true
  }),
  created () {
    ipcRenderer.on('serverBindResponse', (event, searchEntryTree) => {
      this.entries = []
      this.initiallyOpen = []
      this.attributes = []
      this.showCard = true
      this.entries = Object.assign([], searchEntryTree)
      this.initiallyOpen = [searchEntryTree[0].name]
    })
    ipcRenderer.on('attributeTreeResponse', (event, attrTree) => {
      this.attributes = attrTree
    })
  },
  methods: {
    fetch (item) {
      ipcRenderer.send('attributeTree', item.data)
    },
    addEntry (item) {
      console.log(item)
    },
    addAttr: (item) => {
      console.log('addAttr')
    },
    modify: (item) => {
      console.log('modify')
    }
  }
}
</script>
