/**
 * 
 */
'use strict';
var http    = require('http'),
async        = require('async'),
hostname="169.254.169.254",
roleAlias = process.argv[2],
httpOptions = {
                hostname: hostname,
                timeout: 60000
}; //first argv 'argument'

//path="/latest/meta-data/iam/security-credentials/";

async.parallel({
    'finto-ls': function(callback) {
        httpOptions.path = "/roles";
        httpOptions.method= "GET";
            http.get(httpOptions, function(resp) {
                getData(resp, function(respData) {
                    var respJson = {};
                    try {
                        if (respData === "") {
                            callback(null, false);
                        }
                        respJson = JSON.parse(respData);
                        if (respJson.error) {
                            callback(null, false);
                            return;
                        }
                        callback(null, true);
                    } catch (lsErr) {
                        callback("could not get a list of aliased roles: " + lsErr);
                    }
                })
            })
    },
    'finto-set': function(callback) {
            httpOptions.path = "/roles";
            httpOptions.method = "PUT";
            var req = http.request(httpOptions);
            req.write('{"alias": "' + roleAlias + '"}');
            req.end();
            req.on("response", function(res) {
                var responseJson = ''
                getData(res, function(respData) {
                    var respJson = {};
                    if (respData === "") {
                        callback(null, false)
                    } else {
                        try {
                            respJson = JSON.parse(respData);
                            if (respJson.error) {
                                callback(null, false);
                                return;
                            }
                            callback(null,true);
                        } catch(JsonE) {
                            callback("could not parse json during finto-set: " + JsonE);
                        }
                    }
                })
            })
            
    },
    'finto-active': function(callback) {
        httpOptions.path = "/roles?status=active";
        httpOptions.method = "GET";
                       
        http.get(httpOptions, function(resp) {
            var jsonChunk = '';
            getData(resp, function(json) {
                var activeJson = {};
                if (json === "") {
                    callback(null, false);
                }
                else {
                    try {
                        activeJson = JSON.parse(json);
                        if (activeJson.roles && activeJson.roles[0] && activeJson.roles[0] === roleAlias) {
                            callback(null,true);
                        } else {
                            callback(null, false);
                        }
                    } catch(activeError) {
                        console.error(activeError)
                        callback("Error executing finto-active: " + activeError);
                    }
                }
            })
        })
        
    }
},
        function(err, results) {
            var passed,
            result;
            if (err) {
                console.error(err);
            } else {
                for (result in results) {
                    passed = results[result] ? "Passed" : "Failed";
                    console.log("Test: " + result + ": " + passed) ;
                }
            }
        });

function getData(res, callback) {
    var respData = ""
    res.on('data', function(chunk) {
        respData += chunk;
    }).on('end', function() {
        callback(respData);
    }).on('error', function(err) {
        console.error(err);
        callback(respData);
    })
}