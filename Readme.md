# Installing the backend of Arm-GUI

## Pre prerequisite: Nodejs and openssl installed

### 1) Clone the repo `Git clone https://github.com/ED1-Group-11/Arm-GUI-Backend` into a folder next to the Arm-GUI, ie: same parent folder for both

### 2) Create ssl certificate by running `source makeCert.sh` or if on windows run `openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 3650 -nodes -subj "/C=US/CN=localhost"`

### 3) Start the server `npm run start`
