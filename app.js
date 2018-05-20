'use strict';

var express = require('express'),
    contentType = require('content-type'),
    concat = require('concat-stream'),
    load = require('express-load'),
    app = express(),
    getRawBody = require('raw-body'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    cfg = require('./config').Config,
    http = require("http");

var path = require('path');
global.pathRootApp = path.resolve(__dirname);

app.use(methodOverride());
app.use(bodyParser.json({limit:1024102420, type:'application/json'}));
app.use(bodyParser.text());

global.env = cfg.env;
global.cfg = cfg;

load('models')
    .then('controllers')
    .then('models')
    .then('routes')
    .into(app);

var serveIndex = require('serve-index');

app.use(cookieParser());

app.use('/', express.static(__dirname + '/public/', { 'index': 'index.html' }));
 
app.listen(cfg.port, cfg.host, function () {
    console.info("########################################################################");
    console.info("##              POWER        SERVER STARTED              POWER        ##");
    console.info("########################################################################");
    console.info('Enviroment: ', cfg.env);
    console.info('URL: ', cfg.host + ":" + cfg.port);
    console.info("------------------------------------------------------------------------");
});

console.info("------------------------------------------------------------------------");
