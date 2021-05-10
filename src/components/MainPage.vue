<template>
  <v-app id="inspire">
    <v-system-bar app>
      <v-spacer></v-spacer>

      <v-icon>mdi-square</v-icon>

      <v-icon>mdi-circle</v-icon>

      <v-icon>mdi-triangle</v-icon>
    </v-system-bar>

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
          v-for="server in getAllServerNameList"
          :key="server.id"
          @click="bindServer"
          link
        >
          <v-list-item-icon>
            <v-icon>mdi-desktop-tower</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title v-text="server.name">
            </v-list-item-title>
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
                <v-list-item-title v-text="menu.title" :id="menu.title">
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
      </v-list>

      <ServerConfigPage />
    </v-navigation-drawer>

    <v-main>
      <v-container
        class="py-8 px-6"
        fluid
      >
        <TreePage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import TreePage from './TreePage'
import ServerConfigPage from './server/ConfigPage'
import EventBus from '../event-bus'
import Store from '../store/index'
import Uuid from '../utils/uuid'
import Password from '../utils/password'

export default {
  components: {
    TreePage,
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
    getAllServerNameList: () => {
      return Store.getters.getAllServerNameList
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
    bindServer: () => {
      const testUuid = Uuid.uuidParse(Uuid.getServerUuid())
      const password = 'test1234'
      const iv = Password.getIv()
      const enPassword = Password.encrypt(password, testUuid, iv)
      console.log(enPassword)
      console.log(Password.decrypt(enPassword, testUuid, iv))
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
