const router = require('express').Router();

const {
  mutateConversation,
  getAllConversations,
  deleteConversation
} = require('./controller');

router.post('/mutations', mutateConversation);
router.get('/conversations', getAllConversations);
router.delete('/conversations', deleteConversation);

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

module.exports = router;
