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
iamArnLib = require('./lib/IamArnLib'),
StsLib = require('./lib/StsLib'),
stsLibInst = new StsLib(),
activeRole = '',
ActionLib = require('./lib/ActionLib'),

/**
 * Main server set up - basic workflow defined here  with getAction as the main controller method
 * TODO: make an actual controller class or get a frame work to help me do so.
 */
server = http.createServer(function(req,res) {
    var errorJson;
    console.log("[" + new Date() + "] " + req.url);
  
    try {
        getAction(req, function(err, response) {
            if (err) {
                
                throw(err);
            }
            res.writeHead(200, {"Content-Type": 'application/json', "Content-length": response.length});
            res.write(response);
            res.end();
            
        });
      
       
   } catch(e) {
       console.log(e);
       errorJson = JSON.stringify({error: "Action not found.", message: e.toString()})
       res.writeHead(404, {"Content-Type": 'application/json', "Content-Length": errorJson.length});
       res.write(errorJson);
       res.end();
   }
   // console.log("<====== calling end");
   
   
}).on('error', function(err) {
    
    console.log(err);
});

server.listen(config.serverSettings, function() {
 
    console.log("server started on..." + config.serverSettings.host + " on port " + config.serverSettings.port);
    
   
} );

//TODO: maybe split this out into a server controller?
/**
 * main controller method
 */
function getAction(req, callback) {
    var parts = [],
    getString,
    getParts,
    action = '',
    acct;
   // console.log("<===== called getaction");
    //TODO: make scalable.
    parts = req.url.split('/');
    parts.shift(); //gets rid of the root which has nothing.
    console.log(parts);
    if (/roles/.test(req.url)) {
        console.log("<==== roles test positive in url")
        action = parts[0];
        switch (parts.length) {
            case 2:
                console.log("parts length: " + parts.length);
                action = 'arn'
                acct = parts[1]; //arn request for acct
                break;
            case 3:
                acct = parts[1];
                action = parts[2]; //credentials action for acct
                
               
        }
    }
    else if (/security-credentials/.test(req.url)) {
        action = 'credentials'
    }
    if (/\?/.test(action)) {
        action = (action.split('?'))[0];
    }
    console.log("action: " + action);
    
    // Heavy lifting of action handling. TODO: break this out into a controller.
    switch(action) {
        case "roles": {
            console.log("<===== found roles action ");
            
            callback(null, ActionLib.getRoles(req, activeRole));
            break;
        };
        case "arn": {
            
            ActionLib.getArnJson(acct, function(err, arnJson) {
                if (err) {
                    callback(err)
                } else {
                    console.log("<===== arn json: " + arnJson);
                    callback(null, arnJson);
                }
            });
            break;
        };
        case "credentials": {
            break;
            
        }
        default: {
            callback("No Action Defined!");
        }
            
    }
    
}