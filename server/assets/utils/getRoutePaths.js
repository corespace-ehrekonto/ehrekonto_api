const routePaths = {}

const path = require('path');
const fs = require('fs');

routePaths.getAllRoutes = (rootPath) => {
  if (!rootPath) { console.log("Error: path is required"); return; }
  const apiRoutes = path.join(rootPath, 'api/routes');

  let routeTree = {}

  const routes = fs.readdirSync(apiRoutes);
  routes.forEach(route => {
    if (route.includes('.js')) { return; }
    const masterRoutes = route;

    const subRoutePath = path.join(rootPath, 'api/routes/', `${masterRoutes}/`);
    const subRoutes = fs.readdirSync(subRoutePath);

    routeTree[masterRoutes] = subRoutes;
  });

  return routeTree;
}

module.exports = routePaths;