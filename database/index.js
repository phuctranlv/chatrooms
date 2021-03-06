const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  contactPoints: [process.env.DATABASE_URL],
  localDataCenter: process.env.LOCAL_DATA_CENTER,
  keyspace: 'collaborativediting'
});

client.connect((error) => {
  if (error) {
    console.log(error);
  }
});

const cassandraDb = {};

cassandraDb.insertConversation = (id, username, text, createdat, color, lastmutationid, lastmutationobject, cb) => {
  const queryParam = [id, username, text, createdat, color, lastmutationid, lastmutationobject];
  const query = 'insert into conversations (id, username, text, createdat, color, lastmutationid, lastmutationobject) values (?, ?, ? ,?, ?, ?, ?)';
  client.execute(query, queryParam, { prepare: true }, (err, result) => {
    if (err) {
      // console.log('error from generating conversation:', err);
      cb(err, null);
    } else {
      // console.log('result from generating conversation:', result);
      cb(null, result);
    }
  });
};

cassandraDb.checkConversationExistence = (id, cb) => {
  const queryParam = [id];
  const query = 'select * from conversations where id = ?;';

  client.execute(query, queryParam, { prepare: true }, (err, result) => {
    if (err) {
      // console.log('error from checking conversation existence:', err);
      cb(err, null);
    } else {
      // console.log('result from checking conversation existence:', result);
      cb(null, result);
    }
  });
};

cassandraDb.insertConversationMutation = (id, username, createdat, color, mutationId, mutationindex, length, text, type, originalice, originbob, cb) => {
  const queryParam = [id, username, createdat, color, mutationId, mutationindex, length, text, type, originalice, originbob];
  const query = 'insert into mutations (id, username, createdat, color, mutationId, mutationindex, length, text, type, originalice, originbob) values (?, ?, ? ,?, ?, ?, ?, ?, ? ,?, ?)';

  client.execute(query, queryParam, { prepare: true }, (err, result) => {
    if (err) {
      // console.log('error from mutating conversation:', err);
      cb(err, null);
    } else {
      // console.log('result from mutating conversation:', result);
      cb(null, result);
    }
  });
};

cassandraDb.getAllMutationsOfAConversation = (id, cb) => {
  const queryParam = [id];
  const query = 'select * from mutations where id = ?;';
  
  client.execute(query, queryParam, { prepare: true }, (err, result) => {
    if (err) {
      // console.log('error from getting all mutations of a conversation:', err);
      cb(err, null);
    } else {
      // console.log('result from getting all mutations of a conversation:', result);
      cb(null, result);
    }
  });
};

cassandraDb.deleteConversation = (id, cb) => {
  const queryParam = [id];
  const query = 'delete from conversations where id = ?;';

  client.execute(query, queryParam, { prepare: true }, (err, result) => {
    if (err) {
      // console.log('error from deleting conversation:', err);
      cb(err, null);
    } else {
      cb(null, result);
      // console.log('result from deleting conversation:', result);
    }
  });
};

cassandraDb.getAllConversations = (cb) => {
  const query = 'select * from conversations;';

  client.execute(query, (err, result) => {
    if (err) {
      // console.log('error from getting all conversations:', err);
      cb(err, null);
    } else {
      // console.log('result from getting all conversations:', result);
      cb(null, result);
    }
  });
};

module.exports = cassandraDb;
