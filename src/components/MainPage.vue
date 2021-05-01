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
          v-for="[icon, text] in servers"
          :key="text"
          link
          @click="bind"
        >
          <v-list-item-icon>
            <v-icon>{{ icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <AddServerPage />
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
import AddServerPage from './AddServerPage'

export default {
  components: {
    TreePage,
    AddServerPage
  },
  data: () => ({
    drawer: null,
    servers: [
      ['mdi-desktop-tower', 'Server1'],
      ['mdi-desktop-tower', 'Server2']
    ]
  }),
  methods: {
    configAdd: (event) => {
      alert('Config Add Button Click')
    },
    bind: (event) => {
      alert('Server Bind')
    }
  }
}
</script>

<style>
/* This is for documentation purposes and will not be needed in your application */
#lateral .plus-btn {
  margin: 5% 5% 10% 16px;
}
</style>
