const chats = {};

const generateMessage = (username, user, text) => {
  const createdAt = new Date().getTime();
  const message = {
    username,
    text,
    createdAt,
    color: user.color,
    conversationId: user.userId + createdAt,
    mutations: []
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
