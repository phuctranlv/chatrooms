const { operationTransform, fullOperationTransform, textTransform } = require('./algorithm');

const { addUser, getUser } = require('./users');

const cassandraDb = require('../../database/index');

const dataObjectTransform = (fromDataSchema, toDataSchema, object, mutationid) => {
  if (fromDataSchema === 'avaPostMutations' && toDataSchema === 'mutationTableSchema') {
    let createdat = new Date().getTime();
    createdat = JSON.stringify(createdat);
    const color = object.author === 'alice' ? 'rgb(0,0,255)' : 'rgb(255,0,0)'; // hard code colors for alice and bob
    const length = object.data.length === undefined ? 'undefined' : object.data.length.toString();
    const text = object.data.text === undefined ? 'undefined' : object.data.text;
    const transformedObject = {
      mutationid,
      color,
      createdat,
      length,
      text,
      id: object.conversationId,
      mutationindex: object.data.index,
      originalice: object.origin.alice,
      originbob: object.origin.bob,
      type: object.data.type,
      username: object.author
    };
    return transformedObject;
  }
  if (fromDataSchema === 'conversationTableSchema' && toDataSchema === 'avaGetConversations') {
    const transformedArray = [];
    for (let i = 0; i < object.length; i += 1) {
      const lastMutationObjectOfTheConversation = JSON.parse(object[i].lastmutationobject);
      let transformedObject;
      if (lastMutationObjectOfTheConversation.data.type === 'insert') {
        transformedObject = {
          author: object[i].author,
          id: object[i].id,
          text: object[i].text,
          lastMutation: {
            author: lastMutationObjectOfTheConversation.author,
            conversationId: lastMutationObjectOfTheConversation.id,
            data: {
              index: lastMutationObjectOfTheConversation.data.index,
              text: lastMutationObjectOfTheConversation.data.text,
              type: lastMutationObjectOfTheConversation.data.type
            },
            origin: {
              alice: parseInt(lastMutationObjectOfTheConversation.origin.alice, 10),
              bob: parseInt(lastMutationObjectOfTheConversation.origin.bob, 10)
            }
          }
        };
      } else {
        transformedObject = {
          author: object[i].author,
          id: object[i].id,
          text: object[i].text,
          lastMutation: {
            author: lastMutationObjectOfTheConversation.author,
            conversationId: lastMutationObjectOfTheConversation.id,
            data: {
              index: lastMutationObjectOfTheConversation.data.index,
              length: parseInt(lastMutationObjectOfTheConversation.data.length, 10),
              text: lastMutationObjectOfTheConversation.data.text,
              type: lastMutationObjectOfTheConversation.data.type
            },
            origin: {
              alice: parseInt(lastMutationObjectOfTheConversation.origin.alice, 10),
              bob: parseInt(lastMutationObjectOfTheConversation.origin.bob, 10)
            }
          }
        };
      }
      transformedArray.push(transformedObject);
    }
    return transformedArray;
  }
};

const insertConversation = (options, username, color, text, cb) => {
  let createdat = new Date().getTime();
  createdat = JSON.stringify(createdat);
  let id;
  if (!options) {
    id = createdat;
  } else if (options.id) {
    id = options.id;
  } else if (options.conversationId) {
    id = options.conversationId;
  }
  const lastmutationid = 0;
  let textForLastMutationObject;
  if (options) {
    textForLastMutationObject = options.text;
  } else {
    textForLastMutationObject = text;
  }
  const lastmutationobject = JSON.stringify({
    author: username,
    id,
    data: {
      index: 0,
      length: 0,
      text: textForLastMutationObject,
      type: 'insert'
    },
    origin: {
      alice: 0,
      bob: 0
    }
  });
  const conversation = {
    username,
    text,
    createdat,
    color,
    id,
    lastmutationid,
    lastmutationobject
  };
  cassandraDb.insertConversation(id, username, text, createdat, color, lastmutationid, lastmutationobject, (error, result) => {
    if (error) cb(error, null);
    if (result) cb(null, conversation);
  });
};

const getAllConversations = (options, cb) => {
  cassandraDb.getAllConversations((error, result) => {
    if (error) cb(error, null);
    if (result) {
      if (!options) return cb(null, result.rows);
      cb(null, dataObjectTransform(options.from, options.to, result.rows));
    }
  });
};

const deleteConversation = (id, cb) => {
  cassandraDb.deleteConversation(id, (error, result) => {
    if (error) cb(error, null);
    if (result) cb(null, result);
  });
};

const insertConversationMutation = (mutationid, infoObject, cb) => {
  let createdat = new Date().getTime();
  createdat = JSON.stringify(createdat);
  const color = infoObject.author === 'alice' ? 'rgb(0,0,255)' : 'rgb(255,0,0)'; // hard code colors for alice and bob
  const length = infoObject.length === undefined ? 'undefined' : infoObject.length;
  const text = infoObject.text === undefined ? 'undefined' : infoObject.text;
  const queryParams = [
    infoObject.id,
    infoObject.username,
    createdat,
    color,
    mutationid,
    infoObject.mutationindex,
    length,
    text,
    infoObject.type,
    infoObject.originalice,
    infoObject.originbob
  ];
  cassandraDb.insertConversationMutation(...queryParams, (error, result) => {
    if (error) cb(error, null);
    if (result) cb(null, result);
  });
};

const updateConversation = (transformedMutationObject, fullText, cb) => {
  deleteConversation(transformedMutationObject.id, (error, result) => {
    if (error) cb(error, null);
    if (result) {
      insertConversation(transformedMutationObject, transformedMutationObject.username, transformedMutationObject.color, fullText, (errorInsert, resultInsert) => {
        if (errorInsert) cb(errorInsert, null);
        if (resultInsert) cb(null, resultInsert);
      });
    }
  });
};

const mutateConversation = (mutateObject, user, cb) => {
  if (!user) {
    addUser('defaultSocketId', mutateObject.author, 'lobby', (error, result) => {
      if (error) console.log(error);
      if (result) user = result;
    });
  }
  cassandraDb.checkConversationExistence(mutateObject.conversationId, (error, result) => {
    if (error) cb(error, null);
    console.log('Finished running cassandraDb.checkConversationExistence. The result is:', result);
    if (result.rows.length === 0 && mutateObject.data.type === 'insert') {
      insertConversation({ conversationId: mutateObject.conversationId }, user.username, user.color, mutateObject.data.text, (errorInsert, resultInsert) => {
        console.log('Finished insertConversation because this post conversationid is new. The result is:', resultInsert);
        if (errorInsert) cb(errorInsert, null);
        if (resultInsert) {
          const newMutationObject = dataObjectTransform('avaPostMutations', 'mutationTableSchema', mutateObject, 0);
          insertConversationMutation(0, newMutationObject, (errorInsertMutation, resultInsertMutation) => {
            console.log('Finished insertConversationMutation for the first time. The result is:', resultInsertMutation);
            if (errorInsertMutation) cb(errorInsertMutation, null);
            if (resultInsertMutation) {
              updateConversation(newMutationObject, mutateObject.data.text, (error, result) => {
                console.log('Finished updateConversation for the first time. The result is:', result);
                if (error) cb(error, null);
                if (result) cb(null, mutateObject.data.text);
              });
            }
          });
        }
      });
    } else {
      const currentText = result.rows[0].text;
      cassandraDb.getAllMutationsOfAConversation(mutateObject.conversationId, (errorGettingAllMutations, resultGettingAllMutations) => {
        console.log('Finished getAllMutationOfAConversation. The result is:', resultGettingAllMutations);
        if (resultGettingAllMutations) {
          const sortedMutationArray = resultGettingAllMutations.rows.sort((a, b) => a.mutationid - b.mutationid);
          const newMutationObject = dataObjectTransform('avaPostMutations', 'mutationTableSchema', mutateObject, sortedMutationArray.length);
          const transformedMutationObject = fullOperationTransform(newMutationObject, sortedMutationArray);
          const transformedText = textTransform(transformedMutationObject, currentText);
          insertConversationMutation(sortedMutationArray.length, transformedMutationObject, (error, result) => {
            if (error) cb(error, null);
            if (result) {
              console.log('Finished insertConversationMutation for the subsequent time. The result is:', result);
              updateConversation(newMutationObject, transformedText, (error, result) => {
                if (error) cb(error, null);
                console.log('Finished updateConversation for the subsequent time. The result is:', result);
                if (result) cb(null, transformedText);
              });
            }
          });
        }
      });
    }
  });
};

module.exports = {
  insertConversation,
  getAllConversations,
  deleteConversation,
  mutateConversation
};
