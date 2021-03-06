/**
 * testing the AWS iam lib
 */
var AWS     = require('aws-sdk'),
config      = require('../lib/config'),
defaultRole = "bamazon-TeamCMS";
new AWS.CredentialProviderChain(config.credentialProviders).resolve(function(err, creds) {
if (err) throw err;
AWS.Config.credentials = creds;
})

AWS.config.credentials = new AWS.TemporaryCredentials({RoleArn: ""}, AWS.Config.credentials); 

var iam     = new AWS.IAM(),
sts         = new AWS.STS();





iam.listRoles((err,data) => {
    if (err) throw err;
    else {
        data.Roles.forEach((role,idx,roles) => {
            
                iam.getRole({RoleName: role.RoleName}, (err,data) => {
                if (err) {
                    throw err;
                }
                console.log(`Role duration: ${data.MaxSessionDuration}`);
                
                });
            })
        
    }
    
})
    




/**
 * 
 
iam.getRole({RoleName: defaultRole}, (err,role) => {
    if (err) {
        throw err;
    }
    console.log (`found role ${JSON.stringify(role)}`);
    
    if (role && role.Role && role.Role.MaxSessionDuration) {
        console.log(`found a max session duration parameter ${role.Role.MaxSessionDuration}`)
    }
    
})
*/
