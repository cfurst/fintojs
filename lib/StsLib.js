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
    AWS.Config.credentials = creds; // all this pain when this is all I need...wish Amazon had better examples..
    

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
            console.log("creds not found initializing creds");
            this._initCreds(acct, function (err, creds) {
                console.log("creds initialized")
                if (err) {
                    callback(err);
                } else {
                    callback(null, creds)
                }
                
            });
        } else if (allCreds[acct].creds.needsRefresh()){
            console.log("refreshing creds");
            allCreds[acct].creds.refresh(this._getRefreshCallback(acct, callback))
        } else {
            console.log("credentials cache hit.. returning stored creds.");
            callback(null, JSON.stringify(this._tokenizeResponse(allCreds[acct].creds), null, ' '));
        }
        
    };


    StsLib.prototype._initCreds = function(acct,callback) {
        var roleArn = iam.getArn(acct),
        sessionName = new Date().getTime() + "_fintojs",
        params = {
           RoleArn: roleArn
        };
        if (! roleArn ) { 
            callback(new Error("Role Arn not found for " + acct + "!!"));
            return;
        }
        
        if (!acct) {
            callback(new Error("Account not specified for initCreds"));
            return;
        }
       // console.log("===> arn: " + roleArn);
        try {
            if (! allCreds[acct] )  {
                allCreds[acct] = {};
            }
            allCreds[acct].creds = new AWS.TemporaryCredentials(params,AWS.Config.credentials);
            allCreds[acct].creds.sessionName = sessionName;
            if (allCreds[acct].creds.needsRefresh()) {
                console.log("trying to refresh creds...");
                allCreds[acct].creds.refresh(this._getRefreshCallback(acct, callback))
            } else {
                console.log("new session not expired... passing back tokenized current creds.")
                callback(null, this._tokenizeResponse(allCreds[acct].creds));
            }
            
        } catch (e) {
            callback(e);
        }
    }
    
    StsLib.prototype._getRefreshCallback = function(acct, callback) {
        return function(err) {
            console.log("refreshed creds");
                if (err) {
                    callback(err);
                } else {
                    callback(null, JSON.stringify(this._tokenizeResponse(allCreds[acct].creds), null, ' ')); 
                }
        }.bind(this);
    }
        
    
    StsLib.prototype._tokenizeResponse = function(creds) {
        // console.log("tokenizing response with creds: " + util.inspect(creds, {depth: null}));
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