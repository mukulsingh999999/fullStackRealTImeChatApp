import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import getprismaInstance from "./utils/prismaClient.js";

dotenv.config();
const app = express();
const PORT  = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);


const server = app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
})

const io = new Server(server, {
    cors : {
        origin: "http://localhost:3000"
    }
});
// map data structure of name onlineUsers(global object)
global.onlineUsers = new Map();

//socket.on used to listen to events emmitted either from the client or the server side. it can be used on both side
// this events can be emmiited using socket.emit method

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });
    
    socket.on("send-msg", (data) => {  //data contains {senderId,receiverId,messagetoBeSend} (coming from the frontend)
        const senderSocket = onlineUsers.get(data?.to);
        if(senderSocket){
            socket.to(senderSocket).emit("msg-receive",{
                from:data.from,
                message:data.message,
            }) 
        } 
    })
});



