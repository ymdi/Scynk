<template>
  <v-container>
    <v-layout column justify-center align-center>
      <v-flex xs12 sm8 md6>
        <h1>Welcome to Scynchro.</h1>
        <p>Scynchroは、友達と一緒に動画を見るためのアプリケーションです！</p>
        <v-card>
          <v-card-title class="headline">ルームに入る</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="name"
                :rules="[rules.required]"
                label="Name"
                @keypress.enter="enterRoom"
              ></v-text-field>
              <v-text-field v-model="roomId" label="Room ID(default : 1)" @keypress.enter="enterRoom"></v-text-field>
              <v-btn :disabled="!name.trim()" block color="primary" @click="enterRoom">Enter</v-btn>
            </v-form>
            <hr class="my-3" />
            <p>
              アドバイス、ご意見、ご要望はこちらまで！
              <a href="https://twitter.com/sababread" target="_blank" title="contribute">Twitter</a>.
            </p>
            <p>
              バグ報告はこちらまで！
              <a href="https://github.com/ymdi/Scynchro/issues" target="_blank" title="contribute">issue board</a>.
            </p>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  layout: 'layout',
  components: {},
  data() {
    return {
      name: this.$store.state.user !== null ? this.$store.state.user : '',
      roomId: '',
      rules: {
        required: value => !!value || 'Required.'
      }
    }
  },
  methods: {
    enterRoom: function() {
      if (!this.name.trim()) {
        return
      }
      if (!this.roomId) {
        this.roomId = 1
      }
      this.$store.commit('name', this.name)
      this.$router.push(`/${this.roomId}`)
    }
  }
}
</script>
