/**
 * 
 */

var StsLib = require('../lib/StsLib'),

stsLib = new StsLib('mlb-cms');

stsLib.getCreds(function(err,creds) {
    if (err) {
        console.error(err);
    } else {
        console.log("got credentials: " + creds);
    }
    
});