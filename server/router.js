const router = require('express').Router();

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
      url: 'string, the url of your frontend.'
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
  res.send();
});

router.get('/conversations', (req, res) => {
  res.send({
    conversations: [
      {
        id: 'string',
        lastMutation: 'Object, The last mutation applyed on this conversation',
        text: 'string'
      },
      '...'
    ],
    msg: 'string, an error message, if needed',
    ok: 'boolean'
  });
});

router.delete('/conversations', (req, res) => {
  res.send();
});

module.exports = router;
