const users = {};

const addUser = ({ socketId, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room are required'
    };
  }

  const existingUsers = users[username];

  if (existingUsers) {
    return ({
      error: 'Username for this room is already in used!'
    });
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

  users[username] = (user);
  return { user };
};

const getUser = (username) => users[username];

const getUsersInRoom = (room) => (
  Object.values(users).filter((user) => user.room === room)
);

const updateUser = (username, activity, status) => {
  const user = getUser(username);
  user[activity] = status;
};

const removeUser = (socketId) => {
  let username;
  const user = Object.values(users).find((userInRoom) => {
    if (userInRoom.socketId === socketId) {
      username = userInRoom.username;
      return true;
    }
    return false;
  });
  if (username) delete users[username];
  return user;
};

module.exports = {
  addUser,
  getUser,
  getUsersInRoom,
  updateUser,
  removeUser
};
