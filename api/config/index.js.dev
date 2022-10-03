'use strict';

const fs = require('fs');
const request = require('request');

exports.sca = {
    auth_api: "http://brainlife_auth-api:8080",

    //jwt token used to access other services (like auth service)
    jwt: fs.readFileSync(__dirname+'/event.jwt', {encoding: 'ascii'}).trim(),
}

//warning.. you don't get error message if your user/pass etc. are incorrect (it just keeps retrying silently..)
exports.event = {
    amqp: {
        url: "amqp://guest:guest@brainlife_rabbitmq:5672/brainlife"
    },

    //list of exchanges that this service supports and check_access cb
    //in check_access, you can make 3rd party api call to check for user access
    //or just check the jwt sent from the client (TODO is this really possible via websocket?)

    exchanges: {

        //deprecated by amaretti
        "wf.task": function(req, bind, cb) {
            let instance_id = bind.key.split(".")[0];
            request.get({
                url: "http://brainlife_amaretti-api:8080/event/checkaccess/instance/"+instance_id, json: true,
                headers: {'Authorization': 'Bearer '+req.query.jwt}
            }, function(err, res, body) {
                cb(err, (body.status == "ok"));
            });
        },

        //deprecated by amaretti
        "wf.instance": function(req, bind, cb) {
            let group_id = bind.key.split(".")[0];

            //(TODO - DEPRECATE THIS) 
            //old processes didn't belong to any group, so it's hard to access control..
            //let's make it wide open -- as it will be deprecated soon
            if(group_id == "na") return cb(null, true); 

            //check for group access in req.user
            group_id = parseInt(group_id); //gids are integers..
            //console.log("wf.instance check", group_id, req.user.gids);
            if(req.user && req.user.gids && ~req.user.gids.indexOf(group_id)) {
                return cb(null, true);
            }
            
            cb(null, false);
        },

        //deprecated by warehouse ex
        "warehouse.dataset": function(req, bind, cb) {
            //checking access for key
            var project = bind.key.split(".")[0];
            console.log("checking warehouse.dataset access", project);
            request.get({
                url: "http://brainlife_warehouse-api:8080/event/checkaccess/project/"+project,
                json: true,
                headers: {'Authorization': 'Bearer '+req.query.jwt}
            }, function(err, res, body) {
                cb(err, (body.status == "ok"));
            });
        },

        "warehouse": function(req, bind, cb) {
            let keys = bind.key.split(".");
            let collection = keys[0];
            let action = keys[1];
            let sub = null;
            let project = null;
            if(collection == "dataset") {
                sub = keys[2];
                project = keys[3];
            }
            if(collection == "project") {
                sub = keys[2];
                project = keys[3];
            }
            if(collection == "rule") {
                sub = keys[2];
                project = keys[3];
            }

            if(!project) return cb("invalid warehouse event - couldn't figure out project id:"+bind.key);

            console.debug("checking warehouse ex access", bind.key);
            request.get({
                url: "http://brainlife_warehouse-api:8080/event/checkaccess/project/"+project,
                json: true,
                headers: {'Authorization': 'Bearer '+req.query.jwt}
            }, function(err, res, body) {
                if(err) return cb(err);
                cb(null, (body.status == "ok"));
            });
        },
    }
}

exports.handler = {
    email: {
        from: "brlife@iu.edu",
    },

    mailer: {
        host: 'mail-relay.iu.edu',
        secure: true,
        auth: {
            user: 'user',
            pass: 'password',
        }
    },
}

exports.express = {
    host: "0.0.0.0",
    port: 8080,

    //auth pub key used to validate jwt token
    pubkey: fs.readFileSync(__dirname+'/auth.pub', {encoding: 'ascii'}).trim(),
}


