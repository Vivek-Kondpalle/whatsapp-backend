import { Server as SocketIOServer } from 'socket.io'
import Message from './models/MessagesModel.js'
import Channel from './models/ChannelModel.js'

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
                console.log(' user -> ', userId , ' Disconnected ')
                break;
            }
        }
    }

    const sendMessage = async (message) => {
        const senderSocketId = userSocketMap.get(message.sender);
        const recipientSocketId = userSocketMap.get(message.recipient);

        const createdMessage = await Message.create(message)

        const messageData = await Message.findById(createdMessage._id)
            .populate("sender", "id email firstName lastName image color")
            .populate("recipient", "id email firstName lastName image color")

        if(recipientSocketId){
            io.to(recipientSocketId).emit('recieveMessage', messageData)
        }
        if(senderSocketId){
            io.to(senderSocketId).emit('recieveMessage', messageData)
        }
    }

    const sendChannelMessage = async (message) => {
        const { channelId, sender, content, messageType, fileUrl } = message

        const createdMessage = await Message.create({sender, recipient: null, content, messageType, fileUrl, timestamp: new Date()})

        const messageData = await Message.findById(createdMessage._id).populate("sender", "id email firstName lastName image color").exec();

        await Channel.findByIdAndUpdate(channelId, { $push: { messages: messageData._id } })

        const channel = await Channel.findById(channelId).populate("members")

        const finalData = {...messageData._doc, channelId: channel._id}

        if(channel && channel.members){
            channel.members.forEach(member => {
                const memberSocketId = userSocketMap.get(member._id.toString())
                if(memberSocketId){
                    io.to(memberSocketId).emit('recieve-channel-message', finalData)
                }
            })

            const adminSocketId = userSocketMap.get(channel.admin._id.toString())
            if(adminSocketId){
                io.to(adminSocketId).emit('recieve-channel-message', finalData)
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

        socket.on('sendMessage', sendMessage)
        socket.on('send-channel-message', sendChannelMessage)
        socket.on('disconnect', () => disconnect(socket))
    })
}

export default setupSocket