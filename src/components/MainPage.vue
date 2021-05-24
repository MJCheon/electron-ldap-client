<template>
  <v-app id="inspire">
    <NavigationPage />

    <v-main>
      <v-container
        fluid
      >
        <TreePage />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import TreePage from './TreePage'
import NavigationPage from './NavigationPage'

export default {
  components: {
    TreePage,
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
html {
  overflow-y: hidden;
}
::-webkit-scrollbar {
  width: 0px; /* Remove scrollbar space */
}
</style>
