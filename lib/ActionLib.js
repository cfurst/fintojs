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
async       = require('async');


function ActionLib(req) {
    this.setActiveRole(config.defaultRoleKey);
    this.setRequest(req);
    
};


ActionLib.prototype.process = function(callback) {
    async.series  (
        [this.__parseAction__,
         this.__executeAction__,
        ],
        function(err, results) {
            if (err) {
                callback(err)
            } else {
                callback(null, results[0]);
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


ActionLib.prototype.__getRoles__ = function() {
    var reqUrl,
    rolesObj = {roles: []},
    req = this.getRequest(),
    action = this.getAction();
        if (req.method === "GET") {
            reqUrl = url.parse(req.url, true);
            if (reqUrl.query && reqUrl.query.status === "active") {
                rolesObj.roles.push(activeRole);
            } else {
                rolesObj.roles = arnLib.getRoleNames();
            }
            return JSON.stringify( rolesObj, null, ' ');
        }
    
   
};

ActionLib.prototype.__getArnJson__ = function (acct,callback) {
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
ActionLib.prototype.__getParts__(req) {
    this.parts = [];
    req.url = req.url.replace(/\/+/, '/');
    this.parts = req.url.split('/');
    this.parts.shift(); //gets rid of the root, which is blank.
    
};



ActionLib.prototype.__parseAction___ = funtion(callback) {
    var  
    parts = [],
    req;
    
    req = this.getRequest();
    if (req === undefined) {
       callback("No Request found! can't parse action!");
    }
    parts = this.__getParts__(req);
    action = parts[0];
    if (action === "roles") {
        switch (parts.length) {
            case 2:
        //        console.log("parts length: " + parts.length);
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
            action = (action.split('?'))[0];
        }
    
    }
    else if (/security-credentials/.test(req.url)) {
        /**
         * 
         */
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
    this.action = action;
    callback();
}

ActionLib.prototype.__executeAction__ = function(callback) {
    var action = this.getAction();
    
    switch(action) {
        case "roles": {
      //      console.log("<===== found roles action ");
            
            callback(null, this.__getRoles__(req, this.getActiveRole()));
            break;
        };
        case "arn": {
            
            this.__getArnJson__(acct, function(err, arnJson) {
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
               callback(null, this.getActiveRole());
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


