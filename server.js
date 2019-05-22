/**
 * 
 * there are a few endpoints we need to impletment
 *  /roles - to get a list of all available roles if a GET, if a PUT then it needs to set the acct to that role-key
 *  /roles/{alias} - to get the arn of a particular acct role
 *  /roles/{alias}/credentials - to get current credentials for a session of a certain role.
 *  /latest/meta-data/iam/security-credentials/ returns the latest role-name
 *  /latest/meta-data/iam/security-credentials/{alias} synonym for roles/{alias}/credentials
 *  
 */

// var finto = require("./lib/fintoLib"),
'use strict';
var http = require('http'),
    util = require('util'),
    config = require('./lib/config'),
    activeRole = config.defaultRoleKey,
    ActionLib = require('./lib/ActionLib'),
    controller = new ActionLib(),

    /**
     * Main server set up - basic workflow defined here  with getAction as the main controller method
     * TODO: make an actual controller class or get a frame work to help me do so.
     */
    server = http.createServer(function(req, res) {
        var

            postData = '';
        console.log("[" + new Date() + "] " + req.url);


        req.on('data', function(post) {
            postData += post;
            // console.log("got post data: " + postData);
        }).on('end', function() {
            controller.setRequest(req);
            controller.setPostData(postData);

            ///console.log("==== calling process ===");
            controller.process(function(err, response) {
                if (err) {
                    /// console.log("==== got process error ======");
                    controller.writeError(err, res);
                } else {
                    res.writeHead(200, { "Content-Type": 'application/json', "Content-length": response.length });
                    res.write(response);
                    res.end();
                }
                // console.log("=== ended process callback ==== ");
            });


            //console.log("==== ended request end event ==== ")
        }).on('error', function(err) {
            controller.writeError(err, res);

        });

        //TODO: refactor this to be used in the controller.

    }).on('error', function(err) {
        console.log("Internal Server Error: ");
        //console.log("==== here =====")
        console.log(err);

    });

process.on('uncaughtException', function(err) {
    console.log("==== uncaught exception ===");

    server.emit('error', err);

});

process.on('exit', function(code) {
    console.error("===========   exit called!!! Code: " + code + " ===============")

})

server.listen(config.serverSettings, function() {

    console.log("server started on..." + config.serverSettings.host + " on port " + config.serverSettings.port);


});