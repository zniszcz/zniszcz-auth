const bodyParser = require('body-parser');

const express = require('express');
const app = express();
const router = require('./routes');

const i18n = require('./locale');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(i18n.init);

const CURRENT_VERSION = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString().trim();

process.env.CURRENT_VERSION = CURRENT_VERSION;

app.use('/', router);

module.exports = app;
