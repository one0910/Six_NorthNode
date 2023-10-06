const { Server } = require('socket.io')
const debug = require('debug')
debug.enable('socket.io:*')
function connectSocketIO (server) {
  let seatData = []

  /** * Create Socket I/O. */
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })
  io.on('connection', (socket) => {
    socket.emit('userIDChannel', socket.id)

    // 當進入該電影的選位畫面時的頻道
    socket.on('join_screen', (screenId) => {
      socket.join(screenId)
      socket.emit('join_screen', seatData.find(screen => screen.screenId === screenId))
      socket.broadcast.to(screenId).emit(
        'join_screen',
        '訪客進來了'
      )
    })

    socket.on('ping', (cb) => {
      console.log('Received ping from client:', socket.id)
      const receiveTime = Date.now()
      cb(receiveTime)
    })

    // socket中斷時，會把所選的位子清除
    socket.on('disconnect', (reason) => {
      console.log('client disconnected:', socket.id, 'Reason:', reason)
      seatData.forEach(seatdata => {
        if (seatdata[socket.id]) {
          delete seatdata[socket.id]
          // socket.to(seatdata.screenId).emit('reurnSeatStatus', seatData.find(screen => screen.screenId === seatdata.screenId))
          socket.to(seatdata.screenId).emit('reurnSeatStatus', seatdata)
        }
      })
    })

    // 當選擇座位時的頻道
    socket.on('seatStatus', (data) => {
      console.log(' data=> ', data)
      const existingScreen = seatData.find(screen => screen.screenId === data.screenId)
      if (existingScreen) {
        // 若該場次之前有選過位子，目前有其他使用者，而訂票者目前在選位
        if (existingScreen[data.socketId] && data.socketId !== '') {
          existingScreen[data.socketId] = [...new Set([...data.seatIndex])]

          // 若該場次之前有選過位子(有screenId了)，目前有其他的使用者在選位
        } else if (data.socketId !== '') {
          existingScreen[data.socketId] = data.seatIndex
        }
      } else {
        // 若該場次之前都沒有被選過位子(沒有sscreenId)，且目前只有一個訂票者在選位
        if (data.socketId !== '') {
          const newScreen = {
            screenId: data.screenId,
            [data.socketId]: [...new Set([...data.seatIndex])]
          }
          seatData.push(newScreen)
        }
      }
      console.log('seatData => ', seatData)
      console.log(' seatData_in=> ', seatData.find(screen => screen.screenId === data.screenId))
      socket.to(data.screenId).emit('reurnSeatStatus', seatData.find(screen => screen.screenId === data.screenId))
      // socket.to(data.screenId).emit('reurnSeatStatus', { socketScreenId: socket.id, seatIndex: data.seatIndex, screenId: data.screenId })
    })

    socket.on('leaveScreen', ({ socketId, screenId, leave }) => {
      console.log('leaveScreen_socket.id => ', socket.id)
      if (seatData.find(screen => screen.screenId === screenId)) {
        seatData = seatData.map((seatItem) => {
          const newSeatItem = { ...seatItem }
          delete newSeatItem[socketId]
          return newSeatItem
        })
        socket.broadcast.to(screenId).emit('reurnSeatStatus', seatData.find(screen => screen.screenId === screenId))
      }
      if (leave) {
        console.log(' seatData_leave=> ', seatData)
        socket.leave(screenId)
        socket.disconnect()
      }
    })

    socket.on('order', ({ socketId, screenId, seatOrderedIndex }) => {
      if (seatData.find(screen => screen.screenId === screenId)) {
        seatData = seatData.map((seatItem) => {
          const newSeatItem = { ...seatItem }
          delete newSeatItem[socketId]
          return newSeatItem
        })
        socket.broadcast.to(screenId).emit('reurnSeatStatus', seatData.find(screen => screen.screenId === screenId))
        socket.broadcast.to(screenId).emit('order', seatOrderedIndex)
      }
      socket.leave(screenId)
      socket.disconnect()
    })
  })
}

module.exports = connectSocketIO
