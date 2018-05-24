/**
 * 
 */

var StsLib = require('../lib/StsLib'),

stsLib = new StsLib();

var currentTime = stsLib._getExpirationDate();

console.log(new Date(currentTime));
console.log("adding an hour?");
currentTime = currentTime + 3600*1000;

var newTime = new Date(currentTime);
console.log(newTime);


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
