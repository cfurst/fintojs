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
var http            = require('http'),
util                = require('util'),
config              = require('./lib/config'),
iamArnLib           = require('./lib/IamArnLib'),
StsLib              = require('./lib/StsLib'),
stsLibInst          = new StsLib(),
activeRole          = config.defaultRoleKey,
ActionLib           = require('./lib/ActionLib'),
postData            = '',

/**
 * Main server set up - basic workflow defined here  with getAction as the main controller method
 * TODO: make an actual controller class or get a frame work to help me do so.
 */
server = http.createServer(function(req,res) {
    var errorJson;
    console.log("[" + new Date() + "] " + req.url);
  
   
        req.on('data', function(post) {
            postData = post;
        }).on('end', function() {
        try {
        getAction(req, function(err, response) {
            if (err) {
                
                throw(err);
            }
            res.writeHead(200, {"Content-Type": 'application/json', "Content-length": response.length});
            res.write(response);
            res.end();
            
        });
      //TODO: better error handling!    
        } catch(e) {
                console.log(e);
                errorJson = JSON.stringify({error: "error encountered!", message: e.toString()})
                res.writeHead(500, {"Content-Type": 'application/json', "Content-Length": errorJson.length});
                res.write(errorJson);
                res.end();
        }
        });
}).on('error', function(err) {
    
    console.log(err);
});

server.listen(config.serverSettings, function() {
 
    console.log("server started on..." + config.serverSettings.host + " on port " + config.serverSettings.port);
    
   
} );

//TODO: maybe split this out into a server controller class? Yeah definitely!
/**
 * main controller method
 * TODO: make actionlib the actual controller class. and add this as a contoller gateway..
 * 
 */
function getAction(req, callback) {
    var parts = [],
    getString,
    getParts,
    action = '',
    roleReqObj = {},
    roleE,
    arnLib = new iamArnLib(),
    acct;
   // console.log("<===== called getaction");
    //TODO: make scalable.
    req.url = req.url.replace(/\/+/, '/');
    parts = req.url.split('/');
    parts.shift(); //gets rid of the root which has nothing.
  //  console.log(parts);
    if (req.method === "PUT") {
        try {
            roleReqObj = JSON.parse(postData);
            activeRole = roleReqObj.alias;
            if (! arnLib.getArn(activeRole))
                callback(null, "Role not found!");
            callback(null, JSON.stringify({ active_role: activeRole }, null, ' '));
            
        } catch(roleE) {
    //        console.log("caught error...");
            callback(roleE);
            
        }
        return;
    } 
    if (/roles/.test(req.url)) {
      //  console.log("<==== roles test positive in url")
        action = parts[0];
        switch (parts.length) {
            case 2:
        //        console.log("parts length: " + parts.length);
                action  = 'arn'
                acct    = parts[1]; //arn request for acct
                break;
            case 3:
                acct    = parts[1];
                action  = parts[2]; //credentials action for acct
             
        }
    }
    // this needs to be split up to it's own action.. because we are supposed to return the active alias or credentials depending on whether or not there is an alias in the url.
    else if (/security-credentials/.test(req.url)) {
       switch(parts.length) {
           case 4: 
               action   = parts[parts.length-1]; //should be security-credentials
               break;
           case 5: 
               action   = parts[parts.length-2]; //should be security-credentials
               acct     = parts[parts.length-1]; //should be role key
               break;
           default:
               callback("bad security-credentials request!");
       }
    }
    if (/\?/.test(action)) {
        action = (action.split('?'))[0];
    }
    //console.log("action: " + action);
    
    // Heavy lifting of action handling. TODO: break this out into a controller.
    switch(action) {
        case "roles": {
      //      console.log("<===== found roles action ");
            
            callback(null, ActionLib.getRoles(req, activeRole));
            break;
        };
        case "arn": {
            
            ActionLib.getArnJson(acct, function(err, arnJson) {
                if (err) {
                    callback(err)
                } else {
        //            console.log("<===== arn json: " + arnJson);
                    callback(null, arnJson);
                }
            });
            break;
        };
        case "security-credentials":
           if (!acct) {
               callback(null, activeRole);
               break;
           }
            
        case "credentials": {
            stsLibInst.getCreds(acct,function(err, creds) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, creds);
                }
                
            });
            break;
            
        }
        default: {
            callback("No Action Defined!");
        }
            
    }
    
}