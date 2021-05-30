<template>
  <v-navigation-drawer
    v-model="drawer"
    permanent
    app
  >
    <v-sheet
      color="grey lighten-4"
      class="pa-4"
    >
      <div class="pa-4">
        <center>
          <img src="https://img.icons8.com/dusk/64/000000/active-directory.png" />
        </center>
      </div>
    </v-sheet>

    <v-divider></v-divider>

    <v-list>
      <v-list-item
        v-for="server in serverNameList"
        :key="server.id"
        @click="bindServer(server.id)"
        link
      >
        <v-list-item-icon>
          <v-icon color='red lighten-2'>mdi-desktop-tower</v-icon>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="server.name"></v-list-item-title>
        </v-list-item-content>

        <v-menu
          bottom
          left
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-subheader>{{ server.name }}</v-subheader>
            <v-list-item
              v-for="(menu, index) in menuList"
              :key="index"
              @click.stop="menuEvent(server.id)"
            >
              <v-list-item-title v-text="menu.title" :id="menu.title"></v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-list-item>
    </v-list>
    <ServerConfigPage />
  </v-navigation-drawer>
</template>

<script>
import ServerConfigPage from './server/ConfigPage'
import EventBus from '../event-bus'
import Store from '../store/index'
import { ipcRenderer } from 'electron'

export default {
  components: {
    ServerConfigPage
  },
  data: () => ({
    drawer: null,
    menuList: [
      { title: 'Delete' },
      { title: 'Edit' }
    ]
  }),
  computed: {
    serverNameList: () => {
      const serverNameList = Store.getters.getServerNameList
      return serverNameList
    }
  },
  methods: {
    menuEvent (serverId) {
      if (event.target.id === 'Delete') {
        this.deleteServer(serverId)
      } else if (event.target.id === 'Edit') {
        this.editServer(serverId)
      }
    },
    deleteServer: (serverId) => {
      Store.dispatch('DELETE_SERVER', serverId)
    },
    editServer: (serverId) => {
      EventBus.$emit('editServer', serverId)
    },
    bindServer: (serverId) => {
      const server = Store.getters.getServer(serverId)
      ipcRenderer.send('serverBind', server)
    }
  }
}
</script>

<style>
/* This is for documentation purposes and will not be needed in your application */
#lateral .plus-btn {
  margin: 5% 5% 10% 16px;
}
.v-subheader {
  font-size: '10px';
}
</style>
