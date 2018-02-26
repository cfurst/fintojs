/**
 * 
 */

var StsLib = require('../lib/StsLib'),

stsLib = new StsLib();

stsLib.getCreds('mlb-cms',function(err,creds) {
    if (err) {
        console.error(err);
    } else {
        console.log("got credentials: " + creds);
    }
    
});

setTimeout(function() {stsLib.getSessionName('mlb-cms', function(err, sessionName){
    
    if (err) {
        console.error(err);
    } else {
        console.log("got session name: " + sessionName);
    }
   }
)},5000);