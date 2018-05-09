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





function setFileName(rcHash) {
    console.log("setting file name...")
   if (rcHash && rcHash.credentials) {
       let fileName = `${process.env.HOME}/.aws/credentials`;
       rcHash.credentials.file = fileName;
       return rcHash;
   } else {
       throw("Couldn't set filename: Malformed fintorc Hash...");
   }
}

function writeFile (fintoRcHash) {
    let fintorcFile = `${process.env.HOME}/.fintorc`;
    console.log("attempting to write file..")
    if (fintoRcHash) {
        new Promise((resolve,reject) => {
            fs.open(fintorcFile, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL, 0o600,  (err,fd) => {
                
                
                    if (err && err.code === 'EEXIST') {
                        
                        //throw (err);
                        console.log("Found old copy of .fintorc.. backing up...")
                        fs.rename(fintorcFile, `${fintorcFile}.old`, (err) => {
                            if (err) {
                                printError(err); //can't move the old file.. abort.. abort..
                            } else {
                                reject(fintorcFile);
                            }
                        });
                        
                    } else {
                        resolve(fd)
                    }
                })
            }).then((fd) => {
                console.log("writing out fintorc file")
                fs.write(fd, JSON.stringify(fintoRcHash,null, " "), (err) => {
                    if (err) {
                        throw (err);
                    } else {
                        console.log(`.fintorc file written to ${fintorcFile}`)
                    };
                    
                })},
                (rejectFintoRcFileName) => {
                    // not really an error ... but after the move we need to write out the file
                    fs.open(rejectFintoRcFileName, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL, 0o600,  (err,fd) => {
                       if (err) {
                           console.error(err); //can't open the file at this point.. we need to end.
                           process.exit(127);
                       } else {
                           fs.write(fd, JSON.stringify(fintoRcHash,null, " "), (err) => {
                               if (err) {
                                   throw (err);
                               } else {
                                   console.log(`.fintorc file written to ${fintorcFile}`)
                               };
                       });
                       }
                }); 
            }).catch((err) => {
                    printError(err)
                    
                })
    } else {
        printError("No fintorc hash to write!")
    }
    
    
}

function printError(err) {
    console.error(err);
    process.exit(127);
}

if (!teamName) {
    printError("No Teamname provided!");
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