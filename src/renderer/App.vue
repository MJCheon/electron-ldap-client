<template>
  <div id="app">
    <ul>
        <li><router-link v-bind:to="{ name: 'HelloWorld' }">HelloWorld</router-link></li>
    </ul>
  </div>
</template>

<script>
  export default {
    name: 'electron-vue'
  }
</script>

<style>
  /* CSS */
</style>
