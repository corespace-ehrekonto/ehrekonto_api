const fs = require('fs');
const path = require('path');

const routePaths = require('./assets/utils/getRoutePaths');
const projectRoot = require('./assets/utils/getProjectRoot');

// var init
const rootPath = `${projectRoot.getDir()}/server/`;


const apiRoutes = routePaths.getAllRoutes(rootPath);
const apiRouteKeys = Object.keys(apiRoutes)

apiRouteKeys.forEach(key => {
  const subRoutes = apiRoutes[key];
  subRoutes.forEach(route => {
    console.log(`Route ${key}->${route} was loaded`);
  })
});

// console.log(apiRoutes);