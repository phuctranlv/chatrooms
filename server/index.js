const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const { insertConversation, getAllConversations } = require('./utilities/conversationModel');
const {
  addUser, getUser, getUsersInRoom, updateUser, removeUser
} = require('./utilities/users');
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.USER === 'phuctran' ? 3000 : process.env.PORT || '0.0.0.0';

app.use(cors({
  origin: 'https://app.ava.me'
}));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, '../client/public')));
app.use(router);


io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', ({ username, room }, cb) => {
    addUser(socket.id, username, room, (error, user) => {
      if (error) return cb(error);
      if (user) {
        cb();
        socket.join(user.room);

        getAllConversations(null, (getAllConversationsError, getAllConversationsResult) => {
          if (getAllConversationsResult) {
            const conversation = {
              username: 'Admin',
              text: `Welcome ${user.username}!`,
              createdat: new Date().getTime(),
              color: user.color,
              id: `${username}${this.createdat}`
            };
            socket.emit('welcomeMessage', conversation, getAllConversationsResult);
          }
        });

        const conversation = {
          username: 'Admin',
          text: `${user.username} has joined!`,
          createdat: new Date().getTime(),
          color: user.color,
          id: `${username}${this.createdat}`
        };

        socket.broadcast.to(user.room).emit('conversation', conversation);

        io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room)
        });
      }
    });
  });

  socket.on('sendConversation', ({ username, text }, cb) => {
    const user = getUser(username);
    if (!user) return;

    insertConversation(null, username, user.color, text, (error, resultFromInsertConversation) => {
      if (resultFromInsertConversation) {
        io.to(user.room).emit('conversation', resultFromInsertConversation);
      }
    });
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
      const conversation = {
        username: 'Admin',
        text: `${user.username} has left!`,
        createdat: new Date().getTime(),
        color: user.color,
        id: `${user.username}${this.createdat}`,
      };

      io.to(user.room).emit('conversation', conversation);
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

server.listen(port, () => console.log(`listening on port ${port}...`));
