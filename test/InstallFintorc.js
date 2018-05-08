/**
 * InstallFintorc.js installs the .fintorc file for use with fintojs server.
 */

const
AWS                 = require('aws-sdk'),
S3                  = new AWS.S3(),
fs                  = require('fs'),
util                = require('util');
allAccountsS3bucket = 'bamazon-accounts',
allAccountsS3key    = 'all_accounts.json',
s3GetParams         = {Bucket: allAccountsS3bucket, Key: allAccountsS3key},
teamName            = process.argv[2];



if (!teamName) {
    console.error("No Teamname Provided!");
    process.exit(127);
}

function setFileName(rcHash) {
    console.log("calling set filename")
}

function writeFile(rcHash) {
    console.log('calling writeFile');
}

function printError(err) {
    console.error(err);
    process.exit(127);
}
// get the all_accounts.json file
S3.getObject(s3GetParams, (err,data) => {
    
   
    if (err) {
        console.error(err);
    } else {
        let fintorcHash  = {
                credentials: {
                    file:"",
                    profile: "identity"
                }, 
                default_role: "mlbam",
                roles: {
                    
                }
                        
            };
        try {
            let allAccountsJson = JSON.parse(data.Body),
                accounts = allAccountsJson.accounts;
               new Promise( (resolve,reject) => {
                    accounts.forEach((acct,i, accts) => {
                        if (acct.roles && acct.roles.some((ele) => {
                            return (ele.name === teamName);
                            
                        })) {
                            let roleName = (acct.namespace ? acct.namespace : acct.team ? acct.team : acct.name ? acct.name : "" );
                            console.log(`using roleName : ${roleName}`);
                            fintorcHash.roles[roleName] = `arn:aws:iam::${acct.number}:role/${teamName}`;
                        }
                        if (i === accts.length - 1) {
                           resolve(fintorcHash)
                        }
                    });
               }).then(setFileName).then(writeFile).catch(printError);
            //console.log("got json:");
            //console.log(JSON.stringify(allAccountsJson, null, " "));
        } catch(jsonErr) {
            console.error(jsonErr);
            console.log("with data: ");
            console.log(data);
        }
    }
    
});