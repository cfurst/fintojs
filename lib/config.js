/**
 *@name config.js
 *@description - sets up defaults for fintojs
 *@author furst
 * TODO: expose the ability to set new credential providers.
 * 
 */

var envious = require('envious'),
AWS = require('aws-sdk'),
optLibs = require('./OptLibs');

envious.dev = {
    rcFileDefaultLocation:  optLibs.getConfigFilePath(),
    identityProfileDefault: "identity",
    defaultRoleKey: 'mlbam',
    regionDefault: "us-east-1",
    serverSettings: {
        host: optLibs.getAddress(),
        port: optLibs.getPort(),
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

