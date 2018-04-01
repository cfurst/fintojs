/**
 * OptLibs
 * nodejs-getopt wrapper for fintojs.
 * @author Carl Yamamoto-Furst 
 */

var 
currentOptions = require('node-getopt').create([
                            ["a" , "addr=IPADDRRESS", "set a custom ip address or hostname", "169.254.169.254" ],
                            ["c", "config=CONFIGFILE-PATH", "set a custom path to your .fintorc file", process.env.HOME + "/.fintorc" ],
                            ["p", "port=PORT", "set the port number" , 80],
                            ["h", "help", "display this help"]
                            ]).bindHelp().parseSystem();



exports.getAddress = function() {
    var address = "";
    if (currentOptions.options) {
        address = currentOptions.options.a ? currentOptions.options.a : currentOptions.options.addr;
    }
    return address
}

exports.getPort = function() {
    var port = "";
    if (currentOptions.options) {
        port = currentOptions.options.p ? currentOptions.options.p : currentOptions.options.port;
    }
    return port
}

exports.getConfigFilePath = function() {
    var configFilePath = "";
    if (currentOptions.options) {
        configFilePath = currentOptions.options.c ? currentOptions.options.c : currentOptions.options.config;
    }
    return configFilePath
}

