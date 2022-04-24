const validator = {}
const fs = require('fs');
const path = require('path');

const User = require('../../api/models/users');
const Developer = require('../../api/models/developers');

// check if the password "password" is a common password
const isCommonPassword = (password) => {
  // load common passwords list
  const commonPasswordsRaw = fs.readFileSync(path.join(__dirname, 'common-passwords.json'), 'utf8');
  const commonPasswords = JSON.parse(commonPasswordsRaw);

  for (let i = 0; i < commonPasswords.length; i++) {
    if (password === commonPasswords[i]) {
      return true;
    }
  }
  return false;
}

/**
 * Checking if the password length is matching the given security standards
 * @param {String} password 
 * @returns 
 */
validator.passwordStrength = (password) => {
  let passwordStrength = 0;

  if (!password) { return 0; }

  // for every alphabetical character in the password, add 1 to the passwordStrength
  for (let i = 0; i < password.length; i++) {
    if (password[i].match(/[a-z]/i)) {
      passwordStrength++;
    }
  }

  // for every numerical character in the password, add 1 to the passwordStrength
  for (let i = 0; i < password.length; i++) {
    if (password[i].match(/[0-9]/)) {
      passwordStrength++;
    }
  }

  // for every special character in the password, add 1 to the passwordStrength
  for (let i = 0; i < password.length; i++) {
    if (password[i].match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
      passwordStrength++;
    }
  }

  // check if the password is at least 8 characters long
  if (password.length >= 8) {
    passwordStrength++;
  }

  // check if the password is at least 12 characters long
  if (password.length >= 12) {
    passwordStrength++;
  }

  // check if the password has no repeating characters (e.g. "aaaaaa") or repeating characters in groups of 2 or more (e.g. "abcabc")
  if (password.match(/(.)\1{2,}/g) === null) {
    passwordStrength++;
  }

  if (isCommonPassword(password)) {
    passwordStrength = 0;
  }

  return passwordStrength;
}

/**
 * Validator checking the length of the email address
 * Checking if the email domain ending is allowed
 * checking if the email is valid
 * @param {String} email 
 * @returns 
 */
validator.validateEmail = (email) => {
  const regex = new RegExp('[a-z0-9]+@[a-z]+.[a-z]{2,3}');
  const allowedTopLevelDomains = ['de', 'com', 'net', 'org', 'edu'];

  if (!email) { return false; }

  if (email.length === 0 || email.length < 5 || email.length > 254) {
    return false;
  }

  if (!regex.test(email)) {
    return false;
  }

  // check if the email is from a top level domain that is allowed
  const topLevelDomain = email.split('@')[1].split('.')[1];
  if (allowedTopLevelDomains.indexOf(topLevelDomain) === -1) {
    return false;
  }

  return true;
}

/**
 * Checking if the username contains any invalid characters
 * @param {String} username 
 * @returns 
 */
validator.validateUsername = (username) => {
  const forbiddenCharacters = [
    '<', '>', ':', '"', '/', '\\', '|', '?', '*', '.', ' ', '\t', '\n', '\r', '\f', '\v', '\0',
    '{', '}', '[', ']', ';', '=', '+', '&', '%', '$', '#', '@', '!', '~', '`', '^', '\'', ','];

  if (!username) { return false; }
  if (username === undefined) { return false; }

  // check if the username contains any forbiddenCharacter
  for (let i = 0; i < forbiddenCharacters.length; i++) {
    if (username.includes(forbiddenCharacters[i])) {
      console.log('Forbidden character detected: ' + forbiddenCharacters[i]);
      return false;
    }
  }

  return true;
}

validator.existsEmail = (email) => {
  // check if the email exists in the database
  return new Promise((resolve, reject) => {
    User.findOne({ email: email }, (err, user) => {
      if (err) {
        reject(err);
      }
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

validator.existsUsername = (username) => {
  return new Promise((resolve, reject) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        reject(err);
      }
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

validator.checkUUid = (uuid) => {
  return new Promise((resolve, reject) => {
    User.findOne({ _id: uuid }, (err, user) => {
      if (err) {
        reject(err);
      }
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

validator.checkForDeveloper = (uuid) => {
  return new Promise((resolve, reject) => {
    Developer.findOne({ uuid: uuid }, (err, developer) => {
      if (err) {
        reject(err);
      }
      if (developer === true || developer !== null) {
        resolve(developer);
      } else {
        resolve(developer);
      }
    });
  });
}

module.exports = validator;