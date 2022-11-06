const express = require('express');
const path = require('path');
const webrtc = require("wrtc");
const visionSystem = require('./visionSystem');

const server = express();

const colorSettings = new Set(['red', 'green', 'blue', 'yellow']);
const shapeSettings = new Set(['pentagon', 'square', 'hexagon', 'heptagon', 'octagon', 'triangle']);

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, '../Arm-GUI/build')));

// should be synced with vision system on startup
const currentSettings = {
    color: 'red',
    shape: 'triangle',
}

// To-Do: send current settings
server.get('/api/current-settings', (req, res) => {
    res.status(200).json(currentSettings);
});


server.post('/api/arm-left', async (req, res) => {

    if (!req.body.units) {
        res.status(400).json({'error': 'must specify units'});
        return;
    }

    await visionSystem.moveLeft(req.body.units);

    res.status(201).json({'error': false})
});

server.post('/api/arm-right', async (req, res) => {

    if (!req.body.units) {
        res.status(400).json({'error': 'must specify units'});
        return;
    }

    await visionSystem.moveRight(req.body.units);

    res.status(201).json({'error': false})
});

server.post('/api/arm-down', async (req, res) => {

    if (!req.body.units) {
        res.status(400).json({'error': 'must specify units'});
        return;
    }

    await visionSystem.moveDown(req.body.units);

    res.status(201).json({'error': false})
});

server.post('/api/arm-up', async (req, res) => {

    if (!req.body.units) {
        res.status(400).json({'error': 'must specify units'});
        return;
    }

    await visionSystem.moveUp(req.body.units);

    res.status(201).json({'error': false})
});

server.post('/api/change-settings', (req, res) => {
    const newSettings = req.body;
    console.log('Recieved settings', newSettings);

    if (!newSettings || !newSettings.color || !newSettings.shape) {
        res.status(400).json({error: 'must have color and shape in request'});
        return;
    }

    if (!colorSettings.has(newSettings.color) || !shapeSettings.has(newSettings.shape)) {
        res.status(400).json({error: 'not a valid color of shape setting'});
        return;
    }

    // TO-DO send request to vision system with new settings
    res.status(200).json({'error': false});
});


// this keeps track of the video stream from the vision system
let visionSystemStream = null;

// example broadcast with webRTC
// https://github.com/coding-with-chaim/webrtc-one-to-many/blob/master/server.js#L32
// To-Do add more error checking dont trust that everything is working right
server.post('/api/vision-system', async (req, res) => {

    console.log('request to be the be the streamer');

    if (!req.body.sdp) {
        res.status(400).json({'error': true});
        return;
    }

    const peer = new webrtc.RTCPeerConnection({
        iceServers: [{ urls: ["turn:54.89.171.143?transport=tcp"] }]
    });

    peer.ontrack = function(track) {
        visionSystemStream = track.streams[0];
    }

    try {
        const description = new webrtc.RTCSessionDescription(req.body.sdp);

        await peer.setRemoteDescription(description);
    }
    catch (e) {
        console.log('Error setting description: ', e)
    }

    const answer = await peer.createAnswer();

    await peer.setLocalDescription(answer);

    console.log('request to be streamer success');

    res.status(200).json({ sdp: peer.localDescription });
});


// example listener with webRTC
// https://github.com/coding-with-chaim/webrtc-one-to-many/blob/master/server.js#L12
// To-Do add more error checking dont trust that everything is working right
server.post('/api/stream-video', async (req, res) => {

    console.log('request to stream video');

    if (!req.body.sdp) {
        res.status(400).json({'error': true});
        return;
    }

    if (visionSystemStream == null) {
        res.status(500).json({'error': true});
        return;
    }

    const peer = new webrtc.RTCPeerConnection({
        iceServers: [{ urls: ["turn:54.89.171.143?transport=tcp"] }]
    });

    try {
        const desciption = new webrtc.RTCSessionDescription(req.body.sdp);

        await peer.setRemoteDescription(desciption);
    }
    catch (e) {
        console.log('Error setting remote description: ', e)
    }

    visionSystemStream.getTracks().forEach(track => peer.addTrack(track, visionSystemStream));

    const answer = await peer.createAnswer();

    await peer.setLocalDescription(answer);

    console.log('request to stream success');

    res.status(200).json({ sdp: peer.localDescription });
});

module.exports = server;