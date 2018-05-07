/**
 * 
 */
'use strict'
var ArnLib  = require('./IamArnLib'),
StsLib      = require('./StsLib'),
arnLib      = new ArnLib(),
stsLib      = new StsLib(),
config      = require('./config'),
url         = require('url'),
async       = require('async'),
util        = require('util');


function ActionLib(req) {
    this.setActiveRole(config.defaultRoleKey);
    this.setRequest(req);
    
};


ActionLib.prototype.process = function(callback) {
    async.series  (
        { parsed_request: this.__parseAction__.bind(this),
         dispatched_request: this.__executeAction__.bind(this),
        },
        function(err, results) {
            if (err) {
                callback(err)
            } else {
                // console.log("RESULTS: " + util.inspect(results, {depth:null}));
                callback(null, results.dispatched_request);
            }
        }
        );
    
    
    
};

ActionLib.prototype.getActiveRole = function() {
    return this.activeRole;
}

ActionLib.prototype.setActiveRole = function(role) {
    this.activeRole = role;
};


ActionLib.prototype.setRequest = function(req) {
 this.req = req;   
};

ActionLib.prototype.getRequest = function() {
 return this.req;   
};

ActionLib.prototype.getAction = function() {
    return this.action;
};

ActionLib.prototype.setAction = function(action) {
    // console.log("=== setting action: " + action + "===")
    this.action = action;
};

ActionLib.prototype.setPostData = function(data) {
    this.postData = data;
}

ActionLib.prototype.getPostData = function() {
    return this.postData;
}

ActionLib.prototype.__getRoles__ = function() {
    var reqUrl,
    roleReqObj,
    rolesObj    = {roles: []},
    req         = this.getRequest(),
    postData    = this.getPostData(),
    action      = this.getAction();
    
    if (req.method === "GET") {
        reqUrl = url.parse(req.url, true);
        if (reqUrl.query && reqUrl.query.status === "active") {
            rolesObj.roles.push(activeRole);
        } else {
            rolesObj.roles = arnLib.getRoleNames();
        }
        return JSON.stringify( rolesObj, null, ' ');
    }
    if (req.method === "PUT") {
        
        if (!postData) {
                callback("could not get role from data posted!");
            }
            roleReqObj = JSON.parse(postData);
            this.setActiveRole(roleReqObj.alias);
            if (! arnLib.getArn(this.getActiveRole())) {
               throw this.getActiveRole() + " role not found!";
            } else {
                return JSON.stringify({ active_role: this.getActiveRole() }, null, ' ');
            }
            
        
       
    }
    throw "Bad Request!";
    
   
};

ActionLib.prototype.__getArnJson__ = function(acct,callback) {
    var acctArn = arnLib.getArn(acct);
    //console.log("<==== acctArn: " + acctArn);
    stsLib.getSessionName(acct, function(err, sessionName) {
        if (err) {
            callback(err);
        } else {
      //      console.log("<==== sessionName" + sessionName)
            callback(null, JSON.stringify({arn: acctArn, session_name: sessionName}, null, " "));
        }
        
    })
}
ActionLib.prototype.__getParts__ = function(req) {
    this.parts = [];
    req.url = req.url.replace(/\/+/, '/');
    req.url = req.url.replace(/\/+$/, ''); // a slash at the end is not RESTful
    this.parts = req.url.split('/');
    this.parts.shift(); //gets rid of the root, which is blank.
    return this.parts;
};

ActionLib.prototype.__getActiveRolesArray__ = function() {
    var rolesArr = {roles: []};
    rolesArr.roles.push(this.getActiveRole());
    return JSON.stringify(rolesArr, null, ' ');
}

ActionLib.prototype.__parseAction__ = function(callback) {
    var  
        parts = [],
        getParams = [],
        req,
        acct,
        action;
    
    req = this.getRequest();
    if (req === undefined) {
       callback("No Request found! can't parse action!");
       return;
    }
    parts = this.__getParts__(req);
    action = parts[0];
    // console.log("parts length: " + parts.length + " url: " + req.url + " method: " + req.method);
    if (/roles/.test(action)) {
        
        switch (parts.length) {
            case 2:
              
                action  = 'arn'
                acct    = parts[1]; //arn request for acct
                break;
            case 3:
                acct    = parts[1];
                action  = parts[2]; //credentials action for acct
             defaulit:
                 callback("bad Roles Request!");
        }
     
        if (/\?/.test(action)) {
            getParams = action.split('?', 2)
            action = getParams[0];
            if (/active/.test(getParams[1])) {
               action="get-active-array"
                
            }
        }
    
    }
    else if (/security-credentials/.test(req.url)) {
        /**
         * 
         */
       switch(parts.length) {
           case 4: 
               action   = "return-role" //this is for the first call of aws client to get the active role.
               break;
           case 5: 
               action   = parts[parts.length-2]; //should be security-credentials - this returns the auth token
               acct     = parts[parts.length-1]; //should be role key - if different from set role..will set this to current role.
               break;
           default:
               callback("bad security-credentials request!");
       }
    }
    this.setAction(action);
    if (acct) {
        this.setActiveRole(acct);
    }
    callback();
}

ActionLib.prototype.__executeAction__ = function(callback) {
    var action      = this.getAction(),
        req         = this.getRequest(),
     
        roleReqObj  = {}; 
        
    switch(action) {
        case "roles": {
      //      console.log("<===== found roles action ");
              callback(null, this.__getRoles__());
              break;
        };
        case "arn": {
            
            this.__getArnJson__(this.getActiveRole(), function(err, arnJson) {
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
            
            
        case "credentials": {
            stsLib.getCreds(this.getActiveRole(),function(err, creds) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, creds);
                }
                
            });
            break;
            
        }
        case "return-role": {
            callback(null, this.getActiveRole());
            break;
        }
        case "get-active-array": {
            callback(null, this.__getActiveRolesArray__());
            break;
        }
        default: {
            callback("No Action Defined!");
        }
            
    }
    
}

ActionLib.prototype.writeError = function(err, res) {
    console.log(err);
    var errorJson = JSON.stringify({error: "error encountered!", message: err.toString()});
    res.writeHead(500, {"Content-Type": 'application/json', "Content-Length": errorJson.length});
    res.write(errorJson);
    res.end();
}
module.exports = ActionLib;

