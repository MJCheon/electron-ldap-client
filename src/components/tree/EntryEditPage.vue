<template>
    <v-dialog
      v-model='showEntryDialog'
    >
      <v-card>
        <v-card-title>
          <span class='headline'>Edit Entry</span>
        </v-card-title>
        <v-card-text>
          <v-form
            ref="form"
          >
            {{ entry }}
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
    entry: [],
    showEntryDialog: false,
    server: {
      name: ''
    },
    sslItems: []
  }),
  created () {
    EventBus.$on('editEntry', entry => {
      this.entry = entry
      this.showEntryDialog = true
    })
  },
  watch: {
  },
  methods: {
    close () {
      this.showEntryDialog = false
    }
  }
}
</script>
