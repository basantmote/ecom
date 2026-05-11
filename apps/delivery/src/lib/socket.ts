import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000', {
      auth: { token },
      autoConnect: false,
    })
  }
  return socket
}

export function emitLocation(
  assignmentId: string,
  lat: number,
  lng: number,
  status?: string,
) {
  socket?.emit('delivery:location', {
    assignmentId,
    lat,
    lng,
    status,
    timestamp: new Date().toISOString(),
  })
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
