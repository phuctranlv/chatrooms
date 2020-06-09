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
      1: `I approached and solved the problem iteratively since there are quite a feel pieces associated with a full-stack problem.
      First, I try to identify the application's requirements/features and a (small) list of associated sub-requirements. Once I have the requirements, I list the technologies that I can use to satisfy those requirements and choose which one to use based on other constraints at hand (time, purpose, usability, etc.). I then design the data schema since the structure of the application could heavily be influent by how the data is consumed/created throughout the stacks.
      Once I have the technologies and the data schema set up, I start building the app iteratively, beginning with a basic back-end server and a simple front-end frame. I then start adding features, one by one, by implementing the design of the front end and then building the back-end to support that feature.
      In short, I approached this problem as if I was building a house: identify the requirements, then pick the tools, then build the foundation, then add the frame, then patch the frame up with features, then decorate :)`,
      2: 'If I had more time, I would refactor the code and extract the repeated code to make it more readable as well as scalable. I would also try to refactor the design of the application to make it less complicated. Also, I would write tests in support of continuous integration.',
      3: `I would make some slight modifications to the endpoint requests/response information. There was some conflict between the request's data structure and the response's data structure. It added a layer of difficulty that I didn't catch until I try to connect things. Data wrangling is a good challenge, but given the time constraint, it might make more sense to help the candidate focus more on demonstrating the ability to build the full-stack application.
      I would also add a trackable list of requirements for each stack and enforce the candidate to check things off as they complete it. Again, due to the complexity of the full stack, this would help them focus more on building the app and being more organized.`
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
  getAllConversations({ from: 'conversationTableSchema', to: 'avaGetConversations' }, (error, result) => {
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
