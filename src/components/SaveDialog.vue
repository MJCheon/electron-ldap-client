<template>
  <v-dialog max-width='60%' v-model='showDialog'>
    <v-card>
      <v-card-title>
        <span class='headline'>Show Save List</span>
      </v-card-title>
      <v-card-text>
        <v-spacer></v-spacer>
        <v-btn
          right
          color='blue darken-1'
          text
          @click='close()'>Close</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ipcRenderer } from 'electron'

export default {
  props: {
    value: Boolean
  },
  created () {
    ipcRenderer.on('returnShowSaveDialog', (event, modifyDnList, changeAttrList) => {
      console.log(modifyDnList)
      console.log(changeAttrList)
    })
  },
  computed: {
    showDialog: {
      get () {
        return this.value
      },
      set (value) {
        this.$emit('input', value)
      }
    }
  },
  methods: {
    close () {
      this.showDialog = false
    }
  }
}
</script>
