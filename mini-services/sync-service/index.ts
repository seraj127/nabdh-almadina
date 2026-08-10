import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Track connected users
const connectedUsers = new Map<string, { socketId: string; userId: string; role: string }>()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  socket.on('join', (data: { userId: string; role: string }) => {
    const { userId, role } = data

    // Store user info
    connectedUsers.set(socket.id, { socketId: socket.id, userId, role })

    // Join user-specific room (for targeted notifications)
    socket.join(`user-${userId}`)

    // Join role-specific room
    if (role === 'admin') {
      socket.join('admin-room')
    }

    console.log(`User ${userId} (${role}) joined. Total: ${connectedUsers.size}`)
  })

  // New order placed — notify admins
  socket.on('order-created', (data: { orderId: string; orderNumber: string; userId: string; total: number }) => {
    console.log(`New order: ${data.orderNumber}`)
    io.to('admin-room').emit('new-order', data)
  })

  // Order status updated — notify the specific user
  socket.on('order-updated', (data: { orderId: string; orderNumber: string; userId: string; status: string; note?: string }) => {
    console.log(`Order ${data.orderNumber} updated to ${data.status}`)
    io.to(`user-${data.userId}`).emit('order-status-changed', data)
    // Also notify admins
    io.to('admin-room').emit('order-status-changed', data)
  })

  // Send notification to a specific user
  socket.on('notify-user', (data: { userId: string; titleAr: string; titleEn: string; bodyAr: string; bodyEn: string; type: string }) => {
    io.to(`user-${data.userId}`).emit('notification', data)
  })

  // Dashboard data changed — tell admins to refresh
  socket.on('dashboard-refresh', () => {
    io.to('admin-room').emit('refresh-stats')
  })

  // Broadcast to all connected clients
  socket.on('broadcast', (data: { event: string; payload: any }) => {
    io.emit(data.event, data.payload)
  })

  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id)
    if (user) {
      console.log(`User ${user.userId} (${user.role}) disconnected`)
      connectedUsers.delete(socket.id)
    }
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3004
httpServer.listen(PORT, () => {
  console.log(`Sync WebSocket server running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  httpServer.close(() => process.exit(0))
})
