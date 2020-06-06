const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { generateConversation, getConversations } = require('./utilities/conversations');
const {
  addUser, getUser, getUsersInRoom, updateUser, removeUser
} = require('./utilities/users');
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.USER === 'phuctran' ? 3000 : process.env.PORT || '0.0.0.0';

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../client/public')));
app.use(router);


io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', ({ username, room }, cb) => {
    const { error, user } = addUser({ socketId: socket.id, username, room });

    if (error) return cb(error);

    socket.join(user.room);

    const chatsInRoom = getConversations(user.room);

    socket.emit('welcomeMessage', generateConversation('Admin', user, `Welcome ${user.username}!`), chatsInRoom);

    socket.broadcast.to(user.room).emit('conversation', generateConversation('Admin', user, `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    cb();
  });

  socket.on('sendConversation', ({ username, text }, cb) => {
    const user = getUser(username);
    if (!user) return;

    io.to(user.room).emit('conversation', generateConversation(username, user, text));

    cb();
  });

  socket.on('recording', ({ username, recording }) => {
    const user = getUser(username);
    if (!user) return;

    updateUser(username, 'recording', recording);

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
  });

  socket.on('typing', ({ username, typing }) => {
    const user = getUser(username);
    if (!user) return;

    updateUser(username, 'typing', typing);

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('conversation', generateConversation('Admin', user, `${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => console.log(`listening on port ${port}...`));
