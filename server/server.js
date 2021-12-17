const http = require('http');
const dotenv = require('dotenv');

// Import server modules
const app = require('./app');
dotenv.config();

// Load server configuration
const port = process.env.PORT || 3000;

// create server
const server = http.createServer(app);
server.listen(port);