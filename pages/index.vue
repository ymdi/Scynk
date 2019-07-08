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
                :rules="[rules.required, rules.counter]"
                label="Name"
                @keypress.enter="enterRoom"
              ></v-text-field>
              <v-text-field
                v-model="roomId"
                :rules="[rules.roomId, rules.counter]"
                label="Room ID(default : scynchro)"
                @keypress.enter="enterRoom"
              ></v-text-field>
              <v-btn :disabled="!valids()" block color="primary" @click="enterRoom">
                Enter
              </v-btn>
            </v-form>
            <hr class="mt-3 mb-2" />
            <v-layout row mb-2>
              <v-btn
                :href="
                  `https://twitter.com/intent/tweet?hashtags=scynchro&ref_src=twsrc%5Etfw&text=Scynchro&tw_p=tweetbutton&url=https://scynchro.herokuapp.com/`
                "
                target="_blank"
                color="#1da1f2"
                small
              >
                <v-icon size="14" color="white">fab fa-twitter</v-icon>
                <span class="pl-2 white--text">ツイート</span>
              </v-btn>
            </v-layout>
            <p>
              アドバイス、ご意見、ご要望はこちら
              <a href="https://twitter.com/ymdi_" target="_blank" title="contribute">Twitter</a>
            </p>
            <p>
              バグ報告はこちら
              <a href="https://github.com/ymdi/Scynchro/issues" target="_blank" title="contribute">issue board</a>
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
        required: value => !!value || 'Required.',
        roomId: value => {
          const pattern = /^[ぁ-んァ-ンーa-zA-Z0-9一-龠０-９\-\r]*$/
          return pattern.test(value) || 'Special characters are not allowed.'
        },
        counter: value => value.length <= 100 || 'Max 100 Caracters.'
      }
    }
  },
  methods: {
    valids() {
      const rules = this.rules
      if (!this.name.trim()) {
        return false
      }
      if (rules.roomId(this.roomId) !== true) {
        return false
      }
      if (rules.counter(this.name) !== true || rules.counter(this.roomId) !== true) {
        return false
      }
      return true
    },
    enterRoom() {
      if (!this.valids()) {
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
