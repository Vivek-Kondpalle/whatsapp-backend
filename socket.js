import { Server as SocketIOServer } from 'socket.io'

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors:{
            origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
            methods: ["GET", "POST"],
            credentials: true
        }
    })
    
    const userSocketMap = new Map();

    io.use((socket, next) => {
        const origin = socket.handshake.headers.origin;

        if (origin && allowedOrigins.includes(origin)) {
            socket.handshake.headers['Access-Control-Allow-Origin'] = origin;
            socket.handshake.headers['Access-Control-Allow-Credentials'] = 'true';
        }

        next();
    });

    const disconnect = (socket) => {
        for(const[userId, socketId] of userSocketMap.entries()){
            if(socketId === socket.id){
                userSocketMap.delete(userId)
                break;
            }
        }
    }

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId

        if(userId){
            userSocketMap.set(userId, socket.id)
            console.log(` User -> ${userId} with socket id -> ${socket.id}`)
        } else {
            console.log('User id not provided')
        }

        socket.on('disconnect', () => disconnect(socket))
    })
}

export default setupSocket