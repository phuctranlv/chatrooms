const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { generateMessage, getMessages } = require('./utilities/messages');
const {
  addUser, removeUser, getUser, getUsersInRoom, updateUser
} = require('./utilities/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.USER === 'phuctran' ? 3000 : process.env.PORT || '0.0.0.0';

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../client/public')));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', ({ username, room }, cb) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) return cb(error);

    socket.join(user.room);

    const chatsInRoom = getMessages(user.room);

    socket.emit('welcomeMessage', generateMessage('Admin', user, `Welcome ${user.username}!`), chatsInRoom);

    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', user, `${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    cb();
  });

  socket.on('sendMessage', (message, cb) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', generateMessage(user.username, user, message));

    cb();
  });

  socket.on('recording', (recording) => {
    const user = getUser(socket.id);

    updateUser(user.id, 'recording', recording);

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
  });

  socket.on('typing', (typing) => {
    const user = getUser(socket.id);

    updateUser(user.id, 'typing', typing);

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Admin', user, `${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => console.log(`listening on port ${port}...`));
