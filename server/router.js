const router = require('express').Router();

const {
  mutateConversation,
  deleteConversation,
  getAllConversations
} = require('./utilities/conversationModel');

router.get('/ping', (req, res) => {
  res.send({
    ok: true,
    msg: 'pong'
  });
});

router.get('/info', (req, res) => {
  res.send({
    ok: true,
    author: {
      email: 'phuctranlv@gmail.com',
      name: 'Phuc Tran'
    },
    frontend: {
      url: 'https://demo-for-ava.herokuapp.com/'
    },
    language: 'node.js',
    sources: 'https://github.com/phuctranlv/chatrooms',
    answers: {
      1: 'string, answer to the question 1',
      2: 'string, answer to the question 2',
      3: 'string, answer to the question 3'
    }
  });
});

router.post('/mutations', (req, res) => {
  if (!req.is('application/json') || !req.body.conversationId) {
    res.sendStatus(400);
    return;
  }

  mutateConversation(req.body, undefined, (error, result) => {
    if (error) {
      res.status(201).send({
        msg: `There was an error trying to mutate the conversation. The error is: ${error}`,
        ok: false,
        text: 'no updated text due to error trying to mutate the conversation'
      });
    } else {
      res.status(201).send({
        msg: 'Successfully mutated the conversation',
        ok: true,
        text: result
      });
    }
  });
});

router.get('/conversations', (req, res) => {
  getAllConversations((error, result) => {
    if (error) {
      res.send({
        conversations: [],
        msg: `There was an error while retrieving the conversations. The error is: ${error}`,
        ok: false
      });
    } else {
      res.send({
        conversations: result,
        msg: 'Successfully retrieved all the conversations',
        ok: true
      });
    }
  });
});

router.delete('/conversations', (req, res) => {
  const parameter = req.body.conversationId || req.query.id;
  deleteConversation(parameter, (error, result) => {
    if (error) {
      res.send({
        msg: `There was an error while deleting the conversation. The error is: ${error}`,
        ok: false
      });
    } else {
      res.status(204).send();
    }
  });
});

module.exports = router;
