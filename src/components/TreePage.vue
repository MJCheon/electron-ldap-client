<template>
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
          <v-btn
            @click.stop='editEntry(item)'
            icon
            fab
            x-small
          >
            <v-icon
              color='blue'
              fab
              dark
              small
            >mdi-file-document-edit-outline</v-icon>
          </v-btn>
          </div>
        </template>
      </v-treeview>

</template>

<script>
import { ipcRenderer } from 'electron'
import EventBus from '../event-bus'

export default {
  data: () => ({
    ops: {
      vuescroll: {},
      scrollPanel: {},
      rail: {},
      bar: {}
    },
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
    fetch (treeNode) {
      ipcRenderer.send('attributeTree', treeNode.data)
    },
    editEntry: (entry) => {
      EventBus.$emit('editEntry', entry)
    },
    modify: (item) => {
      console.log('modify')
    }
  }
}
</script>
