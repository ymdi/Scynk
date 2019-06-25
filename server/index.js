const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

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
          'messages': []
        }
      }
      const currentRoom = roomList[roomId]
      currentRoom.users.push(userData)

      socket.join(roomId, () => {
        currentRoom.users.forEach(user => {
          socket.emit('new-user', user)
        })
        if (currentRoom.messages.length > 0) {
          currentRoom.messages.forEach(message => {
            socket.emit('new-message', message)
          })
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

    socket.on('disconnect', () => {
      const currentRoom = roomList[roomId]
      console.log(`id: ${socket.id} is disconnected from ${roomId}`)
      if(currentRoom != undefined){
        const index = currentRoom.users.findIndex((elm) => elm.id === socket.id)
        const removedUser = currentRoom.users.splice(index, 1)
        socket.broadcast.to(roomId).emit('user-left', removedUser[0])
      }
    })
  })
}

start()
