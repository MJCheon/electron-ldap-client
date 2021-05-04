<template>
  <v-row justify='center'>
    <v-dialog
      v-model='dialog'
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
          <span class='headline'>Add Server Config</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
          >
            <v-row>
              <v-col
                cols='12'
              >
                <v-text-field
                  label='Name'
                  v-model='server.name'
                  :rules='[rules.required]'
                  requried
                ></v-text-field>
              </v-col>
              <v-col
                cols='auto'
                sm='4'
                md='4'
              >
                <v-text-field
                  label='Server IP*'
                  v-model='server.ip'
                  hint='127.0.0.1'
                  :rules='[rules.required,rules.isIp]'
                  required
                ></v-text-field>
              </v-col>
              <v-col
                cols='auto'
                sm='4'
                md='4'
              >
                <v-text-field
                  label='Server Port*'
                  v-model='server.port'
                  :rules='[rules.required, rules.isNumber, rules.isPort]'
                  required
                ></v-text-field>
              </v-col>
              <v-col
                cols='auto'
                sm='4'
                md='4'
              >
                <v-select
                  :items=sslItems
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
                  hint='cn=root,dc=example,dc=com'
                  :rules='[rules.required]'
                  required
                ></v-text-field>
              </v-col>
              <v-col cols='8'>
                <v-text-field
                  label='Password*'
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
                  v-model='server.connTimeout'
                  :rules='[rules.required]'
                  hint='5000'
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color='blue darken-1'
            text
            @click='dialog = false'
          >
            Close
          </v-btn>
          <v-btn
            :disabled="!valid"
            color='blue darken-1'
            text
            @click='saveServer(server); dialog = false'
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
    valid: false,
    rules: {
      required: value => !!value || 'This Field is required',
      isIp: value => {
        const pattern = /(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}/
        return pattern.test(value) || 'Invalid IPv4 Format'
      },
      isNumber: value => {
        const pattern = /\d{1,5}/
        return pattern.test(value) || 'Only Number'
      },
      isPort: value => value >= 65535 || 'Only Port Range (1~65535)'
    },
    server: {
      name: null,
      ip: null,
      port: null,
      ssl: null,
      baseDn: null,
      rootDn: null,
      password: null,
      connTimeout: 5000
    },
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
  methods: {
    saveServer: (server) => {
      console.log(server)
    }
  }
}
</script>
