<template>
<split-pane v-on:resize="resize" :min-percent='20' :default-percent='45' split="vertical">
  <template slot="paneL">
    <v-treeview
      v-model='tree'
      :open='initiallyOpen'
      :load-children='fetch'
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
  <template slot="paneR">
    <v-data-table
      :headers="headers"
      :items="desserts"
      :hide-default-header='hideHeaders'
      hide-default-footer
      class="elevation-1"
    ></v-data-table>
  </template>
</split-pane>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  data: () => ({
    valid: false,
    initiallyOpen: [],
    file: [],
    tree: [],
    items: [],
    search: null,
    caseSensitive: false,
    showCard: false,
    hideHeaders: true
  }),
  created () {
    ipcRenderer.on('serverBindResponse', (event, searchEntryTree) => {
      this.items = []
      this.initiallyOpen = []
      this.showCard = true
      this.items = Object.assign([], searchEntryTree)
      this.initiallyOpen = [searchEntryTree[0].name]
    })
  },
  methods: {
    resize: () => {
      console.log('resize')
    },
    fetch: (item) => {
      Object.keys(item.data).forEach((key) => {
        console.log('key : ' + key)
        console.log('value : ' + item.data[key])
      })
    }
  }
}
</script>
