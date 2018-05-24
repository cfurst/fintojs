/**
 * testing the AWS iam lib
 */
var AWS     = require('aws-sdk'),
config      = require('../lib/config'),
defaultRole = "bamazon-TeamCMS";
AWS.Config.credentials = new AWS.SharedIniFileCredentials({profile: config.identityProfileDefault});
AWS.config.credentials = new AWS.TemporaryCredentials({RoleArn: "arn:aws:iam::742465481554:role/bamazon-TeamCMS"}, AWS.Config.credentials) 

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