<template>
  <Split>
    <SplitArea :size='35'>
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
          <v-icon v-if='!item.file' @click.stop='addChild(item)'
            color='blue'
            fab
            dark
            small
          >mdi-plus</v-icon>
          </div>
        </template>
      </v-treeview>
    </SplitArea>
    <SplitArea :size='65'>
      <v-treeview
        v-model='attributeTree'
        :items='attributes'
        activatable
      >
        <template v-slot:label='{ item }' >
          <div>
            {{ item.data }}
            <v-icon v-if='!item.file' @click.stop='addChild(item)'
              color='blue'
              fab
              dark
              small
            >mdi-plus</v-icon>
          </div>
        </template>
      </v-treeview>
    </SplitArea>
  </Split>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
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
      this.showCard = true
      this.entries = Object.assign([], searchEntryTree)
      this.initiallyOpen = [searchEntryTree[0].name]
    })
  },
  methods: {
    fetch (item) {
      this.attributes = []
      Object.keys(item.data).sort().forEach((key) => {
        var data = ''
        if (Array.isArray(item.data[key])) {
          var attrChild = []
          item.data[key].forEach((attr) => {
            attrChild.push({ id: attr, file: true, data: attr })
          })
          this.attributes.push({ id: key, file: false, data: key, children: attrChild })
        } else {
          data = key + ' : ' + item.data[key]
          this.attributes.push({ id: key, file: true, data: data })
        }
      })
    },
    addChild (item) {
      console.log(item)
    },
    modify (item) {
      alert(item)
    }
  }
}
</script>
