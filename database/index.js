const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  keyspace: 'collaborativediting'
});

client.connect((error) => {
  if (error) {
    console.log(error);
  }
});

const cassandraDb = {};

cassandraDb.generateConversation = (id, username, text, createdat, color, lastmutationid) => {
  const queryParam = [id, username, text, createdat, color, lastmutationid];
  const query = 'insert into conversations (id, username, text, createdat, color, lastmutationid) values (?, ?, ? ,?, ?, ?)';

  return new Promise((resolve, reject) => {
    client.execute(query, queryParam, { prepare: true }, (err, result) => {
      if (err) {
        console.log('error from generating conversation:', err);
        return reject(err);
      }
      console.log('result from generating conversation:', result);
      resolve(result);
    });
  });
};

cassandraDb.checkConversationExistence = (id) => {
  const queryParam = [id];
  const query = 'select * from conversations where id = ?;';

  return new Promise((resolve, reject) => {
    client.execute(query, queryParam, { prepare: true }, (err, result) => {
      if (err) {
        console.log('error from checking conversation existence:', err);
        return reject(err);
      }
      console.log('result from checking conversation existence:', result);
      resolve(result);
    });
  });
};

cassandraDb.insertConversationMutation = (id, username, createdat, color, mutationid, mutationindex, length, text, type, originalice, originbob) => {
  const queryParam = [id, username, createdat, color, mutationid, mutationindex, length, text, type, originalice, originbob];
  const query = 'insert into mutations (id, username, createdat, color, mutationid, mutationindex, length, text, type, originalice, originbob) values (?, ?, ? ,?, ?, ?, ?, ?, ? ,?, ?)';

  return new Promise((resolve, reject) => {
    client.execute(query, queryParam, { prepare: true }, (err, result) => {
      if (err) {
        console.log('error from mutating conversation:', err);
        return reject(err);
      }
      console.log('result from mutating conversation:', result);
      resolve(result);
    });
  });
};

cassandraDb.getAllMutationsOfAConversation = (id) => {
  const queryParam = [id];
  const query = 'select * from mutations where id = ?;';

  return new Promise((resolve, reject) => {
    client.execute(query, queryParam, { prepare: true }, (err, result) => {
      if (err) {
        console.log('error from getting all mutations of a conversation:', err);
        return reject(err);
      }
      console.log('result from getting all mutations of a conversation:', result);
      resolve(result);
    });
  });
};

cassandraDb.deleteConversation = (id) => {
  const queryParam = [id];
  const query = 'delete from conversations where id = ?;';

  return new Promise((resolve, reject) => {
    client.execute(query, queryParam, { prepare: true }, (err, result) => {
      if (err) {
        console.log('error from deleting conversation:', err);
        return reject(err);
      }
      resolve(result);
      console.log('result from deleting conversation:', result);
    });
  });
};

cassandraDb.getAllConversations = () => {
  const query = 'select * from conversations;';

  return new Promise((resolve, reject) => {
    client.execute(query, (err, result) => {
      if (err) {
        console.log('error from getting all conversations:', err);
        return reject(err);
      }
      console.log('result from getting all conversations:', result);
      resolve(result);
    });
  });
};

const id = 'phuctranlv1234';
const username = 'phuctranlv';
const text = 'test test test';
const createdat = '1234';
const color = 'rbg(somenumber,somenumber,somenumber)';
const lastmutationid = 3;
const mutationid = 4;
const mutationindex = 5;
const length = '4';
const type = 'delete';
const originalice = 4;
const originbob = 3;

cassandraDb.generateConversation(id, username, text, createdat, color, lastmutationid);
cassandraDb.getAllConversations();
// cassandraDb.deleteConversation(id);
cassandraDb.checkConversationExistence('3');
cassandraDb.insertConversationMutation(id, username, createdat, color, mutationid, mutationindex, length, text, type, originalice, originbob);
cassandraDb.getAllMutationsOfAConversation(id);

module.exports = { cassandraDb };
