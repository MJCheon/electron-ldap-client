<template>
  <v-dialog max-width='600px' class='mx-auto' v-model='showDialog'>
    <v-card>
      <v-card-title>
        <span class='headline'>Show Changes</span>
      </v-card-title>
      <v-card-text>
        <template v-if='changeAttrList.length > 0'>
          <v-card-subtitle>
            <v-icon small>mdi-circle-small</v-icon>
            Attribute Changes
          </v-card-subtitle>
        </template>
        <v-list expand>
          <v-list-group
            v-for='(item, index) in changeAttrList'
            append-icon=''
            prepend-icon=''
            no-action
            :key='index'
            value='true'
          >
            <template v-slot:activator>
              <v-list-item-icon>
                <v-icon color='yellow darken-2'>mdi-folder</v-icon>
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
                no-action
                sub-group
              >
                <template v-slot:activator>
                  <v-list-item-icon >
                    <v-icon color='green lighten-2'>mdi-file-document</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ changeData.type + ' : ' + changeData.values[0] }}
                      <span class='font-weight-bold red--text'>{{' (' + child.operation + ')'}}</span>
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-group>
            </template>
          </v-list-group>
        </v-list>
        <template v-if='modifyDnList.length > 0'>
          <v-divider v-if='changeAttrList.length > 0'></v-divider>
          <v-card-subtitle>
            <v-icon small>mdi-circle-small</v-icon>
            modifyDn Changes
          </v-card-subtitle>
        </template>
        <v-list expand>
          <v-list-group
            v-for='(item, index) in modifyDnList'
            append-icon=''
            prepend-icon=''
            :key='index'
            value='true'
          >
            <template v-slot:activator>
              <v-list-item-icon>
                <v-icon color='yellow darken-2'>mdi-folder</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ item.originDn }}</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-group
                append-icon=''
                prepend-icon=''
                no-action
                sub-group
              >
                <template v-slot:activator>
                  <v-list-item-icon >
                    <v-icon color='yellow darken-2' >mdi-folder</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ item.modifyDn }}
                      <span class='font-weight-bold red--text'>{{' (replace)'}}</span>
                    </v-list-item-title>
                  </v-list-item-content>
                </template>
              </v-list-group>
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
      console.log(modifyDnList)
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
<style>
v-application--is-ltr .v-list-item__action:first-child, .v-application--is-ltr .v-list-item__icon:first-child {
  margin-right: 16px;
}
.v-card__subtitle {
  padding: 16px;
  padding-left: 0px;
}
.change {
  font: bold;
}
</style>
