/**
 * 
 */

var StsLib = require('../lib/StsLib'),

    stsLib = new StsLib(),
    assert = require('assert'),
    AWS = require('aws-sdk'),
    s3 = new AWS.S3();




console.log("current time:" + Date());

var anHourFromNow = new Date().getTime() + 3600 * 1000,
    newTime = new Date(anHourFromNow),
    oldCreds,
    newCreds;
console.log("an hour from now: " + newTime);



/* stsLib.getCreds('xce-bamtech-test', function(err, creds) {
    if (err) {
        console.error(err);
    } else {
        console.log("got credentials: " + creds);
        oldCreds = creds;
    }

}); */
s3.listBuckets({}, (err, data) => {
    if (err) {
        console.error(err);
    } else {
        console.log("first attempt with client went through...");
    }
});
console.log(`setting timeout.... should execute at ${newTime}`)
setTimeout(() => {
    s3.listBuckets({}, (err, data) => {
        if (err) {
            console.error("second attempt generated an error.. possible bug with sdk detected...")
            console.error(err);
        } else {
            console.log("second attempt with client went through...");
        }
    });
}, 3600 * 1000 + 60 * 1000);
/* setTimeout(function() {
    stsLib.getCreds('xce-bamtech-test', function(err, creds) {

        if (err) {
            console.error(err);
        } else {
            console.log("got creds after an hour: " + creds)
            newCreds;
            assert(newCreds !== oldCreds);
        }
    })
}, 3600 * 1000 + 60 * 1000); // 1  minute after the hour */