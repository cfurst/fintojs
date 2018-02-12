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
activeRole = '',
ActionLib = require('./lib/ActionLib'),

server = http.createServer(function(req,res) {
    var errorJson;
    console.log("[" + new Date() + "] " + req.url);
  
    try {
        getAction(req, function(err, response) {
            if (err) {
                
                throw("Action error: "  + err);
            }
            res.writeHead(200, {"Content-Type": 'application/json', "Content-length": response.length});
            res.write(response);
            
        });
      
       
   } catch(e) {
       console.log(e);
       errorJson = JSON.stringify({error: "Server Error.", message: e.toString()})
       res.writeHead(500, {"Content-Type": 'application/json', "Content-Length": errorJson.length});
       res.write(errorJson);
   }
   // console.log("<====== calling end");
   res.end();
   
}).on('error', function(err) {
    console.log(err);
});

server.listen(config.serverSettings, function() {
 
    console.log("server started on..." + config.serverSettings.host + " on port " + config.serverSettings.port);
    
   
} );

function getAction(req, callback) {
    var parts = [],
    getString,
    getParts,
    action = '';
   // console.log("<===== called getaction");
    
    parts = req.url.split('/');
    action = parts[parts.length - 1];
    if (/\?/.test(action)) {
        action = (action.split('?'))[0];
    }
    switch(action) {
        case "roles": {
            // console.log("<===== found roles action ");
            callback(null, ActionLib.getRoles(req, activeRole));
            break;
        }
        default: {
            callback("No Action Defined!");
        }
            
    }
    
}