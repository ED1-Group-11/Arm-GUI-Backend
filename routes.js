const express = require('express');
const path = require('path');

const server = express();

server.use(express.static(path.join(__dirname, '../Arm-GUI/build')));

server.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Arm-GUI/build/index.html'))
    .status(200);
});

module.exports = server;