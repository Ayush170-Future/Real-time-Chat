require('dotenv').config();
var mongoose = require('mongoose');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const userRoute = require('./routes/userRoute');
const io = require('socket.io')(http);
const User = require('./models/userModel');
const Chat = require("./models/chatModel");

mongoose.connect("mongodb://localhost:27017/dynamic-chat-app").then(() => {
    console.log("Connected to Mongoose")
}).catch((err) => {
    console.log(err)
})

app.use('/', userRoute);

var usp = io.of('/user-namespace');

usp.on('connection', async (socket) => {
    console.log('User Connected');

    var userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({_id: userId}, {$set: {is_online: '1'}});

    // User broadcast online status
    socket.broadcast.emit('getOnlineUser', {user_id: userId});

    socket.on('disconnect', async () => {
        console.log('user disconnected');
        await User.findByIdAndUpdate({_id: userId}, {$set: {is_online: '0'}});
        // User broadcast offline status
        socket.broadcast.emit('getOfflineUser', {user_id: userId});
    })

    socket.on('newChat', function(data) {
        socket.broadcast.emit('loadNewChat', data);
    })

    // Loads old chats
    socket.on('existsChat', async function(data) {
        const chats = await Chat.find({
            $or: [
                {sender_id: data.sender_id, receiver_id: data.receiver_id},
                {sender_id: data.receiver_id, receiver_id: data.sender_id},
            ]
        });

        socket.emit('loadChats', {
            chats: chats
        });
    })

    // delete chats
    socket.on('chatDeleted', function(id) {
        socket.broadcast.emit('chatMessageDeleted', id);
    })
})

http.listen(3000, () => {
    console.log(`Server is running: ${3000}`);
});