const bcrypt = require('bcrypt');

const passCrypt = {};

/**
 * Encrypting the password with bcrypt and a salt of 11
 * @param {String} password 
 * @returns {String} hash
 */
passCrypt.encrypt = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(11), null);
}

/**
 * Checking if the password is matching the given hash
 * @param {String} password 
 * @param {String} hash 
 * @returns 
 */
passCrypt.decrypt = (password, hash) => {
  return bcrypt.compareSync(password, hash);
}

module.exports = passCrypt;