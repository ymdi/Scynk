<template>
  <v-container>
    <v-layout column wrap>
      <v-navigation-drawer fixed clipped app expand-on-hover width="300px" :mini-variant.sync="mini">
      </v-navigation-drawer>
      <v-navigation-drawer fixed clipped app right permanent width="350px">
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
                        :class="index == users.length - 1 ? 'pb-3' : 'pb-1'"
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
          <v-flex id="chatarea" xs12 pa-1 ma-1 style="overflow-y: scroll">
            <div v-for="mess in messages" :key="mess.date" class="px-1">
              <p>
                <strong>{{ mess.user.name }}</strong
                >:
                <span style="word-wrap:break-word;">{{ mess.text }}</span>
              </p>
            </div>
          </v-flex>
          <v-divider></v-divider>
          <v-layout column pt-1 px-1 pb-4 ma-2>
            <v-flex xs12>
              <v-textarea
                v-model="message"
                placeholder="message"
                solo
                no-resize
                rows="3"
                hide-details
                @keyup.enter="sendMessage"
              ></v-textarea>
            </v-flex>
            <v-layout>
              <v-flex text-xs-right>
                <span class="body-1" :style="message.length > 200 ? 'color: red;' : ''">
                  {{ message.length }}/200
                </span>
                <v-btn small color="primary" :disabled="message.length > 200" @click="sendMessage">Send</v-btn>
              </v-flex>
            </v-layout>
          </v-layout>
        </v-layout>
      </v-navigation-drawer>
      <v-flex xs12>
        <v-layout row>
          <v-flex style="width:calc(100% - 360px);//border:1px solid black;">
            <!-- <div class="title font-weight-thin text-truncate pa-1 ma-1">
              texttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttexttext
            </div>
            <div class="caption pa-1 ma-1">added by user1</div> -->
            <v-responsive :aspect-ratio="16 / 9" class="pa-1 ma-1">
              <!-- <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/ZFqGCyitrsQ"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe> -->
            </v-responsive>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import io from 'socket.io-client'
export default {
  layout: 'layout',
  data() {
    return {
      socket: '',
      room: {
        id: this.$nuxt.$route.params.roomId,
        name: 'test'
      },
      users: [],
      message: '',
      messages: [],
      isLoading: true,
      mini: false
    }
  },
  mounted() {
    this.socket = io()

    this.socket.emit('join-room', this.room)

    this.socket.on('new-user', user => {
      this.users.push(user || '')
    })

    this.socket.on('user-left', user => {
      const index = this.users.findIndex(elm => elm.id === user.id)
      this.users.splice(index, 1)
    })

    this.socket.on('new-message', message => {
      this.messages.push(message || {})
      this.chatScroll()
    })

    setTimeout(() => {
      this.isLoading = false
      this.chatScroll()
    }, 1000)
  },
  methods: {
    sendMessage() {
      if (!this.message.trim() || this.message.length > 200) {
        return
      }
      const now = new Date().toLocaleString('ja-JP')
      // メッセージオブジェクトを作る
      const message = {
        user: {
          name: this.room.name,
          id: this.socket.id
        },
        date: now,
        text: this.message.trim()
      }

      // 自身（Vueインスタンス）のデータオブジェクトにメッセージを追加する
      this.messages.push(message)
      // サーバー側にメッセージを送信する
      this.socket.emit('send-message', message)
      this.chatScroll()
      // input要素を空にする
      this.message = ''
    },
    chatScroll: function() {
      this.$nextTick(() => {
        const obj = document.getElementById('chatarea')
        obj.scrollTop = obj.scrollHeight
      })
    }
  }
}
</script>
