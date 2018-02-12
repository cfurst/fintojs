/**
 *@name config.js
 *@description - sets up defaults for fintojs
 *@author furst
 * 
 */

var envious = require('envious'),
AWS = require('aws-sdk');

envious.dev = {
    rcFileDefaultLocation:  process.env.HOME + "/.fintorc",
    identityProfileDefault: "identity",
    regionDefault: "us-east-1",
    serverSettings: {
        host: '169.254.169.254',
        port: 80,
        exclusive: true
    },
    credentialProviders: [// you can add functions here that return an AWS.Credentials object.
       function () {
           return new AWS.SharedIniFileCredentials( {profile: this.identityProfileDefault} ); // TODO: anyway to inherit this from the config? bind?
       }.bind(this),
       function() {return new AWS.EnvironmentCredentials()}
   ]
};

envious.default_env = "dev";
module.exports = envious.apply();

