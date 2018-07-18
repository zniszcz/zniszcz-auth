const fs = require('fs');
const bodyParser = require('body-parser');

const express = require('express');
const app = express();
const router = require('./routes');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const CURRENT_VERSION = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString().trim();

fs.writeFileSync('./.VERSION', CURRENT_VERSION);

app.use('/', router);

module.exports = app;
