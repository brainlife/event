'use strict';

const fs = require('fs');
const { transports } = require('winston');
const request = require('request');

const {
    SERVICE_AUTHORITY, 
    AUTH_SERVICE_URL, 
    AMARETTI_SERVICE_URL,
    WAREHOUSE_SERVICE_URL,
    REDIS_URL, 
    RABBITMQ_URL, 
    MONGO_URL,
    SSH_AUTH_SOCK,
    GITHUB_TOKEN,
    SLACK_TOKEN,
    GOOGLE_MAPS_API_KEY,
} = process.env;
const [API_HOST, API_PORT] = SERVICE_AUTHORITY.split(':');

exports.sca = {
    auth_api: AUTH_SERVICE_URL,
    jwt: fs.readFileSync(__dirname + '/sca.jwt'),
}

exports.event = {
    amqp: {
        url: RABBITMQ_URL,
    },
    
    //list of exchanges that this service supports and check_access cb
    //in check_access, you can make 3rd party api call to check for user access
    //or just check the jwt sent from the client (TODO is this really possible via websocket?)
    exchanges: {
        "wf.task": function(req, key, cb) {
            //checking access for key
            request.get({
                url: AMARETTI_SERVICE_URL + "/api/wf/event/checkaccess/task/" + key,
                json: true,
                headers: {'Authorization': 'Bearer ' + req.query.jwt}
            }, function(err, res, body) {
                cb(err, (body.status == "ok"));
            });
        },

        "dicom.series": function(req, key, cb) {
            //checking access for key
            console.log("checking dicom.series access for "+key);
            request.get({
                url: AMARETTI_SERVICE_URL + "/api/dicom/event/checkaccess/series/" + key,
                json: true,
                headers: {'Authorization': 'Bearer ' + req.query.jwt}
            }, function(err, res, body) {
                console.dir(body);
                cb(err, (body.status == "ok"));
            });
        }
    }
}

exports.handler = {
    email: {
        from: "hayashis@iu.edu",
    }
}

exports.mongodb = MONGO_URL;

exports.express = {
    host: API_HOST, port: API_PORT,

    //public key used to validate user requests
    pubkey: fs.readFileSync('/apps/auth/api/config/auth.pub'),
}

exports.logger = {
    winston: {
        requestWhitelist: ['url', /*'headers',*/ 'method', 'httpVersion', 'originalUrl', 'query'],
        transports: [
            new transports.Console({
                stderrLevels: ["error"],
                timestamp: function() {
                    return new Date().toString();
                },
            }),
        ]
    },
}


