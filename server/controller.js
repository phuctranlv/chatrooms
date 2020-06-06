const {
  mutateConversation,
  deleteConversation,
  getConversations
} = require('./utilities/conversations');

const conversationsController = {};

conversationsController.mutateConversation = (req, res) => {
  mutateConversation(req.body, (error, result) => {
    if (error) {
      res.send({
        msg: `There was an error processing the mutation. The error is: ${error}`,
        ok: false,
        text: ''
      });
    } else {
      res.send({
        msg: 'Successfully process the mutation.',
        ok: true,
        text: result
      });
    }
  });
};

conversationsController.getAllConversations = (req, res) => {
  getConversations('all', (error, result) => {
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
};

conversationsController.deleteConversation = (req, res) => {
  deleteConversation(req.body.id, (error, result) => {
    if (error) {
      res.send({
        msg: `There was an error while deleting the conversation. The error is: ${error}`,
        ok: false
      });
    } else {
      res.send({
        msg: 'Successfully deleted the conversation.',
        ok: true
      });
    }
  });
};

module.exports = conversationsController;
