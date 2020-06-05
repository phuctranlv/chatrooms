const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: 'Username and room are required'
    };
  }

  const existingUsers = users.find((user) => user.room === room && user.username === username);

  if (existingUsers !== undefined) {
    existingUsers.id = id;
    return { user: existingUsers };
  }

  const color = {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256)
  };

  const user = {
    id,
    username,
    room,
    recording: false,
    typing: false,
    color: `rgb(${color.r},${color.g},${color.b})`
  };

  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
  return undefined;
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const updateUser = (id, activity, status) => {
  const user = getUser(id);
  user[activity] = status;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  updateUser
};
