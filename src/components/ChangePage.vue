<template>
  <v-dialog max-width='600px' class='mx-auto' v-model='showDialog'>
    <v-card>
      <v-card-title>
        <span class='headline'>Show Changes</span>
      </v-card-title>
      <v-card-text>
        <template v-if='addDnList.length > 0'>
          <v-card-subtitle>
            <v-icon small>mdi-circle-small</v-icon>
            Add Dn Changes
          </v-card-subtitle>
          <v-list expand>
            <v-list-group
              v-for='(item, index) in addDnList'
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
                  <v-list-item-title>
                    {{ item.dn }}
                    <span class='font-weight-bold red--text'>{{' (add)'}}</span>
                  </v-list-item-title>
                </v-list-item-content>
              </template>
                <v-list-group
                  v-for='(attr, index) in item.attrList'
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
                        {{ attr.type + ' : ' + attr.values}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-list-group>
            </v-list-group>
          </v-list>
        </template>
        <template v-if='changeAttrList.length > 0'>
          <v-divider v-if='addDnList.length > 0'></v-divider>
          <v-card-subtitle>
            <v-icon small>mdi-circle-small</v-icon>
            Attribute Changes
          </v-card-subtitle>
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
                  v-for='changeData in child.modificationList'
                  :key='changeData.type'
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
        </template>
        <template v-if='modifyDnList.length > 0'>
          <v-divider v-if='changeAttrList.length > 0'></v-divider>
          <v-card-subtitle>
            <v-icon small>mdi-circle-small</v-icon>
            Modify Dn Changes
          </v-card-subtitle>
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
        </template>
        <template v-if='deleteDnList.length > 0'>
          <v-divider v-if='modifyDnList.length > 0'></v-divider>
          <v-card-subtitle>
            <v-icon small>mdi-circle-small</v-icon>
            Delete Dn Changes
          </v-card-subtitle>
          <v-list expand>
            <v-list-group
              v-for='(item, index) in deleteDnList'
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
                  <v-list-item-title>{{ item.parentDn }}</v-list-item-title>
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
                      <v-icon color='green lighten-2'>mdi-file-document</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.originDn }}
                        <span class='font-weight-bold red--text'>{{' (delete)'}}</span>
                      </v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-list-group>
            </v-list-group>
          </v-list>
        </template>
        <v-spacer></v-spacer>
        <v-btn
          right
          color='blue darken-1'
          text
          @click='close()'>Close</v-btn>
        <v-btn color='blue darken-1' absolute right text @click.stop='save()'>Save</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ipcRenderer } from 'electron'
import EventBus from '../event-bus'

export default {
  props: {
    value: Boolean
  },
  data: () => ({
    activeGroup: true,
    addDnList: [],
    modifyDnList: [],
    deleteDnList: [],
    changeAttrList: []
  }),
  created () {
    ipcRenderer.on('returnShowChangePage', (event, addDnList, modifyDnList, changeAttrList, deleteDnList) => {
      console.log(addDnList)
      this.addDnList = addDnList
      this.modifyDnList = modifyDnList
      this.changeAttrList = changeAttrList
      this.deleteDnList = deleteDnList
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
      this.clearList()
      this.showDialog = false
    },
    clearList () {
      this.modifyDnList = []
      this.changeAttrList = []
      this.deleteDnList = []
    },
    save () {
      EventBus.$emit('saveFromChagePage')
      this.close()
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
