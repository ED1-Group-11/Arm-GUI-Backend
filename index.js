const fs = require('fs');
const https = require('https');
const server = require('./routes');

const PORT = 8080;

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

https.createServer(options, server).listen(PORT, () => {
    console.log(`Arm GUI backend started on port ${PORT}`);
});
