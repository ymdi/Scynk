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
              <v-text-field v-model="roomId" label="Room ID(default : scynchro)" @keypress.enter="enterRoom"></v-text-field>
              <v-btn :disabled="!name.trim()" block color="primary" @click="enterRoom">Enter</v-btn>
            </v-form>
            <hr class="mt-3 mb-2" />
            <v-layout row mb-2>
              <v-btn
                :href="
                  `https://twitter.com/intent/tweet?hashtags=scynchro&ref_src=twsrc%5Etfw&text=Scynchroで一緒に動画を見ましょう！&tw_p=tweetbutton&url=https://scynchro.herokuapp.com/`
                "
                color="#55acee"
                small
              >
                <v-icon size="14" color="white">fab fa-twitter</v-icon>
                <span class="pl-2 white--text">ツイート</span>
              </v-btn>
            </v-layout>
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
        this.roomId = 'scynchro'
      }
      this.$store.commit('name', this.name)
      this.$router.push(`/${this.roomId}`)
    }
  }
}
</script>
