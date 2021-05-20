<template>
  <v-treeview
    v-model='tree'
    :open='initiallyOpen'
    :items='items'
    activatable
    item-key='name'
    open-on-click
  >
    <template v-slot:prepend='{ item, open }'>
      <v-icon v-if='!item.file'>
        {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
      </v-icon>
      <v-icon v-else>
        {{ 'mdi-file-document' }}
      </v-icon>
    </template>
  </v-treeview>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  data: () => ({
    initiallyOpen: [],
    file: [],
    tree: [],
    items: []
  }),
  created () {
    ipcRenderer.on('serverBindResponse', (event, searchEntryTree) => {
      this.items = []
      this.initiallyOpen = []
      this.items = Object.assign([], searchEntryTree)
      this.initiallyOpen = [searchEntryTree[0].name]
    })
  }
}
</script>
