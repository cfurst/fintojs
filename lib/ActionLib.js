/**
 * 
 */
'use strict'
var ArnLib = require('./IamArnLib'),
arnLib = new ArnLib(),
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
   
}