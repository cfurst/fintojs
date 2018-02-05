/**
 * @author furst
 * @name StsLib
 * @description this supplies an interface to get access_keys and secret_access_keys via aws.sts and aws.credentials for different roles.
 * 
 * 
 */
/**
 * response tempalte:
 * "Code":            "Success",
            "LastUpdated":     "2015-07-07T23:06:33Z",
            "Type":            "AWS-HMAC",
            "AccessKeyId":     creds.AccessKeyId,
            "SecretAccessKey": creds.SecretAccessKey,
            "Token":           creds.SessionToken,
            "Expiration":      creds.Expiration.Format("2006-01-02T15:04:05Z"),
 */


var AWS = require('aws-sdk'),
config = require('./config'),
IamArnLib = require('./IamArnLib');


process.env.AWS_PROFILE = config.identityProfileDefault;
new AWS.CredentialProviderChain(config.credentialProviders).resolve(function(err, creds) {
    //this is crazy and probably won't work.
    if (err) {
        throw ("couldn't create sts lib: " + err);
    } else {
    AWS.config.credentials = creds; // all this pain when this is all I need...wish Amazon had better examples..
    var sts = new AWS.STS();

    function StsLib(acct) {
        this.iam = new IamArnLib();
        if (acct) {
            this.iam.setAcct(acct);
        }
    }

    StsLib.prototype.getCreds = function (callback) {
        if (! this.creds || (this.creds && this.creds.expired)) {
            this._initCreds(callback);
        } else {
            callback(null, this.creds);
        }
        
    };
    /*
    StsLib.prototype._refreshCreds = function(callback) {
        
        
    }
    */

    StsLib.prototype._initCreds = function(callback) {
        var roleArn = this.iam.getArn(),
        params = {
           RoleArn: roleArn,
           RoleSessionName: new Date().getTime() + "_fintojs", //probably would be best to hash this TODO: create a sha hash per session.
        };
        console.log("===> arn: " + roleArn);
        sts.assumeRole(params, function(err,data) {
           if (err) {
               callback(err);
           } else {
               
              this.creds = this._tokenizeResponse(sts.credentialsFrom(data))
              callback(null, this.creds);
           }
           
        }.bind(this));
    }

    StsLib.prototype._tokenizeResponse = function(creds) {
        var responseJson = {
            "Code":            "Success",
            "LastUpdated":     new Date().toISOString(),
            "Type":            "AWS-HMAC",
            "AccessKeyId":     creds.accessKeyId,
            "SecretAccessKey": creds.secretAccessKey,
            "Token":           creds.sessionToken,
            "Expiration":      creds.expireTime.toISOString(),
        };
        return JSON.stringify(responseJson);
    }

    module.exports = StsLib
  
    }
    
});



/**

*/