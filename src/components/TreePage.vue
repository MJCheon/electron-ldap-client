<template>
  <div>
    {{ getEntry }}
  </div>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  data: () => ({
    initiallyOpen: [
      'People',
      'Netgroup',
      'Host',
      'Group'
    ],
    file: [],
    tree: []
  }),
  methods: {
    getEntry: () => {
      ipcRenderer.on('serverBindResponse', (event, searchEntryList) => {
        console.log(searchEntryList)
      })
    }
  }
}
</script>
