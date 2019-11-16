<template>
  <v-container style="height: 100vh;">
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
    <!-- left drawer -->
    <v-navigation-drawer
      fixed
      clipped
      app
      :width="queueWidth"
      :mini-variant.sync="mini"
      mini-variant-width="60"
      mobile-break-point="780"
    >
      <v-btn v-if="mini" icon large @click="mini = false">
        <v-icon>playlist_play</v-icon>
      </v-btn>
      <v-layout v-if="!mini" column fill-height>
        <v-layout row align-center>
          <span class="subheading my-2 ml-3">Now Playing</span>
          <v-spacer></v-spacer>
          <v-btn icon @click.stop="mini = true">
            <v-icon>chevron_left</v-icon>
          </v-btn>
        </v-layout>
        <v-divider></v-divider>
        <v-flex my-2>
          <v-list two-line dense>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>
                  <v-layout row align-center>
                    <v-icon size="13" :color="currentVideo.color">
                      {{ currentVideo.icon !== undefined ? currentVideo.icon : '' }}
                    </v-icon>
                    <span class="ml-2 text-truncate">
                      {{ currentVideo.title }}
                    </span>
                  </v-layout>
                </v-list-tile-title>
                <v-list-tile-sub-title>
                  <v-layout row align-baseline>
                    <v-flex>{{ currentVideo.duration }}</v-flex>
                    <v-flex
                      v-if="currentVideo.user !== undefined && currentVideo.user.name !== ''"
                      text-truncate
                      text-xs-right
                      ml-4
                    >
                      added by {{ currentVideo.user.name }}
                    </v-flex>
                  </v-layout>
                </v-list-tile-sub-title>
              </v-list-tile-content>
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
                <v-list-tile class="pb-2">
                  <v-list-tile-content>
                    <v-list-tile-title>
                      <v-layout row align-center>
                        <v-icon size="13" :color="video.color">{{ video.icon }}</v-icon>
                        <a class="ml-2 text-truncate video-queue-title" @click="nextVideo(index)">
                          <span>
                            {{ video.title }}
                          </span>
                        </a>
                      </v-layout>
                    </v-list-tile-title>
                    <v-list-tile-sub-title>
                      <v-layout row align-baseline>
                        <v-flex>{{ video.duration }}</v-flex>
                        <v-flex text-truncate text-xs-right ml-4>added by {{ video.user.name }}</v-flex>
                      </v-layout>
                    </v-list-tile-sub-title>
                  </v-list-tile-content>
                  <v-list-tile-action style="width: 20px;min-width: 30px !important;">
                    <v-flex></v-flex>
                    <v-list-tile-action-text>
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
    <v-navigation-drawer v-if="chatDrawer" fixed clipped app right width="330" mobile-break-point="780">
      <chat :users="users" :messages="messages" :rows="3" @emit-message="sendMessage"></chat>
    </v-navigation-drawer>
    <!-- right drawer -->
    <!-- player area -->
    <v-flex>
      <v-responsive :aspect-ratio="16 / 9" class="pa-1 ma-1">
        <youtube
          ref="youtube"
          :video-id="currentVideo.videoId"
          :player-vars="{
            rel: 0,
            autoplay: 1,
            origin: `${protocol}//${hostname}/`
          }"
          width="100%"
          height="100%"
          @ended="nextVideo(0)"
          @playing="seekVideo"
        ></youtube>
      </v-responsive>
    </v-flex>
    <!-- player area -->
    <v-layout row>
      <v-btn
        :href="
          `https://twitter.com/intent/tweet?hashtags=scynk&ref_src=twsrc%5Etfw&text=${
            room.id
          }で動画再生中！&tw_p=tweetbutton&url=https://scynk.herokuapp.com/${room.id}`
        "
        target="_blank"
        color="#1da1f2"
        small
      >
        <v-icon size="14" color="white">fab fa-twitter</v-icon>
        <span class="pl-2 white--text">ツイート</span>
      </v-btn>
    </v-layout>
    <template v-if="!chatDrawer">
      <chat
        id="mobile-chat"
        :users="users"
        :messages="messages"
        :rows="1"
        :style="`height: calc(100% - ${top}px + 30px)`"
        @emit-message="sendMessage"
      ></chat>
    </template>
  </v-container>
</template>

<script src="https://www.youtube.com/iframe_api"></script>
<script>
import io from 'socket.io-client'
import Chat from '~/components/chat'

export default {
  validate({ params }) {
    const pattern = /^[ぁ-んァ-ンーa-zA-Z0-9一-龠０-９\-\r]*$/
    return params.roomId.length <= 100 && pattern.test(params.roomId)
  },
  layout: 'layout',
  components: {
    Chat
  },
  data() {
    return {
      protocol: null,
      hostname: null,
      dialog: false,
      socket: '',
      isLoading: true,
      now: () => {
        return new Date().toLocaleString('ja-JP')
      },
      room: {
        id: this.$nuxt.$route.params.roomId,
        name: this.$store.state.user
      },
      users: [],
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
      },
      mini: false,
      queueWidth: 320,
      chatDrawer: true,
      top: 0
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
    if (this.$store.state.windowSize < 450) {
      this.chatDrawer = false
      this.getTop()
    }
  },
  mounted() {
    this.socket = io()

    if (this.room.name !== null) {
      this.joinRoom()
    }

    this.$store.watch(
      (state, getters) => getters.getWindowSize,
      (newValue, oldValue) => {
        if (780 < newValue && newValue < 1264) {
          this.mini = true
          this.chatDrawer = true
        } else if (newValue < 450) {
          this.queueWidth = 280
          this.chatDrawer = false
        } else {
          this.mini = false
          this.queueWidth = 320
          this.chatDrawer = true
        }
      }
    )

    if (process.client) {
      this.protocol = location.protocol
      this.hostname = location.hostname
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
        console.log(video)
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
    clickSend() {
      this.sendMessageFlag = true
      this.sendMessage()
    },
    sendMessage(text) {
      const message = {
        user: {
          name: this.room.name,
          id: this.socket.id
        },
        date: this.now,
        text: text.trim()
      }
      this.messages.push(message)
      this.socket.emit('send-message', message)
      this.scrollChat()
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
      this.socket.emit('pause-video')
    },
    getTop() {
      if (process.client) {
        const mobilechat = document.getElementById('mobile-chat')
        this.top = mobilechat.getBoundingClientRect().top
      }
    }
  }
}
</script>
