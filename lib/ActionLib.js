/**
 * 
 */
'use strict'
var ArnLib  = require('./IamArnLib'),
StsLib      = require('./StsLib'),
arnLib      = new ArnLib(),
stsLib      = new StsLib(),

url = require('url');

exports.getRoles = function(req, activeRole) {
    var reqUrl,
    rolesObj = {roles: []};
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
exports.getArnJson = function (acct,callback) {
    var acctArn = arnLib.getArn(acct);
    console.log("<==== acctArn: " + acctArn);
    stsLib.getSessionName(acct, function(err, sessionName) {
        if (err) {
            callback(err);
        } else {
            console.log("<==== sessionName" + sessionName)
            callback(null, JSON.stringify({arn: acctArn, session_name: sessionName}, null, " "));
        }
        
    })
}