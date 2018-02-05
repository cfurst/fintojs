/**
 * 
 */

// var finto = require("./lib/fintoLib"),
var http = require('http'),
util = require('util'),
config = require('./lib/config'),
queryparser = require('querystring'),
server = http.createServer(function(req,res) {
    
    console.log("connection detected..."); 
   console.log("Method: " + req.method + "\n\nHeaders: " + req.rawHeaders + "\n\n" + "url: " + req.url);
   console.log(util.inspect(queryparser.parse(req.url), {depth:null}));
   res.end();
   
}).on('error', function(err) {
    console.error(err);
}),
defaultSetup = config.serverSettings;


server.listen(defaultSetup, function() {
 // var request = http.request({host: '169.254.169.254'});
    console.log("server started on..." + defaultSetup.host + " on port " + defaultSetup.port);
    
   // request.end();
} );
