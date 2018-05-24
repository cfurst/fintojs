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


var AWS     = require('aws-sdk'),
util        = require('util'),
config      = require('./config'),
IamArnLib   = require('./IamArnLib'),
iam         = new IamArnLib(),
allCreds    = {};


process.env.AWS_PROFILE = config.identityProfileDefault;
new AWS.CredentialProviderChain(config.credentialProviders).resolve(function(err, creds) {
    //this is crazy and probably won't work.
    if (err) {
        throw ("couldn't create sts lib: " + err);
    } else {
    AWS.config.credentials = creds; // all this pain when this is all I need...wish Amazon had better examples..
    var sts = new AWS.STS();

    function StsLib() {
        
       
    }
/**
 * TODO: cache the tokenized version of the creds
 */
    StsLib.prototype.getCreds = function (acct, callback) {
        if (!acct) {
            callback("Account not specified for getCreds!");
        }
       
        /*
         * if there is no acct entry -> init
         * else if there is an acct entry but no creds -> init
         * else if there is an acct and creds but needsRefresh(expired) -> refresh
         * else just return creds 
         * 
         */
        if (! allCreds[acct] || (allCreds[acct] && ! allCreds[acct].creds) ) {
            this._initCreds(acct, function (err, creds) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, JSON.stringify(creds,null, ' '))
                }
                
            });
        } else if (allCreds[acct].creds.needsRefresh()){
            console.log("refreshing creds");
            allCreds[acct].creds.refresh(function(err) {
                console.log("refreshed creds");
                if (err) {
                    callback(err);
                } else {
                    callback(null, JSON.stringify(this._tokenizeResponse(allCreds[acct].creds), null, ' ')); 
                }
            }.bind(this))
        } else {
            callback(null, JSON.stringify(this._tokenizeResponse(allCreds[acct].creds), null, ' '));
        }
        
    };


    StsLib.prototype._initCreds = function(acct,callback) {
        var roleArn = iam.getArn(acct),
        sessionName = new Date().getTime() + "_fintojs",
        params = {
           RoleArn: roleArn,
           RoleSessionName: sessionName , //probably would be best to hash this TODO: create a sha hash per session.
        };
        if (! roleArn ) { 
            callback(new Error("Role Arn not found for " + acct + "!!"));
            return;
        }
        
        if (!acct) {
            callback("Account not specified for initCreds")
        }
       // console.log("===> arn: " + roleArn);
        try {
        sts.assumeRole(params, function(err,data) {
           if (err) {
               callback(err);
           } else {
              if (! allCreds[acct] )  {
                  allCreds[acct] = {};
              }
              allCreds[acct].creds = sts.credentialsFrom(data);
                             // console.log("sesson name: " + sessionName);
              allCreds[acct].creds.sessionName = sessionName;
                              
              callback(null, this._tokenizeResponse(allCreds[acct].creds));
           }
           
        }.bind(this));
        } catch (e) {
            callback(e);
        }
    }

    StsLib.prototype._tokenizeResponse = function(creds) {
        var responseJson = {
            "Code":            "Success",
            "LastUpdated":     new Date().toISOString(),
            "Type":            "AWS-HMAC",
            "AccessKeyId":     creds.accessKeyId,
            "SecretAccessKey": creds.secretAccessKey,
            "Token":           creds.sessionToken,
            "Expiration":      this._getExpirationDate(config.defaultExpirationTimeMs).toISOString(),
            "session_name":    creds.sessionName
        };
        return responseJson;
    };
    
    StsLib.prototype.getSessionName = function(acct,callback) {
        if (! allCreds[acct]) {
            this._initCreds(acct, function (err, creds){
                if (err) {
                    callback(err);
                } else {
                    //console.log(util.inspect(creds, {depth: null}))
                    callback(null, creds.session_name);
                }
            });
        } else
            callback(null, allCreds[acct].creds.sessionName);
       
    };
    
    StsLib.prototype._getExpirationDate = function(expiresIn) {
        var currentDateTime = new Date().getTime(),
        //console.log("current time: " + currentDateTime); 
        expireDate = new Date((currentDateTime + expiresIn))
        
        return expireDate;
    };

    module.exports = StsLib
  
    }
    
});



/**

*/