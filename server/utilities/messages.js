const fullOperationTransform = require('./algorithm.js');

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

const mutateMessage = (mutateObject, room) => {
  let result;
  if (!chats[room][mutateObject.conversationId]) {
    chats[room].push(mutateObject);
    result = chats[room][mutateObject.conversationId].text;
  } else {
    const mutationArray = chats[room][mutateObject.conversationId].mutations;
    const transformedObject = fullOperationTransform(mutateObject, mutationArray);
    if (transformedObject.data.type === 'insert' && transformedObject.data.index < 0) {
      transformedObject.data.index = 0;
      const message = chats[room][mutateObject.conversationId];
      message.text = transformedObject.data.text;
    } else if (transformedObject.data.type === 'delete' && transformedObject.data.index < 0) {
      transformedObject.data.index = 0;
      transformedObject.data.length = 0;
    } else if (transformedObject.data.type === 'insert') {
      const message = chats[room][mutateObject.conversationId];
      message.text = message.text.split('').splice(transformedObject.data.index, 0, transformedObject.data.text).join('');
    } else {
      const message = chats[room][mutateObject.conversationId];
      message.text = message.text.split('').splice(transformedObject.data.index, transformedObject.data.length).join('');
      if (message.text.length === 0) {
        transformedObject.data.index = 0;
        transformedObject.data.length = 0;
      }
    }
    mutationArray.push(transformedObject);
    result = chats[room][mutateObject.conversationId].text;
  }
  return result;
};

const deleteMessage = (conversationId, room) => {
  const conversations = chats[room];
  const index = conversations.find((conversation) => conversation.id === conversationId);
  if (index === -1) {
    return undefined;
  }
  const deletedChat = chats[room].splice(index, 1);
  return deletedChat;


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
  mutateMessage,
  deleteMessage,
  getMessages
};
