const dataHandler = {}
const User = require('../../api/models/users');

dataHandler.getUUID = async (username) => {
  let user = await User.findOne({ username: username });
  return user.uuid;
}

module.exports = dataRequster;