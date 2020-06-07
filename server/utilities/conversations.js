const fullOperationTransform = require('./algorithm.js');

const {
  addUser,
  getUser,
  getUsersInRoom,
  updateUser
} = require('./users');

const chats = {};

const generateConversation = (username, user, text, cb) => {
  let createdAt = new Date().getTime();
  createdAt = JSON.stringify(createdAt);
  const conversation = {
    username,
    text,
    createdAt,
    color: user.color,
    id: `${username}${createdAt}`,
    mutations: [],
    lastMutation: {}
  };

  const { room } = user;

  if (!chats[room]) {
    chats[room] = [];
    if (username !== 'Admin') {
      chats[room].push(conversation);
    }
  } else if (username !== 'Admin') {
    chats[room].push(conversation);
  }
  return conversation;
};

const getConversations = (room, cb) => {
  if (chats[room]) {
    return chats[room];
  } if (room === 'all') {
    const chatRooms = Object.values(chats);
    const conversations = [];
    for (let i = 0; i < chatRooms.length; i += 1) {
      conversations.push(...chatRooms[i]);
    }
    cb(null, conversations);
  }
  return [];
};

module.exports = {
  generateConversation,
  getConversations
};
