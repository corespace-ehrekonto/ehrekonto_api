const bcrypt = require('bcrypt');

const passCrypt = {};

passCrypt.encrypt = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(11), null);
}

passCrypt.decrypt = (password, hash) => {
  return bcrypt.compareSync(password, hash);
}

module.exports = passCrypt;