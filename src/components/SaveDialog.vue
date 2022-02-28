<template>
  <v-dialog max-width='600px' v-model='showDialog'>
    <v-card>
      <v-card-title>
        <span class='headline'>Show Save List</span>
      </v-card-title>
      <v-card-text>
        <v-list>
          <v-list-group
            v-for='(item, index) in changeAttrList'
            append-icon=''
            prepend-icon=''
            :key='index'
            value='true'
          >
            <template v-slot:activator>
              <v-list-item-icon>
                <v-icon color='yellow darken-2' >mdi-folder</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="item.dn"></v-list-item-title>
              </v-list-item-content>
            </template>

            <template
              v-for='child in item.changeDataList'
            >
              <v-list-group
                v-for='(changeData, index) in child.modificationList'
                :key='index'
                append-icon=''
                prepend-icon=''
                sub-group
                value='true'
              >
                <template v-slot:activator>
                  <v-list-item-icon >
                    <v-icon color='green lighten-2'>mdi-file-document</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ changeData.type + " : " + changeData.values[0] }}</v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-group>
            </template>
          </v-list-group>
        </v-list>
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
  data: () => ({
    activeGroup: true,
    modifyDnList: [],
    changeAttrList: []
  }),
  created () {
    ipcRenderer.on('returnShowSaveDialog', (event, modifyDnList, changeAttrList) => {
      this.modifyDnList = modifyDnList
      this.changeAttrList = changeAttrList
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
      this.modifyDnList = []
      this.changeAttrList = []
    }
  }
}
</script>
