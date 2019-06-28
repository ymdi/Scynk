const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const axios = require('axios')
const moment = require('moment')
const momentDurationFormatSetup = require("moment-duration-format")

require('dotenv').config()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  const server = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  let roomList = {}

  const io = require('socket.io').listen(server)

  io.on('connection', function(socket){
    let userData, roomId = ''
    console.log(`id: ${socket.id} is connected`)

    socket.on('join-room', data => {
      userData = {
        'id': socket.id,
        'name': data.name
      }
      roomId = `room-${data.id}`
      if(!roomList[roomId]){
        roomList[roomId] = {
          'users': [],
          'messages': [],
          'videoQueue': [],
          'currentVideo': {},
          'currentDuration': 0,
          'beforeSeeked': new Date().getTime()
        }
      }
      const currentRoom = roomList[roomId]
      currentRoom.users.push(userData)

      socket.join(roomId, () => {
        currentRoom.users.forEach(user => {
          socket.emit('new-user', user)
        })
        socket.emit('get-current-duration')
        if (currentRoom.messages.length > 0) {
          currentRoom.messages.forEach(message => {
            socket.emit('new-message', message)
          })
        }
        if (currentRoom.videoQueue.length > 0) {
          currentRoom.videoQueue.forEach(video => {
            socket.emit('new-video', video)
          })
        }
        if (typeof currentRoom.currentVideo.title !== undefined) {
          socket.emit('current-video', {
            video: currentRoom.currentVideo,
            index: null
          })
          socket.emit('seek-video', currentRoom.currentDuration)
        }
        console.log(`id: ${socket.id} is joined to ${roomId}`)
        socket.broadcast.to(roomId).emit('new-user', userData)
      })
    })

    socket.on('send-message', message => {
      if(message.text.length <= 200){
        roomList[roomId].messages.push(message)
        socket.broadcast.to(roomId).emit('new-message', message)
      }
    })

    socket.on('add-video', video => {
      const id = video.url.match(/(?<=\?v=).*?(?=&|$)/)
      const obj = {
        id: id !== null ? id[0] : '',
        type: ''
      }

      const getData = async (obj) => {
        return await axios.get('https://www.googleapis.com/youtube/v3/videos',{
          params:{
            id: obj.id,
            key: process.env.Youtube_API_KEY,
            part: 'snippet, contentDetails',
            fields: 'items(snippet(title),contentDetails(duration))'
          }
        })
      }

      getData(obj).then((res) => {
        const data = res.data.items[0]
        video.title = data.snippet.title
        video.duration = moment.duration(data.contentDetails.duration).format('hh:mm:ss')
        video.videoId = obj.id
        video.icon = 'fab fa-youtube'
        
        roomList[roomId].videoQueue.push(video)
        io.in(roomId).emit('new-video', video)
      }).catch(err => {
        console.log(JSON.stringify(err.response.data))
      })
    })

    socket.on('remove-video', index => {
      currentRoom.videoQueue.splice(index, 1)
      io.in(roomId).emit('removed-video', index)
    })

    socket.on('next-video', index => {
      const currentRoom = roomList[roomId]
      const currentVideo = currentRoom.videoQueue ? currentRoom.videoQueue[index] : ''
      currentRoom.currentVideo = currentVideo
      currentRoom.currentDuration = 0
      currentRoom.videoQueue.splice(index, 1)
      io.in(roomId).emit('current-video', {
        video: currentVideo,
        index: index
      })
    })

    socket.on('seek-video', time => {
      const secs = (new Date().getTime() - roomList[roomId].beforeSeeked) / 1000
      if (secs < 1) {
        return
      }
      roomList[roomId].beforeSeeked = new Date().getTime()
      roomList[roomId].currentDuration = time
      socket.broadcast.to(roomId).emit('seeked-video', time)
    })

    socket.on('pause-video', () => {
      socket.broadcast.to(roomId).emit('paused-video')
    })

    socket.on('disconnect', () => {
      const currentRoom = roomList[roomId]
      console.log(`id: ${socket.id} is disconnected from ${roomId}`)
      if(currentRoom !== undefined){
        const index = currentRoom.users.findIndex((elm) => elm.id === socket.id)
        const removedUser = currentRoom.users.splice(index, 1)
        socket.broadcast.to(roomId).emit('user-left', removedUser[0])
      }
    })
  })
}

start()
