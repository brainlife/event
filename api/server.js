'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
//const winston = require('winston');
//const expressWinston = require('express-winston');
const compression = require('compression');
const cors = require('cors');
const amqp = require('amqp');

const config = require('./config');

//init express
const app = express();
app.use(cors());
app.use(compression());
const expressws = require('express-ws')(app);

//parse application/json
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: false }));

//app.use(expressWinston.logger(config.logger.winston));

app.use('/', require('./controllers'));

//error handling
//app.use(expressWinston.errorLogger(config.logger.winston)); 
app.use(function(err, req, res, next) {
    if(typeof err == "string") err = {message: err};
    console.error(err);
    if(err.stack) {
        console.error(err.stack);
        err.stack = "hidden"; //for ui
    }
    res.status(err.status || 500);
    res.json(err);
});

exports.app = app;
exports.amqp = null;
exports.start = function(cb) {
    console.log("connecting to amqp");
    var amqp_conn = amqp.createConnection(config.event.amqp);
    amqp_conn.once('ready', err=>{
        if(err) throw err;

        exports.amqp = amqp_conn; //to give it to health checker

        var port = process.env.PORT || config.express.port || '8080';
        var host = process.env.HOST || config.express.host || 'localhost';
        app.listen(port, host, function() {
            console.log("event service running on %s:%d in %s mode", host, port, app.settings.env);
        });
    });
    amqp_conn.on('error', console.error);
}

