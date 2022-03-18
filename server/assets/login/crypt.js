const bcrypt = require('bcrypt');

const crypt = {};

/**
 * Encrypting the password with bcrypt and a salt of 11
 * @param {String} password 
 * @returns {String} hash
 */
crypt.encrypt = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(11), null);
}

/**
 * Checking if the password is matching the given hash
 * @param {String} password 
 * @param {String} hash 
 * @returns 
 */
crypt.compare = (password, hash) => {
  return bcrypt.compareSync(password, hash);
}

crypt.generateRandomHash = () => {
  return bcrypt.hashSync(Math.random().toString(), bcrypt.genSaltSync(11), null);
}

// crypt.generateApiKey = () => {
//   const randomHash = crypt.generateRandomHash();
//   const HashMap = randomHash.split('');


//   5 8 6 1 9
//   // // create new string with parts of the HashMap
//   // let newHash = '';
//   // for (let i = 0; i < HashMap.length; i++) {
//   //   if (i % 2 === 0) {
//   //     newHash += HashMap[i];
//   //   }
//   // }

//   return HashMap;
// }

module.exports = crypt;