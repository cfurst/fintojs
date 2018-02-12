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