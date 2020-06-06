const fullOperationTransform = require('./algorithm.js');

const {
  addUser,
  getUser,
  getUsersInRoom,
  updateUser
} = require('./users');

const chats = {};

const generateConversation = (username, user, text, cb) => {
  const createdAt = new Date().getTime();
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

const mutateConversation = (mutateObject, room, cb) => {

  const username = mutateObject.author;
  const { user } = addUser({ socketId: 'defaultSocket', username, room });
  console.log(chats)
  console.log(Object.keys(chats).findIndex((rm) => {
    console.log('rm:', rm);
    console.log('room:', room)
    return rm === room
  }))
  if (Object.keys(chats).findIndex((rm) => rm === room) === -1) {
    if (mutateObject.data.type === 'insert') {
      const result = generateConversation(username, username, user, mutateObject.data.text);
      cb(null, {
        msg: "This mutation is considered a new conversation because there is no prior conversation with this conversationId",
        ok: true,
        text: result.text
      });
    }
  } else {
    const mutationArray = chats[room][mutateObject.conversationId].mutations;
    const transformedObject = fullOperationTransform(mutateObject, mutationArray);
    if (transformedObject.data.type === 'insert' && transformedObject.data.index < 0) {
      transformedObject.data.index = 0;
      const conversation = chats[room][mutateObject.conversationId];
      conversation.text = transformedObject.data.text;
    } else if (transformedObject.data.type === 'delete' && transformedObject.data.index < 0) {
      transformedObject.data.index = 0;
      transformedObject.data.length = 0;
    } else if (transformedObject.data.type === 'insert') {
      const conversation = chats[room][mutateObject.conversationId];
      conversation.text = conversation.text.split('').splice(transformedObject.data.index, 0, transformedObject.data.text).join('');
    } else {
      const conversation = chats[room][mutateObject.conversationId];
      conversation.text = conversation.text.split('').splice(transformedObject.data.index, transformedObject.data.length).join('');
      if (conversation.text.length === 0) {
        transformedObject.data.index = 0;
        transformedObject.data.length = 0;
      }
    }
    mutationArray.push(transformedObject);
    result = chats[room][mutateObject.conversationId].text;
  }
};

const deleteConversation = (conversationId, cb) => {

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
  mutateConversation,
  deleteConversation,
  getConversations
};
