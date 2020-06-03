const generateMessage = (username, user, text) => ({
  username,
  text,
  createdAt: new Date().getTime(),
  color: user.color
});

module.exports = {
  generateMessage
};
