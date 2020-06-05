const users = {};

const addUser = ({ socketId, userId, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room are required'
    };
  }

  const existingUsers = users[userId];

  if (existingUsers !== undefined) {
    existingUsers.socketId = socketId;
    return { user: existingUsers };
  }

  const color = {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256)
  };

  const user = {
    socketId,
    username,
    room,
    recording: false,
    typing: false,
    color: `rgb(${color.r},${color.g},${color.b})`
  };

  users[userId] = (user);
  return { user };
};

const getUser = (userId) => users[userId];

const getUserBySocketId = (socketId) => (
  Object.values(users).find((user) => user.socketId === socketId)
);

const getUsersInRoom = (room) => (
  Object.values(users).filter((user) => user.room === room)
);

const updateUser = (userId, activity, status) => {
  const user = getUser(userId);
  user[activity] = status;
};

module.exports = {
  getUserBySocketId,
  addUser,
  getUser,
  getUsersInRoom,
  updateUser
};
