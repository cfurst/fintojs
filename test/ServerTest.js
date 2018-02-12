/**
 * 
 */

var http = require('http'),

hostname="169.254.169.254",
port=80,
path="/latest/meta-data/iam/security-credentials/";

http.get({hostname: hostname, port: port, path: path}, function(res) {
    
    console.log("response obtained!");
});
