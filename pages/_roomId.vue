<template>
  <v-container>
    <v-layout column wrap>
      <!-- <template v-if="$store.state.user === null"> -->
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>Enter Name</v-card-title>
          <v-card-text>
            <v-layout>
              <v-flex xs12>
                <v-text-field v-model="room.name" label="Name" @keyup.enter="joinRoom"></v-text-field>
                <v-btn block :disabled="room.name === null || !room.name.trim()" color="primary" @click="joinRoom">
                  Enter
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-dialog>
      <!-- </template> -->
      <!-- left drawer -->
      <v-navigation-drawer fixed clipped app expand-on-hover width="300px" :mini-variant.sync="mini">
        <v-layout column fill-height>
          <v-layout row align-center>
            <span class="subheading my-2 ml-3">Now Playing</span>
            <v-btn icon disabled style="visibility: hidden;">
              <v-icon></v-icon>
            </v-btn>
          </v-layout>
          <v-divider></v-divider>
          <v-flex my-2>
            <v-list two-line dense>
              <v-list-tile>
                <v-list-tile-content>
                  <v-list-tile-title>
                    <v-layout row align-center>
                      <v-icon size="13" color="#FF0000">
                        {{ currentVideo.icon !== undefined ? currentVideo.icon : '' }}
                      </v-icon>
                      <span class="ml-2 text-truncate">
                        {{ currentVideo.title }}
                      </span>
                    </v-layout>
                  </v-list-tile-title>
                  <v-list-tile-sub-title>{{ currentVideo.duration }}</v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action style="width: 20px;min-width: 30px !important;">
                  <v-flex></v-flex>
                  <v-list-tile-action-text v-if="currentVideo.user !== undefined && currentVideo.user.name !== ''">
                    added by {{ currentVideo.user.name }}
                  </v-list-tile-action-text>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-flex>
          <v-divider></v-divider>
          <v-layout row align-center pl-2 py-1>
            <v-text-field
              v-model="videoURL"
              solo
              hide-details
              label="Video URL"
              class="urlinput"
              @keyup.enter="addVideo"
            ></v-text-field>
            <v-btn color="primary" style="min-width: 0px;" @click="addVideo">
              <v-icon color="white">playlist_add</v-icon>
            </v-btn>
          </v-layout>
          <v-divider></v-divider>
          <v-flex id="video-queue" xs12 pa-1 ma-1 style="overflow-y: auto;">
            <v-list two-line dense>
              <template v-for="(video, index) in videoQueue">
                <div :key="index">
                  <v-list-tile>
                    <v-list-tile-content>
                      <v-list-tile-title>
                        <v-layout row align-center>
                          <!-- <v-icon v-if="index % 2 == 0" size="13" color="#FF0000">fab fa-youtube</v-icon>
                          <v-icon v-else size="13" color="#6441A4">fab fa-twitch</v-icon> -->
                          <v-icon size="13" color="#FF0000">{{ video.icon }}</v-icon>
                          <a class="ml-2 text-truncate video-queue-title" @click="nextVideo(index)">
                            <span>
                              {{ video.title }}
                            </span>
                          </a>
                        </v-layout>
                      </v-list-tile-title>
                      <v-list-tile-sub-title>{{ video.duration }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action style="width: 20px;min-width: 30px !important;">
                      <v-flex></v-flex>
                      <v-list-tile-action-text>
                        <span class="pr-1">added by {{ video.user.name }}</span>
                        <v-icon size="15" color="primary" @click="removeVideo(index)">fas fa-trash-alt</v-icon>
                      </v-list-tile-action-text>
                    </v-list-tile-action>
                  </v-list-tile>
                  <v-divider v-if="index < videoQueue.length - 1" class="pb-2"></v-divider>
                </div>
              </template>
            </v-list>
          </v-flex>
        </v-layout>
      </v-navigation-drawer>
      <!-- left drawer -->
      <!-- right drawer -->
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
                <strong>{{ mess.user.name }}</strong
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
              rows="3"
              hide-details
              @keypress="sendMessageFlag = true"
              @keyup.enter="sendMessage"
            ></v-textarea>
            <v-flex text-xs-right pt-1>
              <span class="body-1" :style="message.length > 200 ? 'color: red;' : ''">{{ message.length }}/200</span>
              <v-btn small color="primary" :disabled="message.length > 200" @click="sendMessage">Send</v-btn>
            </v-flex>
          </v-layout>
        </v-layout>
      </v-navigation-drawer>
      <!-- right drawer -->
      <!-- player area -->
      <v-flex xs12>
        <v-layout row>
          <v-responsive :aspect-ratio="16 / 9" class="pa-1 ma-1">
            <youtube
              ref="youtube"
              :video-id="currentVideo.videoId"
              :player-vars="{
                rel: 0,
                autoplay: 1,
                origin: `${location.protocol}//${location.hostname}/`
              }"
              width="100%"
              height="100%"
              @ended="nextVideo(0)"
              @playing="seekVideo"
            ></youtube>
          </v-responsive>
        </v-layout>
      </v-flex>
      <!-- player area -->
    </v-layout>
  </v-container>
</template>

<script src="https://www.youtube.com/iframe_api"></script>
<script>
import io from 'socket.io-client'
export default {
  layout: 'layout',
  data() {
    return {
      location: {
        protocol: () => (process.client ? location.protocol : ''),
        hostname: () => (process.client ? location.hostname : '')
      },
      dialog: false,
      socket: '',
      isLoading: true,
      mini: false,
      now: () => {
        return new Date().toLocaleString('ja-JP')
      },
      room: {
        id: this.$nuxt.$route.params.roomId,
        name: this.$store.state.user
      },
      users: [],
      message: '',
      sendMessageFlag: false,
      messages: [],
      videoURL: '',
      videoQueue: [],
      currentVideo: {
        user: { name: '', id: '' },
        url: '',
        title: '',
        duration: '',
        videoId: '',
        icon: ''
      }
    }
  },
  computed: {
    player() {
      return this.$refs.youtube.player
    }
  },
  created() {
    if (this.$store.state.user === null) {
      this.dialog = true
    }
  },
  mounted() {
    this.socket = io()

    if (this.room.name !== null) {
      this.joinRoom()
    }
  },
  methods: {
    joinRoom() {
      if (this.room.name === null || !this.room.name.trim()) {
        return
      }

      this.socket.emit('join-room', this.room)

      this.socket.on('new-user', user => {
        this.users.push(user || '')
        this.seekVideo()
      })

      this.socket.on('user-left', user => {
        const index = this.users.findIndex(elm => elm.id === user.id)
        this.users.splice(index, 1)
      })

      this.socket.on('new-message', message => {
        this.messages.push(message || {})
        this.scrollChat()
      })

      this.socket.on('new-video', video => {
        this.videoQueue.push(video || {})
        this.$nextTick(() => {
          if (this.currentVideo.title === undefined && this.isLoading === false) {
            this.nextVideo(0)
          }
        })
      })

      this.socket.on('removed-video', index => {
        this.videoQueue.splice(index, 1)
      })

      this.socket.on('current-video', data => {
        this.currentVideo = data.video
        this.player.loadVideoById({
          videoId: data.video.videoId
        })
        if (data.index !== null) {
          this.videoQueue.splice(data.index, 1)
          this.beforeSeekTime = 0
        }
      })

      this.socket.on('seeked-video', time => {
        console.log(time)
        this.player.seekTo(time)
        this.player.playVideo()
      })

      this.socket.on('paused-video', () => {
        this.player.pauseVideo()
      })

      this.socket.on('get-current-duration', () => {
        this.seekVideo()
      })

      this.dialog = false

      setTimeout(() => {
        this.isLoading = false
        this.scrollChat('initial')
        this.$store.commit('name', this.room.name)
      }, 1000)
    },
    sendMessage() {
      if (!this.message.trim() || this.message.trim().length > 200 || !this.sendMessageFlag) {
        return
      }
      // メッセージオブジェクトを作る
      const message = {
        user: {
          name: this.room.name,
          id: this.socket.id
        },
        date: this.now,
        text: this.message.trim()
      }

      // 自身（Vueインスタンス）のデータオブジェクトにメッセージを追加する
      this.messages.push(message)
      // サーバー側にメッセージを送信する
      this.socket.emit('send-message', message)
      this.scrollChat()
      // input要素を空にする
      this.message = ''
      this.sendMessageFlag = false
    },
    scrollChat(flag = '') {
      this.$nextTick(() => {
        const obj = document.getElementById('chat-area')
        const scrolledRate = (Math.abs(obj.scrollHeight - obj.scrollTop - obj.clientHeight) / obj.scrollHeight) * 100
        if (scrolledRate < 15 || flag === 'initial') {
          obj.scrollTop = obj.scrollHeight
        }
        return 0
      })
    },
    addVideo() {
      if (!this.videoURL.trim()) {
        return
      }
      const video = {
        user: {
          name: this.room.name,
          id: this.socket.id
        },
        date: this.now,
        url: this.videoURL.trim()
      }
      this.socket.emit('add-video', video)
      this.videoURL = ''
    },
    removeVideo(index) {
      this.socket.emit('remove-video', index)
    },
    nextVideo(index) {
      if (this.videoQueue.length === 0) {
        return
      }
      this.socket.emit('next-video', index)
    },
    async seekVideo() {
      const time = await this.player.getCurrentTime()
      this.socket.emit('seek-video', time)
    },
    async playVideo() {
      await this.player.playVideo()
    },
    pauseVideo() {
      this.socket.emit('paus-video')
    }
  }
}
</script>
