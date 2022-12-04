const express = require('express');
const path = require('path');
const webrtc = require("wrtc");
const visionSystem = require('./visionSystem');

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, '../Arm-GUI/build')));


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
        iceServers: [{ urls: ["turn:54.89.171.143?transport=tcp"], username: 'user', credential: 'user',}]
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
        iceServers: [{ urls: ["turn:54.89.171.143?transport=tcp"], username: 'user', credential: 'user',}]
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

server.get('*', (req, res) => {
    console.log(req);

    res.status(404).send('Hello World');
});

module.exports = server;