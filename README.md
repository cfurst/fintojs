# fintojs

An implementation of https://github.com/threadwaste/finto for nodejs 

please see the above link for docs and information on how to use.

This has not been published to npm yet (may not be...)

So clone or download, run `npm install` in the `fintojs/` directory, and then just set up the network alias as described in the docs linked above (I have only tested with `ifconfig lo0 alias..` not sure about the other stuff). After that, simply follow the directions in the `SYNOPSIS` section below to start her up.

We have some support for the command line options. `-a --addr`, `-p --port`, and `-c --config` are implemented. `-l --log` is not; see the synopsis if you need to write to a file (unix only). **You MUST add a ` -- ` at the beginning of cli options or npm will not pass the arguments to the node process (unix only). See SYNOPSIS section for an example.** 

We have not tested this on Windows or Cygwin. I'm not sure how npm behaves there. YMMV.

This is currently BETA. Please report any issues.

### SYNOPSIS
```bash
## first cd into the fintojs directory you cloned..
$ cd /path/to/clone/of/fintojs
## simple start - output to console:
$ sudo npm start
## with a log - all output will be appended to the logfile
$ FINTOJS_LOG_PATH=/absolute/path/to/log-file sudo -E npm start
## with a log - forking server to background
$ FINTOJS_LOG_PATH=/absolute/path/to/log-file sudo -E npm start &
## note on the above two examples: FINTOJS_LOG_PATH is an environment variable you can set through all the usual channels (export, .profile, .bash_profile etc) BUT
## you MUST use the -E option with sudo to inherit your current environment
## without sudo you would need to customize at least the port:
$ npm start -- -p 8080 # note the '--' it's necessary!
```
This should work with all the helpers. Please report any issues or missing features (except the logging, of course).

### LOGGING

To log your server output it's best to set the `FINTOJS_LOG_PATH` environment variable. If you set this to the absolute path of your log file, you will have all output appended to that file and you can start your server in the background. This is achieved through shell redirection rather than using a logging library. If you are planing on starting your server with elevated privileges, you will need to have `sudo` inherit your environment which you can do with the `-E` option as noted in the SYNOPSIS section above. 

### TESTING

We have a test script you can use to test your server (**on port 80 only!**) with any credentials you have. This is a good way to test to see if your configuration is working, if the server is up, etc:

```bash
## again in the fintojs directory you cloned...
$ npm test [federated-role-alias]
```
where the *federated-role-alias* is the configured key to a federated role ARN you have configured in your `.fintorc` file. This is optional. If you leave it out, it will use the default role configured in `.fintorc`
 
The report is not the greatest, you will be able to see which helpers passed or failed and then it will be your job to check logs, server output, etc to find out what's wrong. If an investigation concludes that you did everything right (or at least believe so..), and tests are still failing, open an issue ticket and describe how to reproduce the issue.

### Installing fintorc

installing fintorc is basically done also through npm:

```bash
$ npm run-script install-fintorc team-name
```
where team-name is the team name you use to switch roles. You will have to have the default identity configured or at least have the fintojs server running with a current `.fintorc`.

If you don't have `.fintorc` and you changed your profile in `~/.aws/credentials` already, setup the `AWS_PROFILE` environment variable to `identity` like so

```bash
$ AWS_PROFILE=identity npm run-script install-fintorc team-name
```

