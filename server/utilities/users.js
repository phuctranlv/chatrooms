const users = [];

const addUser = ({ socketId, userId, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room are required'
    };
  }

  const existingUsers = users.find((user) => user.room === room && user.username === username);

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
    userId: username + room,
    username,
    room,
    recording: false,
    typing: false,
    color: `rgb(${color.r},${color.g},${color.b})`
  };

  users.push(user);
  return { user };
};

const getUser = (userId) => users.find((user) => user.userId === userId);

const getUserBySocketId = (socketId) => users.find((user) => user.socketId === socketId);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

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
