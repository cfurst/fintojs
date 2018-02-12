/**
 * @author: Carl Yamamoto-Furst
 * @see github.com/threadwaste/finto
 * 
 * This is the library to handle the .fintorc file.
 * Default location: ~/.fintorc
 * 
 */
'use strict';
var fs = require('fs'),
util = require('util'),
config = require('./config'),
//default location

fintoRcLocation = config.rcFileDefaultLocation;

/*
 * constructor
 */
function IamArnLib(filePath) {
   
   try { 
      if (filePath) {
          this.setRcFile(filePath);
      }
     this._reload();
   } catch (e) {
       throw "ArnLib failed to load! Could not Parse: " + fintoRcLocation;
   }
   
}

/*
 * this overrides location per instance
 */
IamArnLib.prototype.setRcFile = function(filePath) {
    this.fintoRcLocation = filePath;
}

/*
 * get the rc file location for this instance
 */
IamArnLib.prototype._getRcFile = function() {
    return this.fintoRcLocation || fintoRcLocation; //return the value set in the instance or return the global variable's value
};

/*
 * get the arn string for this instance or using the acct key
 */
IamArnLib.prototype.getArn = function(acct) {
    if (acct) {
        return this.arnJson.roles[acct];
    }
    //console.log("arn json: " + this.arnJson);
    return this.arnJson.roles[this.acct];
};

/*
 * set the acct key to acct
 */
IamArnLib.prototype.setAcct = function(acct) {
    this.acct = acct;
}

/*
 * reload the fintorc file.
 */
IamArnLib.prototype._reload = function() {
    console.log("reloading arn info...")
    var iamArnJson = '';
   try {
    iamArnJson =  fs.readFileSync(this._getRcFile(), {encoding: "utf-8"}),
    this.arnJson =  JSON.parse(iamArnJson);
    //console.log("finsihed parsing arn json...");
    //console.log(JSON.stringify(this.arnJson));
   } catch (e) {
       throw ("Could not reload fintorc file: " + e);
   }
};

IamArnLib.prototype.getRoleNames = function() {
    return Object.keys(this.arnJson.roles);
}

module.exports = IamArnLib;


