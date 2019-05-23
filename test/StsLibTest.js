/**
 * 
 */

var StsLib = require('../lib/StsLib'),

    stsLib = new StsLib();



console.log("current time:" + Date());

var anHourFromNow = new Date().getTime() + 3600 * 1000,
    newTime = new Date(anHourFromNow),
    oldCreds,
    newCreds;
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
            console.log("got creds after an hour: " + creds)
            newCreds;
            assert(newCreds !== oldCreds);
        }
    })
}, 3600 * 1000 + 60); // 1  minute after the hour