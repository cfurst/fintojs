/**
 * 
 */

var StsLib = require('../lib/StsLib'),

stsLib = new StsLib();



console.log("current time:" + Date());
console.log("adding an hour?");
var currentTime = new Date().getTime() + 3600*1000,
newTime = new Date(currentTime);

console.log(newTime);


stsLib.getCreds('mlb',function(err,creds) {
    if (err) {
        console.error(err);
    } else {
        console.log("got credentials: " + creds);
    }
    
});

setTimeout(function() {stsLib.getCreds('mlb', function(err, creds){
    
    if (err) {
        console.error(err);
    } else {
        console.log("got creds after an hour: " + creds);
    }
   }
)},3600 * 1000 + 10); // 10 seconds after the hour
