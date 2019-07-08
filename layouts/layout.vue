<template>
  <v-app v-resize="onResize" light>
    <v-toolbar fixed app clipped-left clipped-right>
      <v-toolbar-title v-text="title" />
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn
          v-for="(item, index) in menu"
          :key="item.title"
          :href="item.link"
          :target="index > 0 ? '_blank' : ''"
          flat
          class="layout-btn"
        >
          <v-icon size="14">{{ item.icon }}</v-icon>
          <span class="pl-1">{{ item.title }}</span>
        </v-btn>
      </v-toolbar-items>
      <v-menu bottom left>
        <template v-slot:activator="{ on }">
          <v-btn icon class="hidden-sm-and-up" v-on="on">
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-tile v-for="(item, index) in menu" :key="item.icon">
            <v-btn
              :href="item.link"
              :target="index > 0 ? '_blank' : ''"
              flat
              class="layout-btn"
              style="width: 100px !important;"
            >
              <v-icon size="14">{{ item.icon }}</v-icon>
              <span class="pl-1">{{ item.title }}</span>
            </v-btn>
          </v-list-tile>
        </v-list>
      </v-menu>
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
        { title: 'Join room', icon: 'fas fa-door-open', link: '/' },
        { title: 'Source', icon: 'fab fa-github', link: 'https://github.com/ymdi/Scynchro' },
        { title: 'Contact', icon: 'fab fa-twitter', link: 'https://twitter.com/ymdi_' }
      ]
    }
  },
  methods: {
    onResize() {
      const windowSize = window.innerWidth
      this.$store.commit('windowSize', windowSize)
    }
  }
}
</script>
