<template>
  <v-app light>
    <v-toolbar fixed app clipped-left>
      <v-toolbar-title v-text="title" />
    </v-toolbar>
    <v-content>
      <nuxt />
    </v-content>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      title: 'Scynchro'
    }
  }
}
</script>
