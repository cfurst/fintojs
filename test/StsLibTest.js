/**
 * 
 */

var StsLib = require('../lib/StsLib'),
    assert = require('assert');
stsLib = new StsLib();



console.log("current time:" + Date());

var anHourFromNow = new Date().getTime() + 3600 * 1000,
    newTime = new Date(anHourFromNow),
    oldCreds;
console.log("an hour from now: " + newTime);



stsLib.getCreds('xce-bamtech-test', function(err, creds) {
    if (err) {
        console.error(err);
    } else {
        console.log("got credentials: " + creds);
        oldCreds = creds;
    }

});

setTimeout(function() {
    stsLib.getCreds('xce-bamtech-test', function(err, creds) {

        if (err) {
            console.error(err);
        } else {
            console.log("got creds after an hour. we are comparing:");
            console.log(`${creds.Token} with`);
            console.log(`${oldCreds.Token}`);
            assert(creds.Token !== oldCreds.Token);
        }
    })
}, 3600 * 1000 + 60 * 1000); // 1  minute after the hour in ms