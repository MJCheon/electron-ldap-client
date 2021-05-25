<template>
    <v-dialog
      v-model='showTreeDialog'
      max-width='600px'
    >
    <template v-slot:activator='{ on, attr }'>
        <v-fab-transition>
          <v-icon
            v-on='on'
            v-bind='attr'
            v-show='!hidden'
            color='blue'
            fab
            top
            dark
            small
          >mdi-plus</v-icon>
        </v-fab-transition>
      </template>
      <v-card>
        <v-card-title>
          <span class='headline'>Edit Entry</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
          >
            <v-row>
              <v-col>
                {{ attrNode }}
              </v-col>
            </v-row>
            <v-spacer></v-spacer>
            <v-btn
              color='blue darken-1'
              text
              @click='close()'
            >
              Close
            </v-btn>
            <v-btn
              color='blue darken-1'
              absolute
              right
              text
              @click='close()'
            >
              Save
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script>
import EventBus from '../../event-bus'

export default {
  data: () => ({
    attrNode: [],
    hidden: false,
    showTreeDialog: false,
    server: {
      name: ''
    },
    sslItems: []
  }),
  created () {
    EventBus.$on('addEntry', node => {
      console.log('event accept')
      this.attrNode = node
      this.showTreeDialog = true
    })
  },
  watch: {
  },
  methods: {
    close () {
      this.showTreeDialog = false
    }
  }
}
</script>
