<template>
    <h2>hello World!!!</h2>
</template>

<script>
    let ipc = require('electron').ipcRenderer
    export default {
      methods: {
        click_hello () {
          let msg = 'Hello world'
          ipc.send('test', msg)
        }
      }
    }
</script>
