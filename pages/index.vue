<template>
  <v-layout column justify-center align-center>
    <v-flex xs12 sm8 md6>
      <h1>Welcome to Scynchro.</h1>
      <p>
        Scynchroは、動画を友達と一緒に見るためのアプリケーションです！
      </p>
      <v-card>
        <v-card-title class="headline">ルームに入る</v-card-title>
        <v-card-text>
          <v-form v-model="valid">
            <v-text-field v-model="name" label="Name"></v-text-field>
            <v-text-field
              v-model="roomId"
              label="Room ID(default : 1)"
            ></v-text-field>
            <v-btn block color="primary">Enter</v-btn>
          </v-form>
          <hr class="my-3" />
          <p>
            Find a bug? Report it on the github
            <a
              href="https://github.com/ymdi/Scynchro/issues"
              target="_blank"
              title="contribute"
              >issue board</a
            >.
          </p>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      valid: false,
      name: '',
      roomId: ''
    }
  },
  layout: 'layout'
}
</script>
