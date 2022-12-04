const fs = require('fs');
const https = require('https');
const server = require('./routes');

const PORT = process.env.NODE_ENV === 'production' ? 443 : 8080;

const options = {};

try {
    const key = fs.readFileSync('key.pem');
    const cert = fs.readFileSync('cert.pem');
    options.key = key;
    options.cert = cert;
}
catch(e) {
    console.error("Unable to find key.pem or cert.pem");
    console.error("Make sure they exist");
    process.exit(-1);
}

let visionSystemSocket = null;

// should be synced with vision system on startup
const currentSettings = {
    color: 'red',
    shape: 'triangle',
}

const colorSettings = new Set(['red', 'green', 'blue', 'yellow']);
const shapeSettings = new Set(['pentagon', 'square', 'hexagon', 'heptagon', 'octagon', 'triangle']);

server.get('/api/current-settings', (req, res) => {
    res.status(200).json(currentSettings);
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

    if (visionSystemSocket == null) {
        console.log('Connection is null betwen vision system cannot send');
        res.status(500).json({error: 'no connect'});
        return;
    }

    const newSetting = `color ${newSettings.color} shape ${newSettings.shape}`;
    visionSystemSocket.emit('change_settings', newSetting);

    // TO-DO send request to vision system with new settings
    res.status(200).json({'error': false});
});

server.post('/api/arm-left', async (req, res) => {
    if (!req.body.units) {
        res.status(400).json({'error': 'must specify units'});
        return;
    }

    if (visionSystemSocket == null) {
        console.log('Manual move without connection to vision');
        res.status(500).json({'error': 'no connet'});
        return;
    }

    visionSystemSocket.emit('left', req.body.units);

    res.status(201).json({'error': false})
});

server.post('/api/arm-right', async (req, res) => {
    if (!req.body.units) {
        res.status(400).json({'error': 'must specify units'});
        return;
    }

    if (visionSystemSocket == null) {
        console.log('Manual move without connection to vision');
        res.status(500).json({'error': 'no connet'});
        return;
    }

    visionSystemSocket.emit('right', req.body.units);

    res.status(201).json({'error': false})
});

server.post('/api/arm-down', async (req, res) => {
    if (req.body?.units == null) {
        res.status(400).json({'error': 'must specify units'});
        return;
    }

    if (visionSystemSocket == null) {
        console.log('Manual move without connection to vision');
        res.status(500).json({'error': 'no connet'});
        return;
    }

    visionSystemSocket.emit('down', req.body.units);

    res.status(201).json({'error': false})
});

server.post('/api/arm-up', async (req, res) => {
    if (!req.body.units) {
        res.status(400).json({'error': 'must specify units'});
        return;
    }

    if (visionSystemSocket == null) {
        console.log('Manual move without connection to vision');
        res.status(500).json({'error': 'no connet'});
        return;
    }

    visionSystemSocket.emit('up', req.body.units);

    res.status(201).json({'error': false})
});

let httpsServer = https.createServer(options, server).listen(PORT, () => {
    console.log(`Arm GUI backend started on port ${PORT}`);
});

const io = require('socket.io')(httpsServer);

io.on('connection', async socket => {
    visionSystemSocket = socket;

    new Promise((resolve, reject) => setTimeout(resolve, 2500)).then(() => {
        visionSystemSocket.emit('up', 1);
        visionSystemSocket.emit('down', 2);
        visionSystemSocket.emit('right', 3);
        visionSystemSocket.emit('left', 4);

        const newSetting = "color red shape square";
        visionSystemSocket.emit('change_settings', newSetting);
        console.log("DONE")
    });

    socket.on('ok', data => {
        console.log('response OK: ', data)
    });
});
