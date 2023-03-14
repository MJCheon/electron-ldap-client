<template>
  <v-row justify='center'>
    <v-dialog
      v-model='objectClassDialog'
      scrollable
      max-width='60%'
    >
      <v-card>
        <v-card-title>Select ObjectClass</v-card-title>
        <v-divider></v-divider>
        <v-card-text max-width='60%'>
          <v-list>
            <v-list-item
              v-for='name in objectClassNameList'
              :key='name'
            >
              <v-checkbox
                v-model='selectedObjectClassNameList'
                :label='name'
                :value='name'
              >
              </v-checkbox>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn
            color='blue darken-1'
            text
            @click='close()'
          >
            Close
          </v-btn>
          <v-btn
            color='blue darken-1'
            text
            right
            @click='getAttribute()'
          >
            Next
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>
<script>
import EventBus from '../event-bus'
import { ipcRenderer } from 'electron'

export default {
  data: () => ({
    objectClassDialog: false,
    objectClassNameList: [],
    selectedObjectClassNameList: [],
    newNodeName: '',
    newNodeParent: '',
    isNewNode: false
  }),
  created () {
    EventBus.$on('selectObjectClass', (name, parent, objectClassNameList) => {
      this.objectClassDialog = true
      this.newNodeName = name
      this.newNodeParent = parent
      this.isNewNode = true
      this.objectClassNameList = objectClassNameList.sort()
    })
  },
  methods: {
    close () {
      if (this.objectClassDialog) {
        this.objectClassDialog = false
        this.isNewNode = false
        this.selectedObjectClassNameList = []
        this.newNodeName = ''
        this.newNodeParent = ''
      }
    },
    getAttribute () {
      ipcRenderer.send('getNewAttributeTree', this.newNodeName, this.newNodeParent, this.selectedObjectClassNameList)
      this.close()
    }
  }
}
</script>
