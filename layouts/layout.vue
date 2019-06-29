<template>
  <v-app light>
    <v-toolbar fixed app clipped-left clipped-right>
      <v-toolbar-title v-text="title" />
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          v-for="(item, index) in menu"
          :key="item.title"
          :href="item.link"
          :target="index > 0 ? '_blank' : ''"
          flat
        >
          <v-icon size="14">{{ item.icon }}</v-icon>
          <span class="pl-1">{{ item.title }}</span>
        </v-btn>
      </v-toolbar-items>
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
      title: 'Scynchro',
      menu: [
        { title: 'join room', icon: 'fas fa-door-open', link: '/' },
        { title: 'source', icon: 'fab fa-github', link: 'https://github.com/ymdi/Scynchro' },
        { title: 'contact', icon: 'fab fa-twitter', link: 'https://twitter.com/sababread' }
      ]
    }
  }
}
</script>
