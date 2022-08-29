'use strict';

//contrib
const express = require('express');
const router = express.Router();
//const winston = require('winston');
//const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//mine
const config = require('../config');
const server = require('../server');
//const logger = new winston.Logger(config.logger.winston);
//const db = require('../models');

//router.use('/notification', require('./notification'));

function json(obj) {
    return JSON.stringify(obj);
}

/**
 * @apiGroup System
 * @api {get} /health Get API status
 * @apiDescription Get current API status
 *
 * @apiSuccess {String} status 'ok' or 'failed'
 */
router.get('/health', function(req, res) {
    var status = "ok";
    var message = "all good";

    var amqp_connected = (server.amqp != null);
    if(!amqp_connected) {
        status = "failed";
        message = "amqp disconnected";
    }
    /*
    if(mongoose.connection.readyState != 1) {
        status = "failed";
        message = "mongo not ready";
    }

    //do real db test
    db.Notification.findOne().exec(function(err, record) {
        if(err) {
            status = "failed";
            message = err;
        }
    });
    */
    res.json({ status, amqp_connected, message });
});

/**
 * @apiGroup Event
 * @api {get} /subscribe Subscribe
 * @apiParam {String} jwt JWT token to be relayed to event source. Should be a JWT token issued by SCA Auth service.
 * @apiDescription 
 *      Subscribe to AMQP. Once connected, you need to emit bind messages to bind to specific exchange:key.
 *      {
 *          "bind": { 
 *              "ex": "wf.task",
 *              "key": "1.123455.#",
 *          }
 *      }
 *      You will receive an error event if you are not authorized
 *      
 */

router.ws('/subscribe', (ws, req) => {
    //console.debug("websocket /subscribe called");
    if(!server.amqp) {
        ws.send(json({error: "amqp not (yet) connected"}));
        return;
    }

    //parse jwt
    jwt.verify(req.query.jwt, config.express.pubkey, (err, user)=>{
        if(err) return console.error(err);
        //console.debug(user);
        req.user = user; //pretent it like express-jwt()

        //receive request from client
        ws.on('message', function(_msg) {
            var msg = JSON.parse(_msg); 
            if(msg.bind) {
                var ex = msg.bind.ex;
                if(!config.event.exchanges[ex]) return console.warn("unconfigured bind request for exchange:"+ex);

                //do access check for this bind request
                //console.debug("checking access", ex, msg.bind);
                var access_check = config.event.exchanges[ex];
                access_check(req, msg.bind, function(err, ok) {
                    if(err) return console.error(err);
                    if(!ok) {
                        console.debug(".. access denied", msg.bind);
                        ws.send(json({error: "Access denided "+ex}));
                        return;
                    }

                    //good.. proceed with creating new queue / bind
                    //TODO - explain why the options?
                    server.amqp.queue('', {exclusive: true, closeChannelOnUnsubscribe: true}, (q) => {
                        console.log(".. binding", msg.bind);
                        q.bind(ex, msg.bind.key); 
                        q.subscribe(function(msg, headers, dinfo, ack) {
                            console.debug("received event!", dinfo);
                            ws.send(json({
                                headers,
                                dinfo,
                                msg,
                            }));

                        }).addCallback(function(ok) {
                            ws.on('close', function(msg) {
                                console.log("client disconnected", q.name);
                                q.unsubscribe(ok.consumerTag);
                            });
                        });
                    });
                });
            }
        });
    });   
});

module.exports = router;
