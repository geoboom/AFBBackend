const express = require('express');

const app = express();
const server = require('http').createServer(app);

const router = require('./routes');
const PORT = 3000;

app.use(express.json());

app.use('/api', router);

server.listen(PORT);
console.log(`AFBBackend listening on port ${PORT}`);

