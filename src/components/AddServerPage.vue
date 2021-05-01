<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-fab-transition>
          <v-btn
            v-on="on"
            v-bind="attrs"
            v-show="!hidden"
            color="pink"
            fab
            dark
            small
            bottom
            left
            fixed
            class="plus-btn"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-fab-transition>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">Server Config</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  label="Server Name"
                  id="name"
                  requried
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="6"
                md="6"
              >
                <v-text-field
                  label="Server IP, PORT*"
                  id="ipPort"
                  hint="127.0.0.1:389"
                  required
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="4"
              >
                <v-select
                  :items=sslItems
                  label="SSL/TLS*"
                  id="ssl"
                  required
                ></v-select>
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  label="Base DN*"
                  id="baseDn"
                  hint="dc=example,dc=com"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Root DN*"
                  id="rootDn"
                  hint="cn=root,dc=example,dc=com"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Password*"
                  id="password"
                  type="password"
                  required
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="5"
              >
                <v-text-field
                  label="ConnectTimeout(ms)"
                  id="connTimeout"
                  hint="5000"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveServer"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  data: () => ({
    hidden: false,
    dialog: false,
    sslItems: [
      {
        text: 'None',
        value: 'none'
      },
      {
        text: 'SSL',
        value: 'ssl'
      },
      {
        text: 'TLS',
        value: 'tls'
      }
    ]
  }),
  computed: {
    saveServer() {
      this.$store.commit('setServer')
      this.dialog = false
    }
  }
}
</script>
