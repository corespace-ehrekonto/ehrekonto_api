const fs = require('fs');
const path = require('path');

const projectRoot = {}

projectRoot.getDir = () => {
  // return the project root directory path for the current project
  return path.join(__dirname, '../../../');
}

module.exports = projectRoot;