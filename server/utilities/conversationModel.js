const { operationTransform, fullOperationTransform } = require('./algorithm');

const { addUser } = require('./users');

const cassandraDb = require('../../database/index');

const insertConversation = (username, user, text, cb) => {
  let createdAt = new Date().getTime();
  createdAt = JSON.stringify(createdAt);
  const id = `${username}${createdAt}`;
  const { color } = user;
  const lastmutationid = 0;
  const lastmutationobject = JSON.stringify({
    author: username,
    conversationId: id,
    data: {
      index: 0,
      length: 0,
      text,
      type: "insert"
    },
    origin: {
      alice: 0,
      bob: 0
    }
  });

  const conversation = {
    username,
    text,
    createdAt,
    color,
    id,
    lastmutationid,
    lastmutationobject
  };

  cassandraDb.insertConversation(id, username, text, createdAt, color, lastmutationid, lastmutationobject, (error, result) => {
    if (result) cb(null, conversation);
  });
};

const getAllConversations = (cb) => {
  cassandraDb.getAllConversations((error, result) => {
    if (result) cb(null, result);
  });
};

// const deleteConversation = (id, cb) => {
//   cassandraDb.deleteConversation(id, (error, result) => {
//     if (error) cb(error, null);
//     if (result) cb(null, result);
//   });
// };

// const getAllMutationsOfAConversation = (id, cb) => {
//   cassandraDb.getAllMutationsOfAConversation(id, (error, result) => {
//     if (error) cb(error, null);
//     if (result) cb(null, result);
//   });
// };

// const mutateConversation = (mutateObject, user, cb) => {
//   user = user || addUser({ socketId: 'defaultSocketId', username: mutateObject.author, room: 'lobby' });

//   cassandraDb.checkConversationExistence(mutateObject.conversationId, (error, result) => {

//     if (error) return cb(error, null);

//     if (!result) {
//       if (mutateObject.data.type === 'insert') {
//         insertConversation(user.username, user, mutateObject.data.text)
//           .then((conversation) => conversation.text)
//           .catch((error) => error);
//       }
//     } else {
//       const currentText = result[0].text;
//       const mutateObjectMutationId = mutateObject.origin.alice + mutateObject.origin.bob;

//       let transformedMutationObject;
//       let insertQueryArguments;

//       if (mutateObjectMutationId === result[0].lastmutationid) {
//         transformedMutationObject = operationTransform(mutateObject, JSON.parse(result[0].lastmutationobject));

//         insertQueryArguments = {
//           id: transformedMutationObject.conversationId,
//           username: user.username,
//           createdat: new Date().getTime(),
//           color: user.color,
//           mutationid: result[0].lastmutationid + 1,
//           mutationindex: transformedMutationObject.data.index,
//           length: transformedMutationObject.data.length,
//           text: transformedMutationObject.data.text,
//           type: transformedMutationObject.data.type,
//           originalice: transformedMutationObject.origin.alice,
//           originbob: transformedMutationObject.origin.bob
//         };


//       } else if (mutateObjectMutationId < result[0].lastmutationid) {


//       }





//       cassandraDb.insertConversationMutation({ insertQueryArguments })
//         .then(() => {

//         })
//         .catch((error) => error);


//     }
//   })
// };





// // test:
// const username = 'bob dylan';
// const user = {
//   socketId: 'defaultSocket',
//   username: 'bob dylan',
//   room: 'lobby',
//   recording: false,
//   typing: false,
//   color: `rgb(color, color, color)`
// };
// const text = 'some text';

module.exports = {
  insertConversation,
  getAllConversations
};
