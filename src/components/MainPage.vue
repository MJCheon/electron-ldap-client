<template>
  <v-app id="inspire">
    <NavigationPage />

    <v-main>
      <v-container
        fluid
      >
        <TreePage />
        <TreeEntryEditPage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import TreePage from './TreePage'
import TreeEntryEditPage from './tree/EntryEditPage'
import NavigationPage from './NavigationPage'

export default {
  components: {
    TreePage,
    TreeEntryEditPage,
    NavigationPage
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
