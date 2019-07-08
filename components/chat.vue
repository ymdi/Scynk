<template>
  <v-layout column fill-height>
    <v-layout row align-center>
      <span class="subheading my-2 ml-3">Chat</span>
      <v-spacer></v-spacer>
      <v-menu bottom left allow-overflow text-xs-right max-height="70%">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>list</v-icon>
          </v-btn>
        </template>
        <v-card width="250">
          <v-flex pt-3 pb-2 pl-3><span class="font-weight-bold body-2">Users</span></v-flex>
          <v-flex>
            <table>
              <tr v-for="(user, index) in users" :key="user.id">
                <td
                  class="pl-3"
                  :class="index === users.length - 1 ? 'pb-3' : 'pb-1'"
                  style="word-wrap:break-word;"
                  v-text="user.name"
                ></td>
              </tr>
            </table>
          </v-flex>
        </v-card>
      </v-menu>
    </v-layout>
    <v-divider></v-divider>
    <v-flex id="chat-area" xs12 pa-1 ma-1 style="overflow-y: auto;">
      <div v-for="(mess, index) in messages" :key="index" class="px-1">
        <p>
          <strong style="word-wrap:break-word;">{{ mess.user.name }}</strong
          >:
          <span style="word-wrap:break-word;">{{ mess.text }}</span>
        </p>
      </div>
    </v-flex>
    <v-divider></v-divider>
    <v-layout column justify-end xs12 ma-2>
      <v-textarea
        v-model="message"
        placeholder="message"
        solo
        no-resize
        :rows="rows"
        hide-details
        @keypress="sendMessageFlag = true"
        @keyup.enter="sendMessage"
      ></v-textarea>
      <v-flex text-xs-right pt-1>
        <span class="body-1" :style="message.length > 200 ? 'color: red;' : ''">{{ message.length }}/200</span>
        <v-btn small color="primary" :disabled="message.length > 200" @click="clickSend">Send</v-btn>
      </v-flex>
    </v-layout>
  </v-layout>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'

@Component
export default class Chat extends Vue {
  @Prop()
  users?: {
    id: string
    name: string
  }[]
  @Prop()
  messages?: {
    user: {
      id: string
      name: string
    }
    date: Date
    text: string
  }
  @Prop()
  rows?: number
  message: string = ''
  sendMessageFlag: boolean = false

  @Emit('emit-message')
  emitMessage() {
    return this.message
  }

  sendMessage() {
    if (!this.message.trim() || this.message.trim().length > 200 || !this.sendMessageFlag) {
      this.sendMessageFlag = false
      return
    }
    this.emitMessage()
    this.message = ''
  }

  clickSend() {
    this.sendMessageFlag = true
    this.sendMessage()
  }
}
</script>
