const dataHandler = {}
const User = require('../../api/models/users');

dataHandler.getUUID = async (username) => {
  let user = await User.findOne({ username: username });
  return user.uuid;
}

dataHandler.getLastLogin = async (user) => {
  const timestamp = user.lastLogin;
  return timestamp;
}

module.exports = dataHandler;