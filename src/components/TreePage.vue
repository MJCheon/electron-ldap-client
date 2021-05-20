<template>
  <v-card
    class="mx-auto"
    v-model='showCard'
  >
    <v-sheet class="pa-4 primary lighten-2">
      <v-text-field
        v-model="search"
        label="Search"
        dark
        flat
        solo-inverted
        hide-details
        clearable
        clear-icon="mdi-close-circle-outline"
      ></v-text-field>
      <v-checkbox
        v-model="caseSensitive"
        dark
        hide-details
        label="Case sensitive search"
      ></v-checkbox>
    </v-sheet>
    <v-card-text>
      <v-treeview
        v-model='tree'
        :open='initiallyOpen'
        :load-children='fetch'
        :items='items'
        :search='search'
        :filter='filter'
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
    </v-card-text>
  </v-card>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  data: () => ({
    initiallyOpen: [],
    file: [],
    tree: [],
    items: [],
    search: null,
    caseSensitive: false,
    showCard: false
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
  computed: {
    filter () {
      return this.caseSensitive
        ? (item, search, textKey) => {
          return item[textKey].indexOf(search) > -1
        }
        : undefined
    }
  },
  methods: {
    fetch: (item) => {
      console.log(item.data)
    }
  }
}
</script>
