const moment = require('moment');

const chats = {};

const generateMessage = (username, user, text) => {
  const message = {
    username,
    message: text,
    createdAt: moment(new Date().getTime()).format('h:mm a'),
    color: user.color
  };

  const { room } = user;
  if (!chats[room]) {
    chats[room] = [];
  } else if (username !== 'Admin') {
    chats[room].push(message);
  }

  return message;
};

const getMessages = (room) => {
  if (chats[room]) {
    return chats[room];
  }
  return [];
};

module.exports = {
  generateMessage,
  getMessages
};
