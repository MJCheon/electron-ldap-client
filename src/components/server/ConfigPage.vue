<template>
  <v-row justify='center'>
    <v-dialog
      v-model='showServerDialog'
      max-width='600px'
    >
      <template v-slot:activator='{ on, attrs }'>
        <v-fab-transition>
          <v-btn
            v-on='on'
            v-bind='attrs'
            v-show='!hidden'
            color='pink'
            fab
            dark
            small
            bottom
            left
            fixed
            class='plus-btn'
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-fab-transition>
      </template>
      <v-card>
        <v-card-title>
          <span class='headline'>Server Config</span>
        </v-card-title>
        <v-card-text>
          <v-form
            v-model="valid"
          >
            <v-row>
              <v-col cols='12'>
                <v-text-field
                  label='Name'
                  ref="name"
                  v-model='server.name'
                  :rules='[rules.required]'
                  requried
                ></v-text-field>
              </v-col>
              <v-col
                cols='auto'
                sm='4'
                md='6'
              >
                <v-text-field
                  label='Server IP*'
                  ref="ip"
                  v-model='server.ip'
                  hint='127.0.0.1 or example.com or host1'
                  :rules='[rules.required, rules.isIpDomain]'
                  required
                ></v-text-field>
              </v-col>
              <v-col
                cols='auto'
                sm='4'
                md='3'
              >
                <v-text-field
                  label='Server Port*'
                  ref="port"
                  v-model='server.port'
                  :rules='[rules.required, rules.isNumber, rules.isPort]'
                  required
                ></v-text-field>
              </v-col>
              <v-col
                cols='auto'
                sm='4'
                md='3'
              >
                <v-select
                  :items=sslItems
                  ref="ssl"
                  label='SSL/TLS*'
                  v-model='server.ssl'
                  :rules='[rules.required]'
                  required
                ></v-select>
              </v-col>
              <v-col
                cols='auto'
                sm='6'
              >
                <v-text-field
                  label='Base DN*'
                  ref="baseDn"
                  v-model='server.baseDn'
                  hint='dc=example,dc=com'
                  :rules='[rules.required]'
                  required
                ></v-text-field>
              </v-col>
              <v-col cols='8'>
                <v-text-field
                  label='Root DN*'
                  v-model='server.rootDn'
                  ref="rootDn"
                  hint='cn=root,dc=example,dc=com'
                  :rules='[rules.required]'
                  required
                ></v-text-field>
              </v-col>
              <v-col cols='8'>
                <v-text-field
                  label='Password*'
                  ref="password"
                  v-model='server.password'
                  :rules='[rules.required]'
                  type='password'
                  required
                ></v-text-field>
              </v-col>
              <v-col
                cols='auto'
                sm='5'
              >
                <v-text-field
                  label='ConnectTimeout(ms)'
                  ref="connTimeout"
                  v-model='server.connTimeout'
                  :rules='[rules.isNumber]'
                  hint='5000'
                ></v-text-field>
              </v-col>
            </v-row>
            <small>*indicates required field</small>
            <v-spacer></v-spacer>
            <v-btn
              color='blue darken-1'
              text
              @click='close()'
            >
              Close
            </v-btn>
            <v-btn
              :disabled="!valid"
              color='blue darken-1'
              absolute
              right
              text
              @click='saveServer(server); close()'
            >
              Save
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>

import Store from '../../store/index'
import EventBus from '../../event-bus'

export default {
  data: () => ({
    hidden: false,
    edit: false,
    showServerDialog: false,
    valid: false,
    rules: {
      required: value => !!value || 'This Field is required',
      isIpDomain: value => {
        const ptn = /(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}|^[a-zA-Z]+$|^([0-9a-zA-Z\\-]+\.)+[a-zA-Z]{2,6}(\\:[0-9]+)?(\/\S*)?$/

        if (!ptn.test(value)) {
          return 'Invalid IPv4 Format or Domain'
        }

        return true
      },
      isNumber: value => {
        const pattern = /\d/
        return pattern.test(value) || 'Only Number'
      },
      isPort: value => value < 65535 || 'Only Port Range (1~65535)'
    },
    server: {
      name: '',
      ip: '',
      port: '',
      ssl: '',
      baseDn: '',
      rootDn: '',
      password: '',
      connTimeout: ''
    },
    sslItems: [
      {
        text: 'None',
        value: 'none'
      },
      {
        text: 'SSL',
        value: 'ssl'
      }
    ]
  }),
  created () {
    EventBus.$on('editServer', serverId => {
      const editServer = Store.getters.getServer(serverId)

      if (editServer) {
        this.server = editServer
        this.edit = true
        this.showServerDialog = true
      }
    })
  },
  watch: {
    showServerDialog (value) {
      if (value && !this.edit) {
        this.server = {
          name: '',
          ip: '',
          port: '',
          ssl: '',
          baseDn: '',
          rootDn: '',
          password: '',
          connTimeout: ''
        }
      }
    }
  },
  methods: {
    saveServer: (server) => {
      Store.dispatch('SET_SERVER', server)
    },
    close () {
      this.showServerDialog = false
      this.edit = false
    }
  }
}
</script>
