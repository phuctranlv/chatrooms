const chats = {};

const generateMessage = (username, userId, user, text) => {
  const createdAt = new Date().getTime();
  const message = {
    username,
    text,
    createdAt,
    color: user.color,
    id: `${userId}${createdAt}`,
    mutations: [],
    lastMutation: {}
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
  } if (room === 'all') {
    const chatRooms = Object.values(chats);
    const conversations = [];
    for (let i = 0; i < chatRooms.length; i += 1) {
      conversations.push(...chatRooms[i]);
    }
    return conversations;
  }
  return [];
};

module.exports = {
  generateMessage,
  getMessages
};
