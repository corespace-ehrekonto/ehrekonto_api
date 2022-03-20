const fs = require('fs');
const path = require('path');

const dataFilter = {}

/**
 * Return the project root directory of the project
 * @returns {String} rootDir
 */
dataFilter.userData = (users) => {
  const dataFilterRaw = fs.readFileSync(path.resolve(__dirname, '../configs/dataFilter.json'));
  const dataFilter = JSON.parse(dataFilterRaw);

  const usersObj = users.map((user) => {
    const userObj = user.toJSON();

    // remote every fild listed in dataFilter->users
    dataFilter.users.forEach((field) => {
      delete userObj[field];
    });

    return userObj;
  });

  return usersObj;
}

module.exports = dataFilter;