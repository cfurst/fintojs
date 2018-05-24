/**
 *@name config.js
 *@description - sets up defaults for fintojs
 *@author furst
 * TODO: expose the ability to set new credential providers.
 * 
 */

var envious = require('envious'),
AWS = require('aws-sdk'),
util = require('util'),
optLibs = require('./OptLibs');

envious.dev = {
    rcFileDefaultLocation:  optLibs.getConfigFilePath(),
    identityProfileDefault: "identity",
    defaultRoleKey: 'mlbam',
    regionDefault: "us-east-1",
    defaultExpirationTimeMs: 3600 * 1000, // one hour in miliseconds. Session will set to expire in this default time. Do not exceed the role's maximum session time see https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/STS.html#assumeRole-property for more info
    serverSettings: {
        host: optLibs.getAddress(),
        port: optLibs.getPort(),
        exclusive: true
    },
    
};

envious.dev.credentialProviders =  [// you can add functions here that return an AWS.Credentials object.
                      function() {return new AWS.EnvironmentCredentials()},
                                         
                      function () {
                           console.log(util.inspect(this, {depth:null}));                  
                          return new AWS.SharedIniFileCredentials( {profile: this.identityProfileDefault} ); // TODO: anyway to inherit this from the config? bind?
                      }.bind(envious.dev)
                      
                  ];
envious.default_env = "dev";
module.exports = envious.apply();

